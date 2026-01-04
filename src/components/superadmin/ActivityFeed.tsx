import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, FileText, Stethoscope, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'patient' | 'prescription' | 'doctor';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    doctorName?: string;
    patientName?: string;
  };
}

const ActivityFeed = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['admin-activity-feed'],
    queryFn: async () => {
      // Fetch recent patients
      const { data: recentPatients } = await supabase
        .from('patients')
        .select('id, name, patient_id, created_at, doctor_id')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent prescriptions
      const { data: recentPrescriptions } = await supabase
        .from('prescriptions')
        .select(`
          id,
          prescription_no,
          created_at,
          doctor_id,
          patient:patients(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent doctors
      const { data: recentDoctors } = await supabase
        .from('doctors')
        .select('id, user_id, created_at, specialization')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get doctor profiles
      const doctorIds = [
        ...new Set([
          ...(recentPatients?.map(p => p.doctor_id) || []),
          ...(recentPrescriptions?.map(p => p.doctor_id) || []),
          ...(recentDoctors?.map(d => d.user_id) || []),
        ])
      ];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', doctorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.name]) || []);

      // Build activity items
      const items: ActivityItem[] = [];

      recentPatients?.forEach(patient => {
        items.push({
          id: `patient-${patient.id}`,
          type: 'patient',
          title: 'New Patient Registered',
          description: `${patient.name} (${patient.patient_id})`,
          timestamp: patient.created_at,
          metadata: {
            patientName: patient.name,
          },
        });
      });

      recentPrescriptions?.forEach(rx => {
        const patientData = rx.patient as { name: string } | null;
        items.push({
          id: `prescription-${rx.id}`,
          type: 'prescription',
          title: 'Prescription Created',
          description: `${rx.prescription_no} for ${patientData?.name || 'Unknown'}`,
          timestamp: rx.created_at,
          metadata: {
            patientName: patientData?.name,
          },
        });
      });

      recentDoctors?.forEach(doctor => {
        items.push({
          id: `doctor-${doctor.id}`,
          type: 'doctor',
          title: 'New Doctor Joined',
          description: `${profileMap.get(doctor.user_id) || 'Doctor'} - ${doctor.specialization}`,
          timestamp: doctor.created_at,
          metadata: {
            doctorName: profileMap.get(doctor.user_id),
          },
        });
      });

      // Sort by timestamp
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return items.slice(0, 20);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'patient':
        return <UserPlus className="h-4 w-4 text-accent" />;
      case 'prescription':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'doctor':
        return <Stethoscope className="h-4 w-4 text-warning" />;
    }
  };

  const getBadgeVariant = (type: ActivityItem['type']) => {
    switch (type) {
      case 'patient':
        return 'default';
      case 'prescription':
        return 'secondary';
      case 'doctor':
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Real-time updates from across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities?.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background">
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <Badge variant={getBadgeVariant(activity.type)} className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
