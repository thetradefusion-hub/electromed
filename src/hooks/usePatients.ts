import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Patient {
  id: string;
  patient_id: string;
  doctor_id: string;
  name: string;
  age: number;
  gender: string;
  mobile: string;
  address: string | null;
  case_type: string;
  visit_date: string;
  created_at: string;
  updated_at: string;
}

export interface PatientFormData {
  name: string;
  age: number;
  gender: string;
  mobile: string;
  address?: string;
  case_type: string;
}

export const usePatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Fetch doctor ID for current user
  useEffect(() => {
    const fetchDoctorId = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching doctor:', error);
        return;
      }
      
      setDoctorId(data?.id ?? null);
    };

    fetchDoctorId();
  }, [user]);

  // Fetch patients
  const fetchPatients = async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } else {
      setPatients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (doctorId) {
      fetchPatients();
    }
  }, [doctorId]);

  // Generate unique patient ID
  const generatePatientId = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const prefix = `EH-${year}-`;
    
    // Get the highest patient_id for this year
    const { data } = await supabase
      .from('patients')
      .select('patient_id')
      .like('patient_id', `${prefix}%`)
      .order('patient_id', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastId = data[0].patient_id;
      const lastNumber = parseInt(lastId.split('-').pop() || '0', 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  };

  // Create patient
  const createPatient = async (formData: PatientFormData): Promise<boolean> => {
    if (!doctorId) {
      toast.error('Doctor profile not found');
      return false;
    }

    const patientId = await generatePatientId();

    const { error } = await supabase.from('patients').insert({
      patient_id: patientId,
      doctor_id: doctorId,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      mobile: formData.mobile,
      address: formData.address || null,
      case_type: formData.case_type,
    });

    if (error) {
      console.error('Error creating patient:', error);
      toast.error('Failed to register patient');
      return false;
    }

    toast.success(`Patient registered with ID: ${patientId}`);
    await fetchPatients();
    return true;
  };

  // Update patient
  const updatePatient = async (id: string, formData: Partial<PatientFormData>): Promise<boolean> => {
    const { error } = await supabase
      .from('patients')
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient');
      return false;
    }

    toast.success('Patient updated successfully');
    await fetchPatients();
    return true;
  };

  // Delete patient
  const deletePatient = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
      return false;
    }

    toast.success('Patient deleted successfully');
    await fetchPatients();
    return true;
  };

  // Update visit date (for follow-ups)
  const recordVisit = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('patients')
      .update({
        visit_date: new Date().toISOString(),
        case_type: 'old',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error recording visit:', error);
      toast.error('Failed to record visit');
      return false;
    }

    toast.success('Visit recorded');
    await fetchPatients();
    return true;
  };

  return {
    patients,
    loading,
    doctorId,
    createPatient,
    updatePatient,
    deletePatient,
    recordVisit,
    refetch: fetchPatients,
  };
};
