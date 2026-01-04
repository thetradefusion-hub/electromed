import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDoctor } from '@/hooks/useDoctor';
import { exportAnalyticsToPDF } from '@/utils/exportUtils';
import {
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Activity,
  PieChart,
  Loader2,
  Pill,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { toast } from 'sonner';

export default function Analytics() {
  const { data: analytics, isLoading } = useAnalytics();
  const { doctorInfo } = useDoctor();

  const followUpRate = analytics && analytics.totalPatients > 0
    ? Math.round((analytics.totalPrescriptions / analytics.totalPatients) * 100)
    : 0;

  const handleExportPDF = () => {
    if (!analytics) return;
    exportAnalyticsToPDF(analytics, doctorInfo?.name || 'Doctor');
    toast.success('Analytics report exported to PDF');
  };

  return (
    <MainLayout 
      title="Analytics" 
      subtitle="Track your clinic performance and trends"
      action={
        <button
          onClick={handleExportPDF}
          disabled={isLoading || !analytics}
          className="medical-btn-secondary"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      }
    >
      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : analytics?.totalPatients ?? 0}
          subtitle="All time"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="This Month"
          value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : analytics?.thisMonthPatients ?? 0}
          subtitle="New registrations"
          icon={TrendingUp}
          variant="accent"
        />
        <StatCard
          title="Prescriptions"
          value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : analytics?.totalPrescriptions ?? 0}
          subtitle="Generated"
          icon={FileText}
        />
        <StatCard
          title="Prescription Rate"
          value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${followUpRate}%`}
          subtitle="Per patient"
          icon={Activity}
          variant="warning"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Patient Trend */}
          <div className="medical-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Patient Trend</h3>
                <p className="text-sm text-muted-foreground">Monthly patient registrations</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="h-64">
              {analytics?.monthlyTrend && analytics.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                      name="Patients"
                    />
                    <Line
                      type="monotone"
                      dataKey="prescriptions"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--accent))' }}
                      name="Prescriptions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No data available yet
                </div>
              )}
            </div>
          </div>

          {/* Symptom Categories */}
          <div className="medical-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Symptom Categories</h3>
                <p className="text-sm text-muted-foreground">Most common conditions</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <PieChart className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="h-64">
              {analytics?.symptomCategories && analytics.symptomCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.symptomCategories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No prescription data yet
                </div>
              )}
            </div>
          </div>

          {/* Weekly Overview */}
          <div className="medical-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Weekly Overview</h3>
                <p className="text-sm text-muted-foreground">Patients by day of week</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
            </div>
            <div className="h-64">
              {analytics?.weeklyOverview ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.weeklyOverview}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Top Medicines */}
          <div className="medical-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Top Medicines</h3>
                <p className="text-sm text-muted-foreground">Most prescribed medicines</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Pill className="h-5 w-5 text-primary" />
              </div>
            </div>
            {analytics?.topMedicines && analytics.topMedicines.length > 0 ? (
              <div className="space-y-3">
                {analytics.topMedicines.map((medicine, index) => (
                  <div key={medicine.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <span className="font-medium text-foreground">{medicine.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{medicine.count} prescriptions</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                No prescription data yet
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
