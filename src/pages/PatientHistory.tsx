import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { 
  Loader2, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Stethoscope, 
  Pill,
  Activity,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  AlertCircle,
  Printer,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Json } from '@/integrations/supabase/types';
import { generatePatientHistoryPDF } from '@/utils/generatePatientHistoryPDF';
import { toast } from 'sonner';

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  mobile: string;
  address: string | null;
  case_type: string;
  visit_date: string;
  created_at: string;
}

interface PrescriptionSymptom {
  id: string;
  name: string;
  severity: string;
  duration: number;
  durationUnit: string;
}

interface PrescriptionMedicine {
  id: string;
  name: string;
  category: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

interface Prescription {
  id: string;
  prescription_no: string;
  symptoms: PrescriptionSymptom[];
  medicines: PrescriptionMedicine[];
  diagnosis: string | null;
  advice: string | null;
  follow_up_date: string | null;
  created_at: string;
}

interface TimelineEvent {
  id: string;
  type: 'registration' | 'prescription' | 'followup';
  date: string;
  data: Prescription | null;
}

const parseJsonArray = <T,>(data: Json | null | undefined): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data as unknown as T[];
  return [];
};

export default function PatientHistory() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient');
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [doctorInfo, setDoctorInfo] = useState<{
    name: string;
    clinic_name: string | null;
    clinic_address: string | null;
    qualification: string;
    registration_no: string;
    specialization: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .maybeSingle();

      if (patientError || !patientData) {
        console.error('Error fetching patient:', patientError);
        setLoading(false);
        return;
      }

      setPatient(patientData);

      // Fetch prescriptions for this patient
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (prescriptionsError) {
        console.error('Error fetching prescriptions:', prescriptionsError);
      } else {
        const parsed = (prescriptionsData || []).map((rx) => ({
          ...rx,
          symptoms: parseJsonArray<PrescriptionSymptom>(rx.symptoms),
          medicines: parseJsonArray<PrescriptionMedicine>(rx.medicines),
        }));
        setPrescriptions(parsed);
      }

      // Fetch doctor info for PDF
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('clinic_name, clinic_address, qualification, registration_no, specialization')
        .eq('user_id', user.id)
        .maybeSingle();

      if (doctorData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', user.id)
          .maybeSingle();

        setDoctorInfo({
          ...doctorData,
          name: profileData?.name || 'Doctor',
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [patientId, user]);

  const handleDownloadPDF = () => {
    if (!patient || !doctorInfo) {
      toast.error('Unable to generate report. Please try again.');
      return;
    }

    generatePatientHistoryPDF(patient, prescriptions, doctorInfo);
    toast.success('Patient history report downloaded');
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Build timeline events
  const timelineEvents: TimelineEvent[] = [
    // Add registration event
    ...(patient
      ? [
          {
            id: 'registration',
            type: 'registration' as const,
            date: patient.created_at,
            data: null,
          },
        ]
      : []),
    // Add prescription events
    ...prescriptions.map((rx) => ({
      id: rx.id,
      type: 'prescription' as const,
      date: rx.created_at,
      data: rx,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <MainLayout title="Patient History" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!patient) {
    return (
      <MainLayout title="Patient History" subtitle="Patient not found">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Patient Not Found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            The patient you're looking for doesn't exist or you don't have access.
          </p>
          <Link to="/patients">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Patient History" 
      subtitle={`Complete medical timeline for ${patient.name}`}
    >
      {/* Back Button */}
      <Link to="/patients" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Patients
      </Link>

      {/* Patient Info Card */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{patient.name}</h2>
              <p className="text-sm text-muted-foreground">{patient.patient_id}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{patient.age} years</span>
                <span>•</span>
                <span className="capitalize">{patient.gender}</span>
                <Badge variant={patient.case_type === 'new' ? 'default' : 'secondary'}>
                  {patient.case_type === 'new' ? 'New Case' : 'Follow-up'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{patient.mobile}</span>
            </div>
            {patient.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{patient.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last visit: {format(new Date(patient.visit_date), 'dd MMM yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{prescriptions.length}</p>
            <p className="text-xs text-muted-foreground">Total Prescriptions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {prescriptions.reduce((acc, rx) => acc + rx.symptoms.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Symptoms Treated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {prescriptions.reduce((acc, rx) => acc + rx.medicines.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Medicines Prescribed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {prescriptions.filter((rx) => rx.follow_up_date).length}
            </p>
            <p className="text-xs text-muted-foreground">Follow-ups Scheduled</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
          <Link to={`/consultation?patient=${patient.id}`}>
            <Button className="gap-2">
              <Stethoscope className="h-4 w-4" />
              New Consultation
            </Button>
          </Link>
          <Link to={`/prescriptions?patient=${patient.id}`}>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              View All Prescriptions
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" className="gap-2 print:hidden" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Medical Timeline</h3>
        <p className="text-sm text-muted-foreground">Complete history of visits and treatments</p>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-1 text-lg font-semibold">No History Yet</h3>
          <p className="text-sm text-muted-foreground">
            Start a consultation to begin tracking patient history.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 h-full w-0.5 bg-border sm:left-8" />

          <div className="space-y-6">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative flex gap-4 sm:gap-6">
                {/* Timeline dot */}
                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-background sm:h-16 sm:w-16',
                    event.type === 'registration'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  {event.type === 'registration' ? (
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-2">
                  <div
                    className={cn(
                      'rounded-xl border border-border bg-card p-4 transition-all',
                      event.type === 'prescription' && 'cursor-pointer hover:border-primary/50'
                    )}
                    onClick={() => event.type === 'prescription' && toggleExpand(event.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">
                            {event.type === 'registration'
                              ? 'Patient Registered'
                              : `Prescription ${event.data?.prescription_no}`}
                          </h4>
                          {event.type === 'prescription' && event.data?.follow_up_date && (
                            <Badge variant="outline" className="text-xs">
                              Follow-up scheduled
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {format(new Date(event.date), 'EEEE, dd MMMM yyyy • hh:mm a')}
                        </p>
                      </div>
                      {event.type === 'prescription' && (
                        <button className="text-muted-foreground hover:text-foreground">
                          {expandedItems.has(event.id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Registration summary */}
                    {event.type === 'registration' && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        First visit recorded as a {patient.case_type} case.
                      </p>
                    )}

                    {/* Prescription summary (always visible) */}
                    {event.type === 'prescription' && event.data && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                          <Activity className="h-3 w-3" />
                          {event.data.symptoms.length} symptom
                          {event.data.symptoms.length !== 1 && 's'}
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                          <Pill className="h-3 w-3" />
                          {event.data.medicines.length} medicine
                          {event.data.medicines.length !== 1 && 's'}
                        </div>
                        {event.data.diagnosis && (
                          <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                            {event.data.diagnosis}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expanded prescription details */}
                    {event.type === 'prescription' &&
                      event.data &&
                      expandedItems.has(event.id) && (
                        <div className="mt-4 space-y-4 border-t border-border pt-4 animate-fade-in">
                          {/* Symptoms */}
                          {event.data.symptoms.length > 0 && (
                            <div>
                              <h5 className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Activity className="h-4 w-4 text-primary" />
                                Symptoms
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {event.data.symptoms.map((symptom) => (
                                  <div
                                    key={symptom.id}
                                    className="rounded-lg bg-secondary px-3 py-1.5 text-sm"
                                  >
                                    <span className="font-medium">{symptom.name}</span>
                                    <span className="text-muted-foreground">
                                      {' '}
                                      • {symptom.severity} • {symptom.duration} {symptom.durationUnit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Medicines */}
                          {event.data.medicines.length > 0 && (
                            <div>
                              <h5 className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Pill className="h-4 w-4 text-primary" />
                                Medicines Prescribed
                              </h5>
                              <div className="space-y-2">
                                {event.data.medicines.map((medicine) => (
                                  <div
                                    key={medicine.id}
                                    className="rounded-lg bg-secondary px-3 py-2 text-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{medicine.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {medicine.category}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-muted-foreground">
                                      {medicine.dosage} • {medicine.duration}
                                      {medicine.instructions && ` • ${medicine.instructions}`}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Advice */}
                          {event.data.advice && (
                            <div>
                              <h5 className="mb-2 text-sm font-medium">Advice</h5>
                              <p className="text-sm text-muted-foreground">{event.data.advice}</p>
                            </div>
                          )}

                          {/* Follow-up */}
                          {event.data.follow_up_date && (
                            <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-sm">
                              <Calendar className="h-4 w-4 text-accent" />
                              <span>
                                Follow-up scheduled for{' '}
                                <span className="font-medium">
                                  {format(new Date(event.data.follow_up_date), 'dd MMM yyyy')}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
