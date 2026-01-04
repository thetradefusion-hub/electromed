import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockPatients } from '@/data/mockData';
import { CalendarCheck, User, Phone, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { format, addDays, isBefore, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FollowUpStatus = 'pending' | 'completed' | 'missed';

interface FollowUp {
  id: string;
  patient: typeof mockPatients[0];
  prescriptionNo: string;
  scheduledDate: Date;
  time: string;
  reason: string;
  status: FollowUpStatus;
}

const mockFollowUps: FollowUp[] = [
  {
    id: '1',
    patient: mockPatients[0],
    prescriptionNo: 'RX-2024-001',
    scheduledDate: new Date(),
    time: '10:00 AM',
    reason: 'Review after medication',
    status: 'pending',
  },
  {
    id: '2',
    patient: mockPatients[1],
    prescriptionNo: 'RX-2024-002',
    scheduledDate: addDays(new Date(), 1),
    time: '11:30 AM',
    reason: 'Monthly checkup',
    status: 'pending',
  },
  {
    id: '3',
    patient: mockPatients[2],
    prescriptionNo: 'RX-2024-003',
    scheduledDate: addDays(new Date(), 2),
    time: '02:00 PM',
    reason: 'Test results review',
    status: 'pending',
  },
  {
    id: '4',
    patient: mockPatients[3],
    prescriptionNo: 'RX-2024-004',
    scheduledDate: addDays(new Date(), -1),
    time: '03:30 PM',
    reason: 'Progress evaluation',
    status: 'missed',
  },
];

export default function FollowUps() {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'missed'>('all');
  const [followUps, setFollowUps] = useState(mockFollowUps);

  const filteredFollowUps = followUps.filter((fu) => {
    if (filter === 'all') return true;
    if (filter === 'today') return isToday(fu.scheduledDate);
    if (filter === 'upcoming') return !isBefore(fu.scheduledDate, new Date()) && !isToday(fu.scheduledDate);
    if (filter === 'missed') return fu.status === 'missed' || (isBefore(fu.scheduledDate, new Date()) && !isToday(fu.scheduledDate) && fu.status === 'pending');
    return true;
  });

  const markComplete = (id: string) => {
    setFollowUps((prev) =>
      prev.map((fu) => (fu.id === id ? { ...fu, status: 'completed' as const } : fu))
    );
    toast.success('Follow-up marked as complete');
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, dd MMM');
  };

  const getStatusBadge = (fu: typeof mockFollowUps[0]) => {
    if (fu.status === 'completed') {
      return <span className="medical-badge-success">Completed</span>;
    }
    if (fu.status === 'missed' || (isBefore(fu.scheduledDate, new Date()) && !isToday(fu.scheduledDate))) {
      return <span className="medical-badge-destructive">Missed</span>;
    }
    if (isToday(fu.scheduledDate)) {
      return <span className="medical-badge-warning">Today</span>;
    }
    return <span className="medical-badge-primary">Upcoming</span>;
  };

  return (
    <MainLayout title="Follow-ups" subtitle="Track and manage patient follow-up appointments">
      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'today', label: 'Today' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'missed', label: 'Missed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              filter === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-ups List */}
      <div className="space-y-4">
        {filteredFollowUps.map((fu, index) => (
          <div
            key={fu.id}
            className={cn(
              'medical-card animate-fade-in',
              fu.status === 'completed' && 'opacity-60'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-xl',
                    isToday(fu.scheduledDate)
                      ? 'gradient-accent'
                      : isBefore(fu.scheduledDate, new Date())
                      ? 'bg-destructive/10'
                      : 'gradient-primary'
                  )}
                >
                  <CalendarCheck
                    className={cn(
                      'h-7 w-7',
                      isToday(fu.scheduledDate) || !isBefore(fu.scheduledDate, new Date())
                        ? 'text-white'
                        : 'text-destructive'
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{fu.patient.name}</p>
                    {getStatusBadge(fu)}
                  </div>
                  <p className="text-sm text-muted-foreground">{fu.reason}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {fu.patient.patientId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {fu.patient.mobile}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {fu.prescriptionNo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-foreground">{getDateLabel(fu.scheduledDate)}</p>
                  <p className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {fu.time}
                  </p>
                </div>

                {fu.status !== 'completed' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markComplete(fu.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-success transition-colors hover:bg-success/10"
                      title="Mark as completed"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
                      title="Cancel follow-up"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFollowUps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <CalendarCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">No follow-ups found</h3>
          <p className="text-sm text-muted-foreground">
            {filter === 'all'
              ? 'No follow-up appointments scheduled'
              : `No ${filter} follow-ups`}
          </p>
        </div>
      )}
    </MainLayout>
  );
}
