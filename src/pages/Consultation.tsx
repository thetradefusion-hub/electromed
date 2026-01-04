import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockPatients, mockSymptoms, mockMedicines, mockRules } from '@/data/mockData';
import { SelectedSymptom, PrescriptionMedicine, Medicine } from '@/types';
import {
  User,
  Search,
  Plus,
  X,
  Pill,
  Stethoscope,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Consultation() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [symptomSearch, setSymptomSearch] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [suggestedMedicines, setSuggestedMedicines] = useState<PrescriptionMedicine[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const patient = mockPatients.find((p) => p.id === selectedPatient);

  const filteredPatients = mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.patientId.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredSymptoms = mockSymptoms.filter(
    (s) =>
      s.name.toLowerCase().includes(symptomSearch.toLowerCase()) &&
      !selectedSymptoms.find((ss) => ss.symptomId === s.id)
  );

  const groupedSymptoms = useMemo(() => {
    const groups: Record<string, typeof filteredSymptoms> = {};
    filteredSymptoms.forEach((symptom) => {
      if (!groups[symptom.category]) {
        groups[symptom.category] = [];
      }
      groups[symptom.category].push(symptom);
    });
    return groups;
  }, [filteredSymptoms]);

  const addSymptom = (symptom: typeof mockSymptoms[0]) => {
    setSelectedSymptoms((prev) => [
      ...prev,
      {
        symptomId: symptom.id,
        symptom,
        severity: 'medium',
        duration: 1,
        durationUnit: 'weeks',
      },
    ]);
    setSymptomSearch('');
  };

  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.symptomId !== symptomId));
  };

  const updateSymptom = (
    symptomId: string,
    field: keyof SelectedSymptom,
    value: string | number
  ) => {
    setSelectedSymptoms((prev) =>
      prev.map((s) => (s.symptomId === symptomId ? { ...s, [field]: value } : s))
    );
  };

  const getSuggestions = () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    const symptomIds = selectedSymptoms.map((s) => s.symptomId);
    const matchingRules = mockRules.filter((rule) =>
      rule.symptoms.some((sId) => symptomIds.includes(sId))
    );

    const medicineMap = new Map<string, PrescriptionMedicine>();

    matchingRules.forEach((rule) => {
      rule.medicines.forEach((medId) => {
        const medicine = mockMedicines.find((m) => m.id === medId);
        if (medicine && !medicineMap.has(medId)) {
          medicineMap.set(medId, {
            medicineId: medId,
            medicine,
            dosage: rule.dosage || medicine.defaultDosage,
            duration: rule.duration,
          });
        }
      });
    });

    setSuggestedMedicines(Array.from(medicineMap.values()));
    setShowSuggestions(true);
    toast.success(`Found ${medicineMap.size} medicine suggestions`);
  };

  const removeMedicine = (medicineId: string) => {
    setSuggestedMedicines((prev) => prev.filter((m) => m.medicineId !== medicineId));
  };

  const generatePrescription = () => {
    if (!patient) {
      toast.error('Please select a patient');
      return;
    }
    if (suggestedMedicines.length === 0) {
      toast.error('Please add medicines to the prescription');
      return;
    }
    toast.success('Prescription generated successfully!');
  };

  return (
    <MainLayout title="New Consultation" subtitle="Record symptoms and generate prescription">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Patient & Symptoms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          <div className="medical-card">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <User className="h-5 w-5 text-primary" />
              Select Patient
            </h3>

            {!selectedPatient ? (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search patient by name or ID..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="medical-input pl-10"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
                  {filteredPatients.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatient(p.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.patientId} • {p.age}y, {p.gender}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'medical-badge',
                          p.caseType === 'new'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {p.caseType === 'new' ? 'New' : 'Follow-up'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{patient?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient?.patientId} • {patient?.age}y, {patient?.gender} • {patient?.mobile}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Symptoms Selection */}
          <div className="medical-card">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Stethoscope className="h-5 w-5 text-accent" />
              Record Symptoms
            </h3>

            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className="mb-4 space-y-3">
                {selectedSymptoms.map((ss) => (
                  <div
                    key={ss.symptomId}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <span className="font-medium text-foreground">{ss.symptom.name}</span>
                    <select
                      value={ss.severity}
                      onChange={(e) =>
                        updateSymptom(ss.symptomId, 'severity', e.target.value)
                      }
                      className="rounded-lg border border-input bg-background px-2 py-1 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={ss.duration}
                        onChange={(e) =>
                          updateSymptom(ss.symptomId, 'duration', parseInt(e.target.value) || 1)
                        }
                        min="1"
                        className="w-16 rounded-lg border border-input bg-background px-2 py-1 text-sm"
                      />
                      <select
                        value={ss.durationUnit}
                        onChange={(e) =>
                          updateSymptom(ss.symptomId, 'durationUnit', e.target.value)
                        }
                        className="rounded-lg border border-input bg-background px-2 py-1 text-sm"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeSymptom(ss.symptomId)}
                      className="ml-auto text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Symptoms */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search and add symptoms..."
                value={symptomSearch}
                onChange={(e) => setSymptomSearch(e.target.value)}
                className="medical-input pl-10"
              />
            </div>

            {symptomSearch && (
              <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-border bg-card p-2 scrollbar-thin">
                {Object.entries(groupedSymptoms).map(([category, symptoms]) => (
                  <div key={category} className="mb-3 last:mb-0">
                    <p className="mb-1.5 px-2 text-xs font-medium text-muted-foreground uppercase">
                      {category}
                    </p>
                    <div className="space-y-1">
                      {symptoms.map((symptom) => (
                        <button
                          key={symptom.id}
                          onClick={() => addSymptom(symptom)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                        >
                          <Plus className="h-4 w-4 text-primary" />
                          <span className="text-foreground">{symptom.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedSymptoms).length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No symptoms found
                  </p>
                )}
              </div>
            )}

            {/* Get Suggestions Button */}
            <button
              onClick={getSuggestions}
              disabled={selectedSymptoms.length === 0}
              className="mt-4 w-full medical-btn-accent disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Get Medicine Suggestions
            </button>
          </div>
        </div>

        {/* Right Panel - Medicine Suggestions */}
        <div className="space-y-6">
          <div className="medical-card">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Pill className="h-5 w-5 text-primary" />
              Suggested Medicines
            </h3>

            {!showSuggestions ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Pill className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Select symptoms and click "Get Medicine Suggestions" to see recommendations
                </p>
              </div>
            ) : suggestedMedicines.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
                  <AlertCircle className="h-8 w-8 text-warning" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No matching medicines found for the selected symptoms
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestedMedicines.map((pm) => (
                  <div
                    key={pm.medicineId}
                    className="rounded-lg border border-border p-3 transition-all hover:border-primary/30"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{pm.medicine.name}</p>
                        <p className="text-xs text-muted-foreground">{pm.medicine.category}</p>
                      </div>
                      <button
                        onClick={() => removeMedicine(pm.medicineId)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Dosage</label>
                        <input
                          type="text"
                          value={pm.dosage}
                          onChange={(e) => {
                            setSuggestedMedicines((prev) =>
                              prev.map((m) =>
                                m.medicineId === pm.medicineId
                                  ? { ...m, dosage: e.target.value }
                                  : m
                              )
                            );
                          }}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Duration</label>
                        <input
                          type="text"
                          value={pm.duration}
                          onChange={(e) => {
                            setSuggestedMedicines((prev) =>
                              prev.map((m) =>
                                m.medicineId === pm.medicineId
                                  ? { ...m, duration: e.target.value }
                                  : m
                              )
                            );
                          }}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer & Actions */}
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
              <p className="text-xs text-muted-foreground">
                These are suggestions based on rules. The final prescription decision lies with the
                qualified doctor.
              </p>
            </div>
          </div>

          <button
            onClick={generatePrescription}
            disabled={!patient || suggestedMedicines.length === 0}
            className="w-full medical-btn-primary disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            Generate Prescription
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
