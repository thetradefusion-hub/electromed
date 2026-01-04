import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

interface DashboardStats {
  totalPatients: number;
  todayPatients: number;
  pendingFollowUps: number;
  totalPrescriptions: number;
}

export function useDashboardStats(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-stats', doctorId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!doctorId) {
        return {
          totalPatients: 0,
          todayPatients: 0,
          pendingFollowUps: 0,
          totalPrescriptions: 0,
        };
      }

      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();
      const weekEnd = endOfWeek(today).toISOString();

      // Fetch all stats in parallel
      const [
        totalPatientsResult,
        todayPatientsResult,
        pendingFollowUpsResult,
        totalPrescriptionsResult,
      ] = await Promise.all([
        // Total patients
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId),
        
        // Today's patients (visited today)
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .gte('visit_date', todayStart)
          .lte('visit_date', todayEnd),
        
        // Pending follow-ups (follow_up_date is in the future or this week)
        supabase
          .from('prescriptions')
          .select('id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .gte('follow_up_date', todayStart)
          .lte('follow_up_date', weekEnd),
        
        // Total prescriptions
        supabase
          .from('prescriptions')
          .select('id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId),
      ]);

      return {
        totalPatients: totalPatientsResult.count ?? 0,
        todayPatients: todayPatientsResult.count ?? 0,
        pendingFollowUps: pendingFollowUpsResult.count ?? 0,
        totalPrescriptions: totalPrescriptionsResult.count ?? 0,
      };
    },
    enabled: !!doctorId,
  });
}
