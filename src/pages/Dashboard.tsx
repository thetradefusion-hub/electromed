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
      <div className="mb-4 sm:mb-6">
        <SubscriptionStatus />
      </div>

      {/* Stats Grid */}
      <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : stats?.totalPatients ?? 0}
          subtitle="All time"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Today's Patients"
          value={isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : stats?.todayPatients ?? 0}
          subtitle="Consultations"
          icon={UserPlus}
          variant="accent"
        />
        <StatCard
          title="Follow-ups"
          value={isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : stats?.pendingFollowUps ?? 0}
          subtitle="This week"
          icon={CalendarCheck}
          variant="warning"
        />
        <StatCard
          title="Prescriptions"
          value={isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : stats?.totalPrescriptions ?? 0}
          subtitle="Total"
          icon={FileText}
        />
      </div>

      {/* Disclaimer Banner */}
      <div className="mb-4 sm:mb-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3 sm:p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-warning" />
        <div>
          <p className="text-xs sm:text-sm font-medium text-foreground">Medical Disclaimer</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            This software provides suggestions based on symptoms. Final prescription decision lies with the doctor.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left Column - Recent Patients & Activity */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <RecentPatients />
          <ActivityTimeline />
        </div>

        {/* Right Column - Quick Actions, Follow-ups, Support */}
        <div className="space-y-4 sm:space-y-6">
          <QuickActions />
          <UpcomingFollowups />
          <TopMedicines />
          <SupportWidget />
        </div>
      </div>
    </MainLayout>
  );
}
