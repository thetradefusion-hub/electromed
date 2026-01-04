import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';
import { isBefore, startOfDay } from 'date-fns';

interface FollowUp {
  id: string;
  prescriptionNo: string;
  followUpDate: Date;
  diagnosis: string | null;
  patientId: string;
  patientName: string;
  patientMobile: string;
  patientPatientId: string;
  status: 'pending' | 'completed' | 'missed';
}

export function useFollowUps() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['follow-ups', doctorId],
    queryFn: async (): Promise<FollowUp[]> => {
      if (!doctorId) return [];

      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          id,
          prescription_no,
          follow_up_date,
          diagnosis,
          patient_id,
          patients (
            id,
            name,
            mobile,
            patient_id
          )
        `)
        .eq('doctor_id', doctorId)
        .not('follow_up_date', 'is', null)
        .order('follow_up_date', { ascending: true });

      if (error) {
        console.error('Error fetching follow-ups:', error);
        throw error;
      }

      const today = startOfDay(new Date());

      return (data || []).map((prescription: any) => {
        const followUpDate = new Date(prescription.follow_up_date);
        const isPast = isBefore(followUpDate, today);
        
        return {
          id: prescription.id,
          prescriptionNo: prescription.prescription_no,
          followUpDate,
          diagnosis: prescription.diagnosis,
          patientId: prescription.patient_id,
          patientName: prescription.patients?.name || 'Unknown',
          patientMobile: prescription.patients?.mobile || '',
          patientPatientId: prescription.patients?.patient_id || '',
          status: isPast ? 'missed' : 'pending',
        };
      });
    },
    enabled: !!doctorId,
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (prescriptionId: string) => {
      // Clear the follow-up date to mark as completed
      const { error } = await supabase
        .from('prescriptions')
        .update({ follow_up_date: null })
        .eq('id', prescriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', doctorId] });
    },
  });

  const cancelFollowUpMutation = useMutation({
    mutationFn: async (prescriptionId: string) => {
      const { error } = await supabase
        .from('prescriptions')
        .update({ follow_up_date: null })
        .eq('id', prescriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', doctorId] });
    },
  });

  return {
    followUps,
    isLoading,
    markComplete: markCompleteMutation.mutate,
    cancelFollowUp: cancelFollowUpMutation.mutate,
    isMarkingComplete: markCompleteMutation.isPending,
    isCancelling: cancelFollowUpMutation.isPending,
  };
}
