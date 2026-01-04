import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePatients } from '@/hooks/usePatients';
import { useSymptoms, Symptom } from '@/hooks/useSymptoms';
import { useMedicines, Medicine } from '@/hooks/useMedicines';
import { usePrescriptions, PrescriptionSymptom, PrescriptionMedicine } from '@/hooks/usePrescriptions';
import { generatePrescriptionPDF } from '@/utils/generatePrescriptionPDF';
import { useWhatsAppShare } from '@/hooks/useWhatsAppShare';
import { MedicalReportAnalyzer } from '@/components/consultation/MedicalReportAnalyzer';
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
  Loader2,
  Download,
  History,
  Calendar,
  Activity,
  Thermometer,
  Weight,
  Heart,
  Clock,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface SelectedSymptom {
  symptomId: string;
  symptom: Symptom;
  severity: 'low' | 'medium' | 'high';
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months';
}

interface SuggestedMedicine {
  medicineId: string;
  medicine: Medicine;
  dosage: string;
  duration: string;
  instructions: string;
}

interface Vitals {
  bloodPressure: string;
  temperature: string;
  weight: string;
  pulse: string;
}

interface PatientPrescription {
  id: string;
  prescription_no: string;
  created_at: string;
  symptoms: { name: string }[];
  medicines: { name: string }[];
}

// Common/frequently used symptoms for quick selection
const COMMON_SYMPTOMS = [
  'Fever',
  'Headache', 
  'Body Pain',
  'Cold & Cough',
  'Weakness',
  'Acidity',
  'Joint Pain',
  'Skin Problem',
  'Digestive Issue',
  'Anxiety',
];

