import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MedicineRule {
  id: string;
  name: string;
  description: string | null;
  symptom_ids: string[];
  medicine_ids: string[];
  dosage: string;
  duration: string;
  priority: number;
  is_global: boolean;
  created_at: string;
}

interface Symptom {
  id: string;
  name: string;
  category: string;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
}

const RulesManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<MedicineRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symptom_ids: [] as string[],
    medicine_ids: [] as string[],
    dosage: '',
    duration: '',
    priority: 1,
  });
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['admin-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine_rules')
        .select('*')
        .eq('is_global', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as MedicineRule[];
    },
  });

  const { data: symptoms } = useQuery({
    queryKey: ['all-symptoms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('symptoms')
        .select('id, name, category')
        .eq('is_global', true)
        .order('name');

      if (error) throw error;
      return data as Symptom[];
    },
  });

  const { data: medicines } = useQuery({
    queryKey: ['all-medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('id, name, category')
        .eq('is_global', true)
        .order('name');

      if (error) throw error;
      return data as Medicine[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('medicine_rules').insert({
        name: data.name,
        description: data.description || null,
        symptom_ids: data.symptom_ids,
        medicine_ids: data.medicine_ids,
        dosage: data.dosage,
        duration: data.duration,
        priority: data.priority,
        is_global: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rules'] });
      toast.success('Rule added successfully');
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to add rule');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('medicine_rules')
        .update({
          name: data.name,
          description: data.description || null,
          symptom_ids: data.symptom_ids,
          medicine_ids: data.medicine_ids,
          dosage: data.dosage,
          duration: data.duration,
          priority: data.priority,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rules'] });
      toast.success('Rule updated successfully');
      setEditingRule(null);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to update rule');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medicine_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rules'] });
      toast.success('Rule deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete rule');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      symptom_ids: [],
      medicine_ids: [],
      dosage: '',
      duration: '',
      priority: 1,
    });
  };

  const handleEdit = (rule: MedicineRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      symptom_ids: rule.symptom_ids || [],
      medicine_ids: rule.medicine_ids || [],
      dosage: rule.dosage,
      duration: rule.duration,
      priority: rule.priority,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.dosage || !formData.duration) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.symptom_ids.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }
    if (formData.medicine_ids.length === 0) {
      toast.error('Please select at least one medicine');
      return;
    }

    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const toggleSymptom = (symptomId: string) => {
    setFormData((prev) => ({
      ...prev,
      symptom_ids: prev.symptom_ids.includes(symptomId)
        ? prev.symptom_ids.filter((id) => id !== symptomId)
        : [...prev.symptom_ids, symptomId],
    }));
  };

  const toggleMedicine = (medicineId: string) => {
    setFormData((prev) => ({
      ...prev,
      medicine_ids: prev.medicine_ids.includes(medicineId)
        ? prev.medicine_ids.filter((id) => id !== medicineId)
        : [...prev.medicine_ids, medicineId],
    }));
  };

  const getSymptomNames = (ids: string[]) => {
    return ids
      .map((id) => symptoms?.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getMedicineNames = (ids: string[]) => {
    return ids
      .map((id) => medicines?.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const filteredRules = rules?.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSymptomNames(rule.symptom_ids).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getMedicineNames(rule.medicine_ids).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Medicine Rules Engine</CardTitle>
            <CardDescription>Map symptoms to recommended medicines with priority-based suggestions</CardDescription>
          </div>
          <Dialog
            open={isAddDialogOpen || !!editingRule}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingRule(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{editingRule ? 'Edit Rule' : 'Add New Rule'}</DialogTitle>
                <DialogDescription>
                  {editingRule ? 'Update the rule details' : 'Create a rule to map symptoms to medicines'}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Rule Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Fever Treatment"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority (Higher = First)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min={1}
                        max={100}
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="When to apply this rule..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage *</Label>
                      <Input
                        id="dosage"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        placeholder="e.g., 10 drops, 3 times daily"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration *</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Symptoms (select symptoms that trigger this rule) *</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                      {symptoms?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No symptoms available. Add symptoms first.</p>
                      ) : (
                        symptoms?.map((symptom) => (
                          <div key={symptom.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`symptom-${symptom.id}`}
                              checked={formData.symptom_ids.includes(symptom.id)}
                              onCheckedChange={() => toggleSymptom(symptom.id)}
                            />
                            <label htmlFor={`symptom-${symptom.id}`} className="text-sm cursor-pointer flex-1">
                              {symptom.name}
                              <span className="text-muted-foreground ml-2">({symptom.category})</span>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {formData.symptom_ids.length > 0 && (
                      <p className="text-xs text-muted-foreground">{formData.symptom_ids.length} symptom(s) selected</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Medicines (select medicines to recommend) *</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                      {medicines?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No medicines available. Add medicines first.</p>
                      ) : (
                        medicines?.map((medicine) => (
                          <div key={medicine.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`medicine-${medicine.id}`}
                              checked={formData.medicine_ids.includes(medicine.id)}
                              onCheckedChange={() => toggleMedicine(medicine.id)}
                            />
                            <label htmlFor={`medicine-${medicine.id}`} className="text-sm cursor-pointer flex-1">
                              {medicine.name}
                              <span className="text-muted-foreground ml-2">({medicine.category})</span>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {formData.medicine_ids.length > 0 && (
                      <p className="text-xs text-muted-foreground">{formData.medicine_ids.length} medicine(s) selected</p>
                    )}
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={addMutation.isPending || updateMutation.isPending}>
                  {editingRule ? 'Update' : 'Add'} Rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <ArrowUpDown className="h-4 w-4" />
                  </TableHead>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Symptoms</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No rules found. Add symptoms and medicines first, then create rules.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRules?.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Badge variant="outline">{rule.priority}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {rule.symptom_ids.slice(0, 2).map((id) => {
                            const symptom = symptoms?.find((s) => s.id === id);
                            return symptom ? (
                              <Badge key={id} variant="secondary" className="text-xs">
                                {symptom.name}
                              </Badge>
                            ) : null;
                          })}
                          {rule.symptom_ids.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{rule.symptom_ids.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {rule.medicine_ids.slice(0, 2).map((id) => {
                            const medicine = medicines?.find((m) => m.id === id);
                            return medicine ? (
                              <Badge key={id} className="text-xs">
                                {medicine.name}
                              </Badge>
                            ) : null;
                          })}
                          {rule.medicine_ids.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{rule.medicine_ids.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{rule.dosage}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{rule.duration}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RulesManagement;
