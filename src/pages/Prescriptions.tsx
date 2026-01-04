import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePrescriptions, Prescription } from '@/hooks/usePrescriptions';
import { generatePrescriptionPDF } from '@/utils/generatePrescriptionPDF';
import { exportPrescriptionsToCSV } from '@/utils/exportUtils';
import { Search, FileText, Download, Printer, Eye, Calendar, User, Pill, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Prescriptions() {
  const { prescriptions, loading, doctorInfo } = usePrescriptions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const filteredPrescriptions = prescriptions.filter(
    (rx) =>
      rx.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.prescription_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadPDF = (rx: Prescription) => {
    if (!rx.patient || !doctorInfo) return;

    generatePrescriptionPDF(
      {
        prescription_no: rx.prescription_no,
        created_at: rx.created_at,
        symptoms: rx.symptoms,
        medicines: rx.medicines,
        diagnosis: rx.diagnosis,
        advice: rx.advice,
        follow_up_date: rx.follow_up_date,
      },
      {
        name: rx.patient.name,
        patient_id: rx.patient.patient_id,
        age: rx.patient.age,
        gender: rx.patient.gender,
        mobile: rx.patient.mobile,
        address: rx.patient.address,
      },
      doctorInfo
    );
  };

  const handlePrint = (rx: Prescription) => {
    handleDownloadPDF(rx);
  };

  if (loading) {
    return (
      <MainLayout title="Prescriptions" subtitle="View and manage generated prescriptions">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Prescriptions" subtitle="View and manage generated prescriptions">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Prescriptions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by patient name or prescription ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="medical-input pl-10"
              />
            </div>
            <button
              onClick={() => {
                exportPrescriptionsToCSV(prescriptions);
                toast.success('Prescriptions exported to CSV');
              }}
              disabled={prescriptions.length === 0}
              className="medical-btn-secondary"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">No prescriptions found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search query' : 'Create your first prescription from the Consultation page'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrescriptions.map((rx, index) => (
                <div
                  key={rx.id}
                  onClick={() => setSelectedPrescription(rx)}
                  className={cn(
                    'medical-card cursor-pointer animate-fade-in',
                    selectedPrescription?.id === rx.id && 'ring-2 ring-primary'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                        <FileText className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{rx.prescription_no}</p>
                        <p className="text-sm text-muted-foreground">{rx.patient?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(rx.created_at), 'dd MMM yyyy')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rx.medicines.length} medicines
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {rx.symptoms.slice(0, 3).map((symptom) => (
                      <span key={symptom.id} className="medical-badge-primary">
                        {symptom.name}
                      </span>
                    ))}
                    {rx.symptoms.length > 3 && (
                      <span className="medical-badge">+{rx.symptoms.length - 3} more</span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {rx.patient?.patient_id}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrescription(rx);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint(rx);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(rx);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prescription Preview */}
        <div className="medical-card sticky top-24 h-fit">
          {selectedPrescription && selectedPrescription.patient ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="border-b border-border pb-4 text-center">
                <h2 className="text-lg font-bold text-primary">{doctorInfo?.clinic_name || 'Medical Clinic'}</h2>
                {doctorInfo?.clinic_address && (
                  <p className="text-xs text-muted-foreground">{doctorInfo.clinic_address}</p>
                )}
                <div className="mt-2 flex items-center justify-center gap-4 text-xs">
                  <span>{doctorInfo?.name}</span>
                  <span>•</span>
                  <span>{doctorInfo?.qualification}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reg. No: {doctorInfo?.registration_no}
                </p>
              </div>

              {/* Patient Info */}
              <div className="rounded-lg bg-secondary/50 p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedPrescription.patient.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="font-medium">{selectedPrescription.patient.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Age/Gender</p>
                    <p className="font-medium">
                      {selectedPrescription.patient.age}y / {selectedPrescription.patient.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedPrescription.created_at), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              {selectedPrescription.symptoms.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                    Symptoms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrescription.symptoms.map((s) => (
                      <span key={s.id} className="medical-badge-accent">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              {selectedPrescription.diagnosis && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground uppercase">
                    Diagnosis
                  </p>
                  <p className="text-sm text-foreground">{selectedPrescription.diagnosis}</p>
                </div>
              )}

              {/* Medicines */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Rx - Medicines
                </p>
                <div className="space-y-2">
                  {selectedPrescription.medicines.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-start gap-2 rounded-lg border border-border p-2"
                    >
                      <Pill className="mt-0.5 h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{med.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {med.dosage} • {med.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              {selectedPrescription.advice && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground uppercase">
                    Advice
                  </p>
                  <p className="text-sm text-foreground">{selectedPrescription.advice}</p>
                </div>
              )}

              {/* Follow-up */}
              {selectedPrescription.follow_up_date && (
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                  <p className="text-xs font-medium text-accent">Follow-up Date</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(selectedPrescription.follow_up_date), 'EEEE, dd MMMM yyyy')}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePrint(selectedPrescription)}
                  className="flex-1 medical-btn-secondary"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button 
                  onClick={() => handleDownloadPDF(selectedPrescription)}
                  className="flex-1 medical-btn-primary"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                Select a Prescription
              </h3>
              <p className="text-sm text-muted-foreground">
                Click on a prescription to preview details
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
