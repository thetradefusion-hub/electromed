import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from './useDoctor';

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number | null;
  patient_limit: number | null;
  doctor_limit: number | null;
  ai_analysis_quota: number | null;
  features: any;
}

interface Subscription {
  id: string;
  doctor_id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  plan: SubscriptionPlan;
}

interface UsageStats {
  patientsCount: number;
  prescriptionsCount: number;
  aiAnalysisCount: number;
}

export function useSubscription() {
  const { doctorId } = useDoctor();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', doctorId],
    queryFn: async () => {
      if (!doctorId) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('doctor_id', doctorId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data as Subscription | null;
    },
    enabled: !!doctorId,
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-stats', doctorId],
    queryFn: async () => {
      if (!doctorId) return { patientsCount: 0, prescriptionsCount: 0, aiAnalysisCount: 0 };

      const [patientsRes, prescriptionsRes, reportsRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('doctor_id', doctorId),
        supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('doctor_id', doctorId),
        supabase.from('patient_medical_reports').select('id', { count: 'exact', head: true }).eq('doctor_id', doctorId),
      ]);

      return {
        patientsCount: patientsRes.count || 0,
        prescriptionsCount: prescriptionsRes.count || 0,
        aiAnalysisCount: reportsRes.count || 0,
      } as UsageStats;
    },
    enabled: !!doctorId,
  });

  const isTrialActive = subscription?.trial_ends_at 
    ? new Date(subscription.trial_ends_at) > new Date() 
    : false;

  const daysUntilRenewal = subscription?.current_period_end
    ? Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const patientLimitReached = subscription?.plan?.patient_limit 
    ? (usage?.patientsCount || 0) >= subscription.plan.patient_limit 
    : false;

  const aiQuotaReached = subscription?.plan?.ai_analysis_quota
    ? (usage?.aiAnalysisCount || 0) >= subscription.plan.ai_analysis_quota
    : false;

  return {
    subscription,
    usage,
    isLoading: subscriptionLoading || usageLoading,
    isTrialActive,
    daysUntilRenewal,
    patientLimitReached,
    aiQuotaReached,
    planName: subscription?.plan?.name || 'Free',
  };
}
