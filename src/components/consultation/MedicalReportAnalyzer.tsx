import { useState, useRef } from 'react';
import { 
  FileImage, 
  Upload, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Trash2,
  Save,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Finding {
  parameter: string;
  value: string;
  normalRange?: string;
  status: 'normal' | 'abnormal' | 'critical';
  interpretation: string;
}

interface ReportAnalysis {
  reportType: string;
  findings: Finding[];
  summary: string;
  concernAreas: string[];
  recommendations: string[];
}

interface UploadedReport {
  id: string;
  file: File;
  preview: string;
  analysis: ReportAnalysis | null;
  analyzing: boolean;
  error: string | null;
  saved: boolean;
  saving: boolean;
}

interface MedicalReportAnalyzerProps {
  patientId?: string;
  doctorId?: string;
}

const REPORT_TYPES = [
  'Blood Test',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Sonography',
  'ECG',
  'Urine Test',
  'Other',
];

export function MedicalReportAnalyzer({ patientId, doctorId }: MedicalReportAnalyzerProps) {
  const [reports, setReports] = useState<UploadedReport[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    const id = crypto.randomUUID();
    const preview = URL.createObjectURL(file);

    const newReport: UploadedReport = {
      id,
      file,
      preview,
      analysis: null,
      analyzing: false,
      error: null,
      saved: false,
      saving: false,
    };

    setReports(prev => [...prev, newReport]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Start analysis
    await analyzeReport(id, file);
  };

  const analyzeReport = async (reportId: string, file: File) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, analyzing: true, error: null } : r
    ));

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('analyze-medical-report', {
        body: {
          imageBase64: base64,
          reportType: selectedReportType || undefined,
          mimeType: file.type,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze report');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, analyzing: false, analysis: data.analysis } : r
      ));

      toast.success('Report analyzed successfully');
    } catch (error) {
      console.error('Report analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze report';
      
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, analyzing: false, error: errorMessage } : r
      ));

      toast.error(errorMessage);
    }
  };

  const removeReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      URL.revokeObjectURL(report.preview);
    }
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const retryAnalysis = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      analyzeReport(reportId, report.file);
    }
  };

  const saveReportToHistory = async (reportId: string) => {
    if (!patientId || !doctorId) {
      toast.error('Please select a patient first to save the report');
      return;
    }

    const report = reports.find(r => r.id === reportId);
    if (!report || !report.analysis) return;

    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, saving: true } : r
    ));

    try {
      // Upload file to storage
      const fileExt = report.file.name.split('.').pop();
      const fileName = `${patientId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('medical-reports')
        .upload(fileName, report.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('medical-reports')
        .getPublicUrl(fileName);

      // Save to database - using type assertion since types may not be synced yet
      const { error: dbError } = await supabase
        .from('patient_medical_reports' as any)
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          report_type: report.analysis.reportType,
          file_name: report.file.name,
          file_url: urlData.publicUrl,
          analysis: report.analysis,
        } as any);

      if (dbError) throw dbError;

      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, saving: false, saved: true } : r
      ));

      toast.success('Report saved to patient history');
    } catch (error) {
      console.error('Save report error:', error);
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, saving: false } : r
      ));
      toast.error('Failed to save report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'abnormal':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'critical':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-3.5 w-3.5" />;
      case 'abnormal':
        return <AlertCircle className="h-3.5 w-3.5" />;
      case 'critical':
        return <AlertTriangle className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="medical-card">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <FileImage className="h-5 w-5 text-primary" />
        Medical Reports Analysis
      </h3>

      {/* Report Type Selection */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Select Report Type (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedReportType(selectedReportType === type ? '' : type)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-all',
                selectedReportType === type
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="mb-4 cursor-pointer rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
      >
        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Click to upload medical report
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Blood Test, X-Ray, CT Scan, Sonography, etc. (Max 10MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Uploaded Reports */}
      {reports.length > 0 && (
        <div className="space-y-4">
          {reports.map(report => (
            <div
              key={report.id}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              {/* Report Header */}
              <div className="flex items-center gap-3 border-b border-border bg-muted/30 p-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                  <img
                    src={report.preview}
                    alt="Report"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {report.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(report.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {report.analyzing && (
                    <div className="flex items-center gap-1.5 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Analyzing...</span>
                    </div>
                  )}
                  {report.error && (
                    <button
                      onClick={() => retryAnalysis(report.id)}
                      className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    onClick={() => removeReport(report.id)}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {report.error && (
                <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {report.error}
                </div>
              )}

              {/* Analysis Results */}
              {report.analysis && (
                <div className="p-4 space-y-4">
                  {/* Report Type & Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {report.analysis.reportType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {report.analysis.summary}
                    </p>
                  </div>

                  {/* Findings */}
                  {report.analysis.findings.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-foreground">Findings</h4>
                      <div className="space-y-2">
                        {report.analysis.findings.map((finding, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'rounded-lg border p-3',
                              getStatusColor(finding.status)
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(finding.status)}
                                  <span className="font-medium">{finding.parameter}</span>
                                </div>
                                <div className="mt-1 text-sm">
                                  <span className="font-semibold">{finding.value}</span>
                                  {finding.normalRange && (
                                    <span className="text-muted-foreground">
                                      {' '}(Normal: {finding.normalRange})
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs opacity-80">
                                  {finding.interpretation}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn('text-xs capitalize', getStatusColor(finding.status))}
                              >
                                {finding.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Concern Areas */}
                  {report.analysis.concernAreas.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        Areas of Concern
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {report.analysis.concernAreas.map((concern, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-primary">
                        <CheckCircle className="h-4 w-4" />
                        Recommendations
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {report.analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Save to History Button */}
                  {patientId && doctorId && !report.saved && (
                    <Button
                      onClick={() => saveReportToHistory(report.id)}
                      disabled={report.saving}
                      className="w-full"
                      variant="outline"
                    >
                      {report.saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save to Patient History
                        </>
                      )}
                    </Button>
                  )}

                  {report.saved && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-green-500/10 py-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Saved to patient history
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
