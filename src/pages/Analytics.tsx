import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { TopMedicines } from '@/components/dashboard/TopMedicines';
import {
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Activity,
  PieChart,
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

const patientTrend = [
  { month: 'Jan', patients: 45 },
  { month: 'Feb', patients: 52 },
  { month: 'Mar', patients: 48 },
  { month: 'Apr', patients: 70 },
  { month: 'May', patients: 61 },
  { month: 'Jun', patients: 75 },
  { month: 'Jul', patients: 82 },
  { month: 'Aug', patients: 91 },
  { month: 'Sep', patients: 78 },
  { month: 'Oct', patients: 95 },
  { month: 'Nov', patients: 88 },
  { month: 'Dec', patients: 102 },
];

const diseaseDistribution = [
  { name: 'Digestive', count: 145 },
  { name: 'Respiratory', count: 98 },
  { name: 'Neurological', count: 76 },
  { name: 'Musculoskeletal', count: 65 },
  { name: 'Dermatological', count: 42 },
  { name: 'Other', count: 31 },
];

const weeklyPatients = [
  { day: 'Mon', patients: 12 },
  { day: 'Tue', patients: 15 },
  { day: 'Wed', patients: 8 },
  { day: 'Thu', patients: 18 },
  { day: 'Fri', patients: 14 },
  { day: 'Sat', patients: 22 },
  { day: 'Sun', patients: 6 },
];

export default function Analytics() {
  return (
    <MainLayout title="Analytics" subtitle="Track your clinic performance and trends">
      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={457}
          subtitle="All time"
          icon={Users}
          trend={{ value: 18, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="This Month"
          value={102}
          subtitle="New registrations"
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
          variant="accent"
        />
        <StatCard
          title="Prescriptions"
          value={342}
          subtitle="Generated"
          icon={FileText}
        />
        <StatCard
          title="Follow-up Rate"
          value="78%"
          subtitle="Patient retention"
          icon={Activity}
          variant="warning"
        />
      </div>

      {/* Charts Grid */}
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientTrend}>
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
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disease Distribution */}
        <div className="medical-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Disease Distribution</h3>
              <p className="text-sm text-muted-foreground">By symptom category</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <PieChart className="h-5 w-5 text-accent" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseDistribution} layout="vertical">
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyPatients}>
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
          </div>
        </div>

        {/* Top Medicines */}
        <TopMedicines />
      </div>
    </MainLayout>
  );
}
