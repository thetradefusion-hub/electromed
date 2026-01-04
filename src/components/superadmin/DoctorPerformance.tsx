import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Users, FileText, TrendingUp } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

interface DoctorPerformance {
  id: string;
  name: string;
  email: string;
  specialization: string;
  totalPatients: number;
  totalPrescriptions: number;
  thisWeekPrescriptions: number;
  lastActive: string | null;
}

const DoctorPerformance = () => {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin-doctor-performance'],
    queryFn: async () => {
      // Fetch all doctors with profiles
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('id, user_id, specialization, created_at')
        .order('created_at', { ascending: false });

      if (doctorsError) throw doctorsError;

      // Fetch all patients
      const { data: patientsData } = await supabase
        .from('patients')
        .select('doctor_id');

      // Fetch all prescriptions
      const { data: prescriptionsData } = await supabase
        .from('prescriptions')
        .select('doctor_id, created_at');

      // Get profiles
      const userIds = doctorsData?.map(d => d.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const last7Days = subDays(startOfDay(new Date()), 7);

      // Calculate stats for each doctor
      const performanceData: DoctorPerformance[] = (doctorsData || []).map(doctor => {
        const profile = profileMap.get(doctor.user_id);
        const doctorPatients = patientsData?.filter(p => p.doctor_id === doctor.id) || [];
        const doctorPrescriptions = prescriptionsData?.filter(p => p.doctor_id === doctor.id) || [];
        const thisWeekRx = doctorPrescriptions.filter(p => new Date(p.created_at) >= last7Days);
        
        const lastRx = doctorPrescriptions.length > 0 
          ? doctorPrescriptions.reduce((latest, rx) => 
              new Date(rx.created_at) > new Date(latest.created_at) ? rx : latest
            )
          : null;

        return {
          id: doctor.id,
          name: profile?.name || 'Unknown',
          email: profile?.email || '',
          specialization: doctor.specialization,
          totalPatients: doctorPatients.length,
          totalPrescriptions: doctorPrescriptions.length,
          thisWeekPrescriptions: thisWeekRx.length,
          lastActive: lastRx?.created_at || null,
        };
      });

      // Sort by total prescriptions
      performanceData.sort((a, b) => b.totalPrescriptions - a.totalPrescriptions);

      return performanceData;
    },
  });

  const maxPrescriptions = Math.max(...(doctors?.map(d => d.totalPrescriptions) || [1]));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doctor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Top 3 doctors
  const topDoctors = doctors?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="grid gap-4 md:grid-cols-3">
        {topDoctors.map((doctor, index) => (
          <Card key={doctor.id} className={index === 0 ? 'border-primary/50 bg-primary/5' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className={`h-5 w-5 ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-400' : 
                    'text-amber-600'
                  }`} />
                  <span className="text-sm font-medium">#{index + 1}</span>
                </div>
                <Badge variant={index === 0 ? 'default' : 'secondary'}>
                  {doctor.thisWeekPrescriptions} this week
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold truncate">{doctor.name}</h3>
              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-secondary p-2">
                  <p className="text-lg font-bold">{doctor.totalPatients}</p>
                  <p className="text-xs text-muted-foreground">Patients</p>
                </div>
                <div className="rounded-lg bg-secondary p-2">
                  <p className="text-lg font-bold">{doctor.totalPrescriptions}</p>
                  <p className="text-xs text-muted-foreground">Prescriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            All Doctor Performance
          </CardTitle>
          <CardDescription>Detailed performance metrics for all doctors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead className="text-center">Patients</TableHead>
                  <TableHead className="text-center">Prescriptions</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors?.map((doctor, index) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {index < 3 && (
                            <Trophy className={`h-4 w-4 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              'text-amber-600'
                            }`} />
                          )}
                          <span className="font-medium">#{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{doctor.totalPatients}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{doctor.totalPrescriptions}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-32">
                        <Progress 
                          value={(doctor.totalPrescriptions / maxPrescriptions) * 100} 
                          className="h-2"
                        />
                      </TableCell>
                      <TableCell>
                        {doctor.lastActive ? (
                          <span className="text-sm">
                            {format(new Date(doctor.lastActive), 'MMM dd, yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPerformance;
