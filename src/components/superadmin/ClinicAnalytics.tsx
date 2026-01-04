import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Pill, Stethoscope, TrendingUp, Calendar } from 'lucide-react';

const ClinicAnalytics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [doctorsResult, patientsResult, symptomsResult, medicinesResult] = await Promise.all([
        supabase.from('doctors').select('id', { count: 'exact' }),
        supabase.from('patients').select('id, created_at', { count: 'exact' }),
        supabase.from('symptoms').select('id', { count: 'exact' }).eq('is_global', true),
        supabase.from('medicines').select('id', { count: 'exact' }).eq('is_global', true),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayPatients = patientsResult.data?.filter(
        (p) => new Date(p.created_at) >= today
      ).length || 0;

      return {
        totalDoctors: doctorsResult.count || 0,
        totalPatients: patientsResult.count || 0,
        todayPatients,
        globalSymptoms: symptomsResult.count || 0,
        globalMedicines: medicinesResult.count || 0,
      };
    },
  });

  const analyticsCards = [
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors || 0,
      icon: Users,
      description: 'Registered doctors',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: UserPlus,
      description: 'All-time patients',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: "Today's Visits",
      value: stats?.todayPatients || 0,
      icon: Calendar,
      description: 'Patients today',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Global Symptoms',
      value: stats?.globalSymptoms || 0,
      icon: Stethoscope,
      description: 'Symptom library',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Global Medicines',
      value: stats?.globalMedicines || 0,
      icon: Pill,
      description: 'Medicine library',
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {analyticsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              System Overview
            </CardTitle>
            <CardDescription>Platform-wide statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Doctors</span>
                <span className="font-medium">{stats?.totalDoctors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Patients Served</span>
                <span className="font-medium">{stats?.totalPatients}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Global Symptom Database</span>
                <span className="font-medium">{stats?.globalSymptoms} entries</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Global Medicine Database</span>
                <span className="font-medium">{stats?.globalMedicines} entries</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Quick Stats
            </CardTitle>
            <CardDescription>Today's activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Patients Today</span>
                <span className="font-medium text-green-500">{stats?.todayPatients}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Patients/Doctor</span>
                <span className="font-medium">
                  {stats?.totalDoctors
                    ? Math.round((stats?.totalPatients || 0) / stats.totalDoctors)
                    : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicAnalytics;
