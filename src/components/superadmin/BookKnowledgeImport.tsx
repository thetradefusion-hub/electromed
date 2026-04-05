import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, FileText, Image, Loader2, BookOpen, Check, ArrowRight, Pill, Stethoscope, Save, Trash2 } from 'lucide-react';

interface ExtractedRule {
  name: string;
  description: string;
  symptoms: string[];
  symptomCategory: string;
  medicines: string[];
  medicineCategory: string;
  dosage: string;
  duration: string;
  priority: number;
  selected?: boolean;
}

interface ExtractedSymptom {
  name: string;
  category: string;
  description: string;
}

interface ExtractedMedicine {
  name: string;
  category: string;
  indications: string;
  defaultDosage: string;
}

export default function BookKnowledgeImport() {
  const queryClient = useQueryClient();
  const [uploadMode, setUploadMode] = useState<'image' | 'text'>('image');
  const [textContent, setTextContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedRules, setExtractedRules] = useState<ExtractedRule[]>([]);
  const [extractedSymptoms, setExtractedSymptoms] = useState<ExtractedSymptom[]>([]);
  const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicine[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsExtracting(true);
    setExtractedRules([]);
    setExtractedSymptoms([]);
    setExtractedMedicines([]);

    try {
      let content: string;
      let contentType: string;

      if (file.type.startsWith('image/')) {
        // Convert image to base64 data URL
        const buffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        content = `data:${file.type};base64,${base64}`;
        contentType = 'image';
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        content = await file.text();
        contentType = 'text';
      } else {
        toast.error('Supported formats: Images (JPG, PNG) and Text files (.txt)');
        setIsExtracting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('extract-book-knowledge', {
        body: { content, contentType, fileName: file.name },
      });

      if (error) throw error;

      if (data?.data) {
        const rules = (data.data.rules || []).map((r: ExtractedRule) => ({ ...r, selected: true }));
        setExtractedRules(rules);
        setExtractedSymptoms(data.data.extractedSymptoms || []);
        setExtractedMedicines(data.data.extractedMedicines || []);
        toast.success(`${rules.length} rules extracted successfully!`);
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      toast.error(err.message || 'Failed to extract knowledge');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleTextExtract = useCallback(async () => {
    if (!textContent.trim()) {
      toast.error('Please enter some text content');
      return;
    }

    setIsExtracting(true);
    setExtractedRules([]);
    setExtractedSymptoms([]);
    setExtractedMedicines([]);

    try {
      const { data, error } = await supabase.functions.invoke('extract-book-knowledge', {
        body: { content: textContent, contentType: 'text', fileName: 'manual-input.txt' },
      });

      if (error) throw error;

      if (data?.data) {
        const rules = (data.data.rules || []).map((r: ExtractedRule) => ({ ...r, selected: true }));
        setExtractedRules(rules);
        setExtractedSymptoms(data.data.extractedSymptoms || []);
        setExtractedMedicines(data.data.extractedMedicines || []);
        toast.success(`${rules.length} rules extracted!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to extract');
    } finally {
      setIsExtracting(false);
    }
  }, [textContent]);

  const toggleRule = (index: number) => {
    setExtractedRules(prev =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const saveToDatabase = useCallback(async () => {
    const selectedRules = extractedRules.filter(r => r.selected);
    if (selectedRules.length === 0) {
      toast.error('No rules selected to save');
      return;
    }

    setIsSaving(true);
    try {
      // Step 1: Ensure symptoms exist, get their IDs
      const symptomMap = new Map<string, string>();
      for (const symptom of extractedSymptoms) {
        const { data: existing } = await supabase
          .from('symptoms')
          .select('id, name')
          .ilike('name', symptom.name)
          .limit(1);

        if (existing && existing.length > 0) {
          symptomMap.set(symptom.name.toLowerCase(), existing[0].id);
        } else {
          const { data: created, error } = await supabase
            .from('symptoms')
            .insert({
              name: symptom.name,
              category: symptom.category || 'General',
              description: symptom.description || null,
              is_global: true,
            })
            .select('id')
            .single();

          if (error) {
            console.error('Symptom insert error:', error);
            continue;
          }
          if (created) symptomMap.set(symptom.name.toLowerCase(), created.id);
        }
      }

      // Step 2: Ensure medicines exist, get their IDs
      const medicineMap = new Map<string, string>();
      for (const med of extractedMedicines) {
        const { data: existing } = await supabase
          .from('medicines')
          .select('id, name')
          .ilike('name', med.name)
          .limit(1);

        if (existing && existing.length > 0) {
          medicineMap.set(med.name.toLowerCase(), existing[0].id);
        } else {
          const { data: created, error } = await supabase
            .from('medicines')
            .insert({
              name: med.name,
              category: med.category || 'General',
              indications: med.indications || null,
              default_dosage: med.defaultDosage || null,
              is_global: true,
            })
            .select('id')
            .single();

          if (error) {
            console.error('Medicine insert error:', error);
            continue;
          }
          if (created) medicineMap.set(med.name.toLowerCase(), created.id);
        }
      }

      // Step 3: Create medicine rules
      let savedCount = 0;
      for (const rule of selectedRules) {
        const symptomIds = rule.symptoms
          .map(s => symptomMap.get(s.toLowerCase()))
          .filter(Boolean) as string[];

        const medicineIds = rule.medicines
          .map(m => medicineMap.get(m.toLowerCase()))
          .filter(Boolean) as string[];

        if (symptomIds.length === 0 || medicineIds.length === 0) {
          console.warn('Skipping rule - no matching IDs:', rule.name);
          continue;
        }

        const { error } = await supabase.from('medicine_rules').insert({
          name: rule.name,
          description: rule.description || null,
          symptom_ids: symptomIds,
          medicine_ids: medicineIds,
          dosage: rule.dosage || 'As directed',
          duration: rule.duration || '7 days',
          priority: rule.priority || 5,
          is_global: true,
        });

        if (error) {
          console.error('Rule insert error:', error);
          continue;
        }
        savedCount++;
      }

      toast.success(`${savedCount} rules saved to knowledge base!`);
      setExtractedRules([]);
      setExtractedSymptoms([]);
      setExtractedMedicines([]);
      setTextContent('');
      setFileName('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [extractedRules, extractedSymptoms, extractedMedicines]);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Book / Reference Material Import
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload book pages (images), text files, or paste text — AI will extract symptom-medicine rules automatically
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'image' | 'text')}>
            <TabsList>
              <TabsTrigger value="image" className="gap-2">
                <Image className="h-4 w-4" />
                Image / File Upload
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2">
                <FileText className="h-4 w-4" />
                Paste Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="mt-4">
              <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium text-foreground">Upload Book Page or Text File</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG images or .txt files (max 10MB)</p>
                </div>
                <Input
                  type="file"
                  accept="image/*,.txt"
                  onChange={handleFileUpload}
                  disabled={isExtracting}
                  className="max-w-xs"
                />
                {fileName && (
                  <p className="text-sm text-muted-foreground">Selected: {fileName}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-4 space-y-4">
              <Textarea
                placeholder="Paste book content or medical reference text here...&#10;&#10;Example:&#10;For fever and body ache, use S5 (Scrofoloso-5) with dosage of 5 drops 3 times daily for 5 days.&#10;For skin rashes and itching, apply C1 externally and take C3 internally..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <Button onClick={handleTextExtract} disabled={isExtracting || !textContent.trim()}>
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Extract Rules
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>

          {isExtracting && (
            <div className="mt-6 flex items-center gap-3 rounded-lg bg-primary/5 p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium text-foreground">AI is analyzing the content...</p>
                <p className="text-sm text-muted-foreground">Extracting symptoms, medicines, and rules</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Results */}
      {extractedRules.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{extractedRules.length}</p>
                  <p className="text-sm text-muted-foreground">Rules Found</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Stethoscope className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{extractedSymptoms.length}</p>
                  <p className="text-sm text-muted-foreground">Symptoms</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Pill className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{extractedMedicines.length}</p>
                  <p className="text-sm text-muted-foreground">Medicines</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rules List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Extracted Rules — Review & Save</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExtractedRules(prev => prev.map(r => ({ ...r, selected: true })))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExtractedRules(prev => prev.map(r => ({ ...r, selected: false })))}
                >
                  Deselect All
                </Button>
                <Button onClick={saveToDatabase} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save {extractedRules.filter(r => r.selected).length} Rules
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {extractedRules.map((rule, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 transition-colors cursor-pointer ${
                    rule.selected ? 'border-primary/50 bg-primary/5' : 'border-border opacity-60'
                  }`}
                  onClick={() => toggleRule(index)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        rule.selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {rule.selected ? <Check className="h-3 w-3" /> : index + 1}
                      </div>
                      <span className="font-semibold text-foreground">{rule.name}</span>
                    </div>
                    <Badge variant="secondary">Priority: {rule.priority}</Badge>
                  </div>

                  {rule.description && (
                    <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                  )}

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Symptoms</p>
                      <div className="flex flex-wrap gap-1">
                        {rule.symptoms.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Medicines</p>
                      <div className="flex flex-wrap gap-1">
                        {rule.medicines.map((m, i) => (
                          <Badge key={i} className="text-xs bg-primary/10 text-primary border-primary/30">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span>Dosage: <strong className="text-foreground">{rule.dosage}</strong></span>
                    <span>Duration: <strong className="text-foreground">{rule.duration}</strong></span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Clear Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setExtractedRules([]);
                setExtractedSymptoms([]);
                setExtractedMedicines([]);
                setFileName('');
              }}
            >
              <Trash2 className="h-4 w-4" />
              Clear Results
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
