import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface PrescriptionSymptom {
  id: string;
  name: string;
  severity: string;
  duration: number;
  durationUnit: string;
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  category: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  prescription_no: string;
  patient_id: string;
  doctor_id: string;
  symptoms: PrescriptionSymptom[];
  medicines: PrescriptionMedicine[];
  diagnosis: string | null;
  advice: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    patient_id: string;
    name: string;
    age: number;
    gender: string;
    mobile: string;
    address: string | null;
  };
}

export interface CreatePrescriptionData {
  patient_id: string;
  symptoms: PrescriptionSymptom[];
  medicines: PrescriptionMedicine[];
  diagnosis?: string;
  advice?: string;
  follow_up_date?: string;
}

const parseJsonArray = <T>(data: Json | null | undefined): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data as unknown as T[];
  return [];
};

export const usePrescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<{
    id: string;
    name: string;
    clinic_name: string | null;
    clinic_address: string | null;
    qualification: string;
    registration_no: string;
    specialization: string;
  } | null>(null);

  // Fetch doctor info
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!user) return;

      const { data: doctorData, error } = await supabase
        .from('doctors')
        .select('id, clinic_name, clinic_address, qualification, registration_no, specialization')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching doctor:', error);
        return;
      }

      if (doctorData) {
        // Fetch profile for name
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', user.id)
          .maybeSingle();

        setDoctorId(doctorData.id);
        setDoctorInfo({
          ...doctorData,
          name: profileData?.name || 'Doctor',
        });
      }
    };

    fetchDoctor();
  }, [user]);

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patients(id, patient_id, name, age, gender, mobile, address)
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } else {
      const parsed = (data || []).map((rx) => ({
        ...rx,
        symptoms: parseJsonArray<PrescriptionSymptom>(rx.symptoms),
        medicines: parseJsonArray<PrescriptionMedicine>(rx.medicines),
      }));
      setPrescriptions(parsed);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (doctorId) {
      fetchPrescriptions();
    }
  }, [doctorId]);

  // Generate prescription number
  const generatePrescriptionNo = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const prefix = `RX-${year}-`;

    const { data } = await supabase
      .from('prescriptions')
      .select('prescription_no')
      .like('prescription_no', `${prefix}%`)
      .order('prescription_no', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNo = data[0].prescription_no;
      const lastNumber = parseInt(lastNo.split('-').pop() || '0', 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  };

  // Create prescription
  const createPrescription = async (formData: CreatePrescriptionData): Promise<Prescription | null> => {
    if (!doctorId) {
      toast.error('Doctor profile not found');
      return null;
    }

    const prescriptionNo = await generatePrescriptionNo();

    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        prescription_no: prescriptionNo,
        patient_id: formData.patient_id,
        doctor_id: doctorId,
        symptoms: formData.symptoms as unknown as Json,
        medicines: formData.medicines as unknown as Json,
        diagnosis: formData.diagnosis || null,
        advice: formData.advice || null,
        follow_up_date: formData.follow_up_date || null,
      })
      .select(`
        *,
        patient:patients(id, patient_id, name, age, gender, mobile, address)
      `)
      .single();

    if (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
      return null;
    }

    toast.success(`Prescription ${prescriptionNo} created successfully`);
    await fetchPrescriptions();
    
    return {
      ...data,
      symptoms: parseJsonArray<PrescriptionSymptom>(data.symptoms),
      medicines: parseJsonArray<PrescriptionMedicine>(data.medicines),
    };
  };

  // Get prescription by ID
  const getPrescription = async (id: string): Promise<Prescription | null> => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patients(id, patient_id, name, age, gender, mobile, address)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      ...data,
      symptoms: parseJsonArray<PrescriptionSymptom>(data.symptoms),
      medicines: parseJsonArray<PrescriptionMedicine>(data.medicines),
    };
  };

  return {
    prescriptions,
    loading,
    doctorId,
    doctorInfo,
    createPrescription,
    getPrescription,
    refetch: fetchPrescriptions,
  };
};
