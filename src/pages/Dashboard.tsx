import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentPatients } from '@/components/dashboard/RecentPatients';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingFollowups } from '@/components/dashboard/UpcomingFollowups';
import { TopMedicines } from '@/components/dashboard/TopMedicines';
import { mockDashboardStats } from '@/data/mockData';
import { Users, UserPlus, CalendarCheck, FileText, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <MainLayout title="Dashboard" subtitle="Welcome back, Dr. Rajesh Kumar">
      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={mockDashboardStats.totalPatients}
          subtitle="All time registrations"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Today's Patients"
          value={mockDashboardStats.todayPatients}
          subtitle="Consultations today"
          icon={UserPlus}
          variant="accent"
        />
        <StatCard
          title="Pending Follow-ups"
          value={mockDashboardStats.pendingFollowUps}
          subtitle="Scheduled this week"
          icon={CalendarCheck}
          variant="warning"
        />
        <StatCard
          title="Prescriptions"
          value={mockDashboardStats.totalPrescriptions}
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
        {/* Left Column - Recent Patients */}
        <div className="lg:col-span-2 space-y-6">
          <RecentPatients />
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          <QuickActions />
          <UpcomingFollowups />
          <TopMedicines />
        </div>
      </div>
    </MainLayout>
  );
}
