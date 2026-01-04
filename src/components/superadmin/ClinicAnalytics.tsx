import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Pill, Stethoscope, TrendingUp, Calendar, FileText, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

const COLORS = ['hsl(226, 71%, 40%)', 'hsl(162, 91%, 31%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 65%, 60%)'];

const ClinicAnalytics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-analytics-enhanced'],
    queryFn: async () => {
      const [doctorsResult, patientsResult, prescriptionsResult, symptomsResult, medicinesResult] = await Promise.all([
        supabase.from('doctors').select('id, created_at'),
        supabase.from('patients').select('id, created_at, case_type, gender'),
        supabase.from('prescriptions').select('id, created_at, doctor_id'),
        supabase.from('symptoms').select('id', { count: 'exact' }).eq('is_global', true),
        supabase.from('medicines').select('id', { count: 'exact' }).eq('is_global', true),
      ]);

      const today = startOfDay(new Date());
      const last30Days = subDays(today, 30);
      const last7Days = subDays(today, 7);

      // Calculate daily patient registrations for last 30 days
      const dailyPatients = eachDayOfInterval({ start: last30Days, end: today }).map(date => {
        const dayStr = format(date, 'yyyy-MM-dd');
        const count = patientsResult.data?.filter(p => 
          format(new Date(p.created_at), 'yyyy-MM-dd') === dayStr
        ).length || 0;
        return { date: format(date, 'MMM dd'), patients: count };
      });

      // Calculate daily prescriptions for last 30 days
      const dailyPrescriptions = eachDayOfInterval({ start: last30Days, end: today }).map(date => {
        const dayStr = format(date, 'yyyy-MM-dd');
        const count = prescriptionsResult.data?.filter(p => 
          format(new Date(p.created_at), 'yyyy-MM-dd') === dayStr
        ).length || 0;
        return { date: format(date, 'MMM dd'), prescriptions: count };
      });

      // Weekly comparison
      const thisWeekPatients = patientsResult.data?.filter(p => new Date(p.created_at) >= last7Days).length || 0;
      const lastWeekStart = subDays(last7Days, 7);
      const lastWeekPatients = patientsResult.data?.filter(p => {
        const date = new Date(p.created_at);
        return date >= lastWeekStart && date < last7Days;
      }).length || 0;

      // Case type distribution
      const newCases = patientsResult.data?.filter(p => p.case_type === 'new').length || 0;
      const followUpCases = patientsResult.data?.filter(p => p.case_type === 'old').length || 0;

      // Gender distribution
      const malePatients = patientsResult.data?.filter(p => p.gender?.toLowerCase() === 'male').length || 0;
      const femalePatients = patientsResult.data?.filter(p => p.gender?.toLowerCase() === 'female').length || 0;
      const otherPatients = (patientsResult.data?.length || 0) - malePatients - femalePatients;

      // Doctor with most patients
      const doctorPatientCounts: Record<string, number> = {};
      prescriptionsResult.data?.forEach(rx => {
        doctorPatientCounts[rx.doctor_id] = (doctorPatientCounts[rx.doctor_id] || 0) + 1;
      });

      // Today's stats
      const todayPatients = patientsResult.data?.filter(p => new Date(p.created_at) >= today).length || 0;
      const todayPrescriptions = prescriptionsResult.data?.filter(p => new Date(p.created_at) >= today).length || 0;

      return {
        totalDoctors: doctorsResult.data?.length || 0,
        totalPatients: patientsResult.data?.length || 0,
        totalPrescriptions: prescriptionsResult.data?.length || 0,
        todayPatients,
        todayPrescriptions,
        globalSymptoms: symptomsResult.count || 0,
        globalMedicines: medicinesResult.count || 0,
        dailyPatients,
        dailyPrescriptions,
        thisWeekPatients,
        lastWeekPatients,
        weeklyGrowth: lastWeekPatients > 0 
          ? Math.round(((thisWeekPatients - lastWeekPatients) / lastWeekPatients) * 100) 
          : thisWeekPatients > 0 ? 100 : 0,
        caseDistribution: [
          { name: 'New Cases', value: newCases },
          { name: 'Follow-ups', value: followUpCases },
        ],
        genderDistribution: [
          { name: 'Male', value: malePatients },
          { name: 'Female', value: femalePatients },
          { name: 'Other', value: otherPatients },
        ].filter(g => g.value > 0),
      };
    },
  });

  const analyticsCards = [
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors || 0,
      icon: Users,
      description: 'Registered doctors',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: UserPlus,
      description: 'All-time patients',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Prescriptions',
      value: stats?.totalPrescriptions || 0,
      icon: FileText,
      description: 'All-time prescriptions',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: "Today's Visits",
      value: stats?.todayPatients || 0,
      icon: Calendar,
      description: 'New patients today',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Global Symptoms',
      value: stats?.globalSymptoms || 0,
      icon: Stethoscope,
      description: 'Symptom library',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Global Medicines',
      value: stats?.globalMedicines || 0,
      icon: Pill,
      description: 'Medicine library',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {analyticsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Patient Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Patient Registration Trend
            </CardTitle>
            <CardDescription>Daily new patient registrations (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailyPatients || []}>
                  <defs>
                    <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(226, 71%, 40%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(226, 71%, 40%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stroke="hsl(226, 71%, 40%)"
                    strokeWidth={2}
                    fill="url(#patientGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Prescription Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Prescription Trend
            </CardTitle>
            <CardDescription>Daily prescriptions issued (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.dailyPrescriptions || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar 
                    dataKey="prescriptions" 
                    fill="hsl(162, 91%, 31%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Weekly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Weekly Growth
            </CardTitle>
            <CardDescription>Patient comparison with last week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="text-2xl font-bold">{stats?.thisWeekPatients}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Week</span>
                <span className="text-lg font-medium text-muted-foreground">{stats?.lastWeekPatients}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Growth</span>
                <span className={`text-lg font-bold ${(stats?.weeklyGrowth || 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {(stats?.weeklyGrowth || 0) >= 0 ? '+' : ''}{stats?.weeklyGrowth}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Case Distribution</CardTitle>
            <CardDescription>New vs Follow-up cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.caseDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.caseDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {stats?.caseDistribution?.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Patient demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.genderDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.genderDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {stats?.genderDistribution?.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[(index + 1) % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicAnalytics;