export default function Consultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get('patient');
  const { shareViaWhatsAppDirect } = useWhatsAppShare();

  const { patients, loading: patientsLoading } = usePatients();
  const { symptoms, loading: symptomsLoading } = useSymptoms();
  const { medicines } = useMedicines();
  const { createPrescription, doctorInfo } = usePrescriptions();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patientIdFromUrl);
  const [patientSearch, setPatientSearch] = useState('');
  const [symptomSearch, setSymptomSearch] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [suggestedMedicines, setSuggestedMedicines] = useState<SuggestedMedicine[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpDays, setFollowUpDays] = useState(7);
  const [generating, setGenerating] = useState(false);
  
  // Vitals state
  const [vitals, setVitals] = useState<Vitals>({
    bloodPressure: '',
    temperature: '',
    weight: '',
    pulse: '',
  });
  const [showVitals, setShowVitals] = useState(false);
  
  // Patient history state
  const [patientHistory, setPatientHistory] = useState<PatientPrescription[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const patient = patients.find((p) => p.id === selectedPatientId);

  // Fetch patient history when patient is selected
  useEffect(() => {
    const fetchPatientHistory = async () => {
      if (!selectedPatientId) {
        setPatientHistory([]);
        return;
      }
      
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('prescriptions')
        .select('id, prescription_no, created_at, symptoms, medicines')
        .eq('patient_id', selectedPatientId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching patient history:', error);
      } else {
        setPatientHistory(data?.map(rx => ({
          ...rx,
          symptoms: Array.isArray(rx.symptoms) ? rx.symptoms as { name: string }[] : [],
          medicines: Array.isArray(rx.medicines) ? rx.medicines as { name: string }[] : [],
        })) || []);
      }
      setLoadingHistory(false);
    };
    
    fetchPatientHistory();
  }, [selectedPatientId]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.patient_id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredSymptoms = symptoms.filter(
    (s) =>
      s.name.toLowerCase().includes(symptomSearch.toLowerCase()) &&
      !selectedSymptoms.find((ss) => ss.symptomId === s.id)
  );

  // Get quick symptom chips that match common symptoms
  const quickSymptomChips = useMemo(() => {
    return COMMON_SYMPTOMS.map(name => {
      const symptom = symptoms.find(s => 
        s.name.toLowerCase().includes(name.toLowerCase())
      );
      return symptom;
    }).filter((s): s is Symptom => 
      s !== undefined && !selectedSymptoms.find(ss => ss.symptomId === s.id)
    );
  }, [symptoms, selectedSymptoms]);

  const groupedSymptoms = useMemo(() => {
    const groups: Record<string, Symptom[]> = {};
    filteredSymptoms.forEach((symptom) => {
      if (!groups[symptom.category]) {
        groups[symptom.category] = [];
      }
      groups[symptom.category].push(symptom);
    });
    return groups;
  }, [filteredSymptoms]);

  const addSymptom = (symptom: Symptom) => {
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

  const getSuggestions = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    const symptomIds = selectedSymptoms.map((s) => s.symptomId);

    const { data: rules, error } = await supabase
      .from('medicine_rules')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      toast.error('Failed to fetch suggestions');
      return;
    }

    const medicineMap = new Map<string, SuggestedMedicine>();

    const matchingRules = rules.filter((rule) =>
      rule.symptom_ids.some((sId: string) => symptomIds.includes(sId))
    );

    matchingRules.forEach((rule) => {
      rule.medicine_ids.forEach((medId: string) => {
        const medicine = medicines.find((m) => m.id === medId);
        if (medicine && !medicineMap.has(medId)) {
          medicineMap.set(medId, {
            medicineId: medId,
            medicine,
            dosage: rule.dosage || medicine.default_dosage || '10 drops twice daily',
            duration: rule.duration || '7 days',
            instructions: '',
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

  const addManualMedicine = (medicine: Medicine) => {
    if (suggestedMedicines.find((m) => m.medicineId === medicine.id)) {
      toast.error('Medicine already added');
      return;
    }
    setSuggestedMedicines((prev) => [
      ...prev,
      {
        medicineId: medicine.id,
        medicine,
        dosage: medicine.default_dosage || '10 drops twice daily',
        duration: '7 days',
        instructions: '',
      },
    ]);
    setShowSuggestions(true);
  };

  const generatePrescription = async () => {
    if (!patient) {
      toast.error('Please select a patient');
      return;
    }
    if (suggestedMedicines.length === 0) {
      toast.error('Please add medicines to the prescription');
      return;
    }
    if (!doctorInfo) {
      toast.error('Doctor profile not found');
      return;
    }

    setGenerating(true);

    const symptomData: PrescriptionSymptom[] = selectedSymptoms.map((ss) => ({
      id: ss.symptomId,
      name: ss.symptom.name,
      severity: ss.severity,
      duration: ss.duration,
      durationUnit: ss.durationUnit,
    }));

    const medicineData: PrescriptionMedicine[] = suggestedMedicines.map((sm) => ({
      id: sm.medicineId,
      name: sm.medicine.name,
      category: sm.medicine.category,
      dosage: sm.dosage,
      duration: sm.duration,
      instructions: sm.instructions,
    }));

    const followUpDate = addDays(new Date(), followUpDays).toISOString();
    
    // Include vitals in advice if recorded
    let fullAdvice = advice;
    if (vitals.bloodPressure || vitals.temperature || vitals.weight || vitals.pulse) {
      const vitalsText = [
        vitals.bloodPressure && `BP: ${vitals.bloodPressure}`,
        vitals.temperature && `Temp: ${vitals.temperature}°F`,
        vitals.weight && `Weight: ${vitals.weight} kg`,
        vitals.pulse && `Pulse: ${vitals.pulse} bpm`,
      ].filter(Boolean).join(', ');
      fullAdvice = `Vitals: ${vitalsText}${advice ? `\n\n${advice}` : ''}`;
    }

    const prescription = await createPrescription({
      patient_id: patient.id,
      symptoms: symptomData,
      medicines: medicineData,
      diagnosis: diagnosis || undefined,
      advice: fullAdvice || undefined,
      follow_up_date: followUpDate,
    });

    setGenerating(false);

    if (prescription) {
      generatePrescriptionPDF(
        {
          prescription_no: prescription.prescription_no,
          created_at: prescription.created_at,
          symptoms: symptomData,
          medicines: medicineData,
          diagnosis,
          advice: fullAdvice,
          follow_up_date: followUpDate,
        },
        {
          name: patient.name,
          patient_id: patient.patient_id,
          age: patient.age,
          gender: patient.gender,
          mobile: patient.mobile,
          address: patient.address,
        },
        doctorInfo
      );

      // Reset form
      setSelectedPatientId(null);
      setSelectedSymptoms([]);
      setSuggestedMedicines([]);
      setShowSuggestions(false);
      setDiagnosis('');
      setAdvice('');
      setVitals({ bloodPressure: '', temperature: '', weight: '', pulse: '' });

      navigate('/prescriptions');
    }
  };

  const handleWhatsAppShare = () => {
    if (!patient || !doctorInfo || suggestedMedicines.length === 0) return;

    const symptomData = selectedSymptoms.map((ss) => ({ name: ss.symptom.name }));
    const medicineData = suggestedMedicines.map((sm) => ({
      name: sm.medicine.name,
      dosage: sm.dosage,
      duration: sm.duration,
    }));

    shareViaWhatsAppDirect({
      prescriptionId: '',
      patientMobile: patient.mobile,
      patientName: patient.name,
      prescriptionNo: 'Draft',
      doctorName: doctorInfo.name,
      clinicName: doctorInfo.clinic_name || 'Medical Clinic',
      symptoms: symptomData,
      medicines: medicineData,
      diagnosis: diagnosis || undefined,
      advice: advice || undefined,
      followUpDate: format(addDays(new Date(), followUpDays), 'dd MMM yyyy'),
    });
  };


  if (patientsLoading || symptomsLoading) {
    return (
      <MainLayout title="New Consultation" subtitle="Record symptoms and generate prescription">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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

            {!selectedPatientId ? (
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
                      onClick={() => setSelectedPatientId(p.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.patient_id} • {p.age}y, {p.gender}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'medical-badge',
                          p.case_type === 'new'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {p.case_type === 'new' ? 'New' : 'Follow-up'}
                      </span>
                    </button>
                  ))}
                  {filteredPatients.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">No patients found</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Patient Info */}
                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{patient?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient?.patient_id} • {patient?.age}y, {patient?.gender} • {patient?.mobile}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/patient-history?patient=${patient?.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10"
                      title="View Full History"
                    >
                      <History className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => setSelectedPatientId(null)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Patient History Preview */}
                {patientHistory.length > 0 && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="flex w-full items-center justify-between text-sm font-medium text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Previous Visits ({patientHistory.length})
                      </span>
                      {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    
                    {showHistory && (
                      <div className="mt-3 space-y-2">
                        {loadingHistory ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          patientHistory.map((rx) => (
                            <div
                              key={rx.id}
                              className="rounded-lg border border-border bg-background p-2.5 text-xs"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-medium text-foreground">{rx.prescription_no}</span>
                                <span className="text-muted-foreground">
                                  {format(new Date(rx.created_at), 'dd MMM yyyy')}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {rx.symptoms.slice(0, 3).map((s, i) => (
                                  <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {s.name}
                                  </Badge>
                                ))}
                                {rx.symptoms.length > 3 && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    +{rx.symptoms.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Vitals Recording */}
          {selectedPatientId && (
            <div className="medical-card">
              <button
                onClick={() => setShowVitals(!showVitals)}
                className="flex w-full items-center justify-between"
              >
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Activity className="h-5 w-5 text-accent" />
                  Record Vitals
                  {(vitals.bloodPressure || vitals.temperature || vitals.weight || vitals.pulse) && (
                    <Badge variant="secondary" className="ml-2 text-xs">Recorded</Badge>
                  )}
                </h3>
                {showVitals ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>

              {showVitals && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Heart className="h-3.5 w-3.5 text-red-500" />
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      className="medical-input"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                      Temperature (°F)
                    </label>
                    <input
                      type="text"
                      placeholder="98.6"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                      className="medical-input"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Weight className="h-3.5 w-3.5 text-blue-500" />
                      Weight (kg)
                    </label>
                    <input
                      type="text"
                      placeholder="70"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      className="medical-input"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Activity className="h-3.5 w-3.5 text-purple-500" />
                      Pulse (bpm)
                    </label>
                    <input
                      type="text"
                      placeholder="72"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      className="medical-input"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Medical Report Analysis */}
          <MedicalReportAnalyzer 
            patientId={selectedPatientId || undefined} 
            doctorId={doctorInfo?.id} 
          />

          {/* Symptoms Selection */}
          <div className="medical-card">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Stethoscope className="h-5 w-5 text-accent" />
              Record Symptoms
            </h3>

            {/* Quick Symptom Chips */}
            {quickSymptomChips.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">Quick Add</p>
                <div className="flex flex-wrap gap-2">
                  {quickSymptomChips.slice(0, 8).map((symptom) => (
                    <button
                      key={symptom.id}
                      onClick={() => addSymptom(symptom)}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <Plus className="h-3 w-3 text-primary" />
                      {symptom.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                      onChange={(e) => updateSymptom(ss.symptomId, 'severity', e.target.value)}
                      className={cn(
                        "rounded-lg border px-2 py-1 text-sm",
                        ss.severity === 'high' && "border-red-300 bg-red-50 text-red-700",
                        ss.severity === 'medium' && "border-yellow-300 bg-yellow-50 text-yellow-700",
                        ss.severity === 'low' && "border-green-300 bg-green-50 text-green-700"
                      )}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={ss.duration}
                        onChange={(e) => updateSymptom(ss.symptomId, 'duration', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-16 rounded-lg border border-input bg-background px-2 py-1 text-sm"
                      />
                      <select
                        value={ss.durationUnit}
                        onChange={(e) => updateSymptom(ss.symptomId, 'durationUnit', e.target.value)}
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

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search and add more symptoms..."
                value={symptomSearch}
                onChange={(e) => setSymptomSearch(e.target.value)}
                className="medical-input pl-10"
              />
            </div>

            {symptomSearch && (
              <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-border bg-card p-2 scrollbar-thin">
                {Object.entries(groupedSymptoms).map(([category, categorySymptoms]) => (
                  <div key={category} className="mb-3 last:mb-0">
                    <p className="mb-1.5 px-2 text-xs font-medium text-muted-foreground uppercase">{category}</p>
                    <div className="space-y-1">
                      {categorySymptoms.map((symptom) => (
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
                  <p className="py-4 text-center text-sm text-muted-foreground">No symptoms found</p>
                )}
              </div>
            )}

            <button
              onClick={getSuggestions}
              disabled={selectedSymptoms.length === 0}
              className="mt-4 w-full medical-btn-accent disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Get Medicine Suggestions
            </button>
          </div>

          {/* Diagnosis & Advice */}
          <div className="medical-card">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Diagnosis & Advice
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Diagnosis</label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  rows={2}
                  className="medical-input resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Advice</label>
                <textarea
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="Enter advice for the patient..."
                  rows={2}
                  className="medical-input resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Follow-up After</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(parseInt(e.target.value) || 7)}
                    min="1"
                    className="w-20 medical-input"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                  <span className="ml-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(addDays(new Date(), followUpDays), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Medicine Suggestions */}
        <div className="space-y-6">
          <div className="medical-card">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Pill className="h-5 w-5 text-primary" />
              Suggested Medicines
              {suggestedMedicines.length > 0 && (
                <Badge variant="secondary" className="ml-auto">{suggestedMedicines.length}</Badge>
              )}
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
                  No matching medicines found. Add medicines manually below.
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
                                m.medicineId === pm.medicineId ? { ...m, dosage: e.target.value } : m
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
                                m.medicineId === pm.medicineId ? { ...m, duration: e.target.value } : m
                              )
                            );
                          }}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-xs text-muted-foreground">Instructions (optional)</label>
                      <input
                        type="text"
                        value={pm.instructions}
                        onChange={(e) => {
                          setSuggestedMedicines((prev) =>
                            prev.map((m) =>
                              m.medicineId === pm.medicineId ? { ...m, instructions: e.target.value } : m
                            )
                          );
                        }}
                        placeholder="e.g., Take after meals"
                        className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSuggestions && (
              <div className="mt-4 border-t border-border pt-4">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Add Medicine Manually</label>
                <select
                  onChange={(e) => {
                    const med = medicines.find((m) => m.id === e.target.value);
                    if (med) addManualMedicine(med);
                    e.target.value = '';
                  }}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>Select a medicine...</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} ({med.category})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
              <p className="text-xs text-muted-foreground">
                These are suggestions based on rules. The final prescription decision lies with the qualified doctor.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={generatePrescription}
              disabled={!patient || suggestedMedicines.length === 0 || generating}
              className="w-full medical-btn-primary disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Generate & Download PDF
            </button>
            
            {patient && suggestedMedicines.length > 0 && (
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                Share Draft via WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
