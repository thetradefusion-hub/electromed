import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import { format } from 'date-fns';
import { 
  UserPlus, 
  FileText, 
  Calendar, 
  Loader2,
  Activity
} from 'lucide-react';

interface TimelineItem {
  id: string;
  type: 'patient' | 'prescription' | 'appointment';
  title: string;
  subtitle: string;
  timestamp: Date;
}

export function ActivityTimeline() {
  const { doctorId } = useDoctor();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity-timeline', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];

      const [patientsRes, prescriptionsRes, appointmentsRes] = await Promise.all([
        supabase
          .from('patients')
          .select('id, name, created_at')
          .eq('doctor_id', doctorId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('prescriptions')
          .select('id, prescription_no, created_at, patients(name)')
          .eq('doctor_id', doctorId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('appointments')
          .select('id, patient_name, appointment_date, time_slot, created_at')
          .eq('doctor_id', doctorId)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const items: TimelineItem[] = [];

      // Add patients
      (patientsRes.data || []).forEach((p) => {
        items.push({
          id: `patient-${p.id}`,
          type: 'patient',
          title: `New patient: ${p.name}`,
          subtitle: 'Patient registered',
          timestamp: new Date(p.created_at),
        });
      });

      // Add prescriptions
      (prescriptionsRes.data || []).forEach((rx) => {
        const patientName = (rx.patients as any)?.name || 'Unknown';
        items.push({
          id: `rx-${rx.id}`,
          type: 'prescription',
          title: `Prescription ${rx.prescription_no}`,
          subtitle: `For ${patientName}`,
          timestamp: new Date(rx.created_at),
        });
      });

      // Add appointments
      (appointmentsRes.data || []).forEach((apt) => {
        items.push({
          id: `apt-${apt.id}`,
          type: 'appointment',
          title: `Appointment booked`,
          subtitle: apt.patient_name || 'Walk-in',
          timestamp: new Date(apt.created_at),
        });
      });

      // Sort by timestamp
      return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);
    },
    enabled: !!doctorId,
  });

  const getIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'patient':
        return UserPlus;
      case 'prescription':
        return FileText;
      case 'appointment':
        return Calendar;
    }
  };

  const getIconColor = (type: TimelineItem['type']) => {
    switch (type) {
      case 'patient':
        return 'bg-primary/10 text-primary';
      case 'prescription':
        return 'bg-accent/10 text-accent';
      case 'appointment':
        return 'bg-warning/10 text-warning';
    }
  };

  return (
    <div className="medical-card">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Your latest actions</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (!activities || activities.length === 0) && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Activity className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      )}

      {!isLoading && activities && activities.length > 0 && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          
          <div className="space-y-4">
            {activities.map((item, index) => {
              const Icon = getIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="relative flex items-start gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getIconColor(item.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.subtitle} • {format(item.timestamp, 'MMM dd, h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
