import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentPatients } from '@/components/dashboard/RecentPatients';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingFollowups } from '@/components/dashboard/UpcomingFollowups';
import { TopMedicines } from '@/components/dashboard/TopMedicines';
import { SubscriptionStatus } from '@/components/dashboard/SubscriptionStatus';
import { SupportWidget } from '@/components/dashboard/SupportWidget';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDoctor } from '@/hooks/useDoctor';
import { Users, UserPlus, CalendarCheck, FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { doctorId, doctorInfo, loading: doctorLoading } = useDoctor();
  const { data: stats, isLoading: statsLoading } = useDashboardStats(doctorId ?? undefined);

  const isLoading = doctorLoading || statsLoading;
  const doctorName = doctorInfo?.name || 'Doctor';

  return (
    <MainLayout title="Dashboard" subtitle={`Welcome back, ${doctorName}`}>
      {/* Subscription Status Banner */}
      <div className="mb-6">
        <SubscriptionStatus />
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalPatients ?? 0}
          subtitle="All time registrations"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Today's Patients"
          value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.todayPatients ?? 0}
          subtitle="Consultations today"
          icon={UserPlus}
          variant="accent"
        />
        <StatCard
          title="Pending Follow-ups"
          value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.pendingFollowUps ?? 0}
          subtitle="Scheduled this week"
          icon={CalendarCheck}
          variant="warning"
        />
        <StatCard
          title="Prescriptions"
          value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalPrescriptions ?? 0}
          subtitle="Total generated"
          icon={FileText}
        />
      </div>

      {/* Disclaimer Banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium text-foreground">Medical Disclaimer</p>
          <p className="text-xs text-muted-foreground">
            This software provides medicine suggestions based on symptoms and predefined rules. The final prescription decision lies with the qualified doctor. Always verify suggestions before prescribing.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Recent Patients & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <RecentPatients />
          <ActivityTimeline />
        </div>

        {/* Right Column - Quick Actions, Follow-ups, Support */}
        <div className="space-y-6">
          <QuickActions />
          <UpcomingFollowups />
          <TopMedicines />
          <SupportWidget />
        </div>
      </div>
    </MainLayout>
  );
}
