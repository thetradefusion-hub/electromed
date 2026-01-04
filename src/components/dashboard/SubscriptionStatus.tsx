import { Crown, Calendar, Users, Brain, ArrowUpRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

export function SubscriptionStatus() {
  const { 
    subscription, 
    usage, 
    isLoading, 
    isTrialActive, 
    daysUntilRenewal,
    patientLimitReached,
    aiQuotaReached,
    planName 
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="medical-card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const plan = subscription?.plan;
  const patientUsagePercent = plan?.patient_limit 
    ? Math.min(100, ((usage?.patientsCount || 0) / plan.patient_limit) * 100)
    : 0;
  const aiUsagePercent = plan?.ai_analysis_quota
    ? Math.min(100, ((usage?.aiAnalysisCount || 0) / plan.ai_analysis_quota) * 100)
    : 0;

  return (
    <div className="medical-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            planName === 'Enterprise' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
            planName === 'Professional' ? 'bg-gradient-to-br from-primary to-accent' :
            'bg-gradient-to-br from-gray-400 to-gray-600'
          }`}>
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{planName} Plan</h3>
            <p className="text-sm text-muted-foreground">
              {isTrialActive ? (
                <span className="text-warning">Trial Active</span>
              ) : subscription ? (
                <>Renews {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}</>
              ) : (
                'No active subscription'
              )}
            </p>
          </div>
        </div>
        <Link
          to="/settings?tab=subscription"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Upgrade
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Usage Stats */}
      <div className="space-y-4">
        {/* Patients Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Patients</span>
            </div>
            <span className={`font-medium ${patientLimitReached ? 'text-destructive' : 'text-foreground'}`}>
              {usage?.patientsCount || 0} / {plan?.patient_limit || '∞'}
            </span>
          </div>
          {plan?.patient_limit && (
            <Progress 
              value={patientUsagePercent} 
              className={`h-2 ${patientLimitReached ? '[&>div]:bg-destructive' : ''}`}
            />
          )}
        </div>

        {/* AI Analysis Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">AI Analysis</span>
            </div>
            <span className={`font-medium ${aiQuotaReached ? 'text-destructive' : 'text-foreground'}`}>
              {usage?.aiAnalysisCount || 0} / {plan?.ai_analysis_quota || '∞'}
            </span>
          </div>
          {plan?.ai_analysis_quota && (
            <Progress 
              value={aiUsagePercent} 
              className={`h-2 ${aiQuotaReached ? '[&>div]:bg-destructive' : ''}`}
            />
          )}
        </div>

        {/* Renewal Info */}
        {subscription && daysUntilRenewal <= 7 && daysUntilRenewal > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-sm">
            <Calendar className="h-4 w-4 text-warning" />
            <span className="text-warning">
              {daysUntilRenewal} days until renewal
            </span>
          </div>
        )}

        {/* Limit Warnings */}
        {patientLimitReached && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
            <Users className="h-4 w-4 text-destructive" />
            <span className="text-destructive">
              Patient limit reached. Upgrade to add more.
            </span>
          </div>
        )}

        {aiQuotaReached && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
            <Brain className="h-4 w-4 text-destructive" />
            <span className="text-destructive">
              AI analysis quota exhausted. Upgrade for more.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
