import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockPatients, currentDoctor } from '@/data/mockData';
import { Search, FileText, Download, Printer, Eye, Calendar, User, Pill } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const mockPrescriptions = [
  {
    id: 'rx-001',
    prescriptionNo: 'RX-2024-001',
    patient: mockPatients[0],
    doctor: currentDoctor,
    symptoms: ['Headache', 'Acidity'],
    medicines: [
      { name: 'S1 (Scrofoloso)', dosage: '10 drops twice daily', duration: '15 days' },
      { name: 'A3 (Antisifilitico)', dosage: '10 drops after meals', duration: '15 days' },
    ],
    diagnosis: 'Digestive disorder with associated headache',
    advice: 'Avoid spicy food, drink plenty of water, take rest',
    followUpDate: new Date(Date.now() + 86400000 * 15),
    createdAt: new Date(),
  },
  {
    id: 'rx-002',
    prescriptionNo: 'RX-2024-002',
    patient: mockPatients[1],
    doctor: currentDoctor,
    symptoms: ['Cold & Cough', 'Fever'],
    medicines: [
      { name: 'F1 (Febrifugo)', dosage: '15 drops every 4 hours', duration: '5 days' },
      { name: 'P1 (Pettorale)', dosage: '10 drops thrice daily', duration: '7 days' },
    ],
    diagnosis: 'Acute respiratory infection',
    advice: 'Complete bed rest, warm fluids, steam inhalation',
    followUpDate: new Date(Date.now() + 86400000 * 7),
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'rx-003',
    prescriptionNo: 'RX-2024-003',
    patient: mockPatients[2],
    doctor: currentDoctor,
    symptoms: ['Joint Pain', 'Back Pain'],
    medicines: [
      { name: 'S1 (Scrofoloso)', dosage: '10 drops thrice daily', duration: '21 days' },
      { name: 'A1 (Antiscrofoloso)', dosage: '15 drops twice daily', duration: '21 days' },
    ],
    diagnosis: 'Musculoskeletal inflammation',
    advice: 'Light exercise, avoid heavy lifting, apply warm compress',
    followUpDate: new Date(Date.now() + 86400000 * 21),
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
];

export default function Prescriptions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<typeof mockPrescriptions[0] | null>(null);

  const filteredPrescriptions = mockPrescriptions.filter(
    (rx) =>
      rx.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.prescriptionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout title="Prescriptions" subtitle="View and manage generated prescriptions">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Prescriptions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by patient name or prescription ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="medical-input pl-10"
            />
          </div>

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
                      <p className="font-semibold text-foreground">{rx.prescriptionNo}</p>
                      <p className="text-sm text-muted-foreground">{rx.patient.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(rx.createdAt, 'dd MMM yyyy')}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rx.medicines.length} medicines
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {rx.symptoms.map((symptom) => (
                    <span key={symptom} className="medical-badge-primary">
                      {symptom}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    {rx.patient.patientId}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                      <Printer className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescription Preview */}
        <div className="medical-card sticky top-24 h-fit">
          {selectedPrescription ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="border-b border-border pb-4 text-center">
                <h2 className="text-lg font-bold text-primary">{currentDoctor.clinicName}</h2>
                <p className="text-xs text-muted-foreground">{currentDoctor.clinicAddress}</p>
                <div className="mt-2 flex items-center justify-center gap-4 text-xs">
                  <span>{currentDoctor.name}</span>
                  <span>•</span>
                  <span>{currentDoctor.qualification}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reg. No: {currentDoctor.registrationNo}
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
                    <p className="font-medium">{selectedPrescription.patient.patientId}</p>
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
                      {format(selectedPrescription.createdAt, 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Symptoms
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPrescription.symptoms.map((s) => (
                    <span key={s} className="medical-badge-accent">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground uppercase">
                  Diagnosis
                </p>
                <p className="text-sm text-foreground">{selectedPrescription.diagnosis}</p>
              </div>

              {/* Medicines */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Rx - Medicines
                </p>
                <div className="space-y-2">
                  {selectedPrescription.medicines.map((med, i) => (
                    <div
                      key={i}
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
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground uppercase">
                  Advice
                </p>
                <p className="text-sm text-foreground">{selectedPrescription.advice}</p>
              </div>

              {/* Follow-up */}
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                <p className="text-xs font-medium text-accent">Follow-up Date</p>
                <p className="text-sm font-medium text-foreground">
                  {format(selectedPrescription.followUpDate, 'EEEE, dd MMMM yyyy')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 medical-btn-secondary">
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button className="flex-1 medical-btn-primary">
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
