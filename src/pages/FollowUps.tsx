import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFollowUps } from '@/hooks/useFollowUps';
import { CalendarCheck, User, Phone, Clock, CheckCircle, XCircle, Calendar, Loader2 } from 'lucide-react';
import { format, isToday, isTomorrow, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FilterType = 'all' | 'today' | 'upcoming' | 'missed';

export default function FollowUps() {
  const [filter, setFilter] = useState<FilterType>('all');
  const { followUps, isLoading, markComplete, cancelFollowUp, isMarkingComplete, isCancelling } = useFollowUps();

  const today = startOfDay(new Date());

  const filteredFollowUps = followUps.filter((fu) => {
    const fuDate = startOfDay(fu.followUpDate);
    const isPast = isBefore(fuDate, today);
    const isCurrentDay = isToday(fu.followUpDate);

    if (filter === 'all') return true;
    if (filter === 'today') return isCurrentDay;
    if (filter === 'upcoming') return !isPast && !isCurrentDay;
    if (filter === 'missed') return isPast && !isCurrentDay;
    return true;
  });

  const handleMarkComplete = (id: string) => {
    markComplete(id, {
      onSuccess: () => toast.success('Follow-up marked as complete'),
      onError: () => toast.error('Failed to mark follow-up as complete'),
    });
  };

  const handleCancel = (id: string) => {
    cancelFollowUp(id, {
      onSuccess: () => toast.success('Follow-up cancelled'),
      onError: () => toast.error('Failed to cancel follow-up'),
    });
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, dd MMM yyyy');
  };

  const getStatusBadge = (fu: typeof followUps[0]) => {
    const fuDate = startOfDay(fu.followUpDate);
    const isPast = isBefore(fuDate, today);
    const isCurrentDay = isToday(fu.followUpDate);

    if (isPast && !isCurrentDay) {
      return <span className="medical-badge-destructive">Missed</span>;
    }
    if (isCurrentDay) {
      return <span className="medical-badge-warning">Today</span>;
    }
    return <span className="medical-badge-primary">Upcoming</span>;
  };

  const counts = {
    all: followUps.length,
    today: followUps.filter((fu) => isToday(fu.followUpDate)).length,
    upcoming: followUps.filter((fu) => {
      const fuDate = startOfDay(fu.followUpDate);
      return !isBefore(fuDate, today) && !isToday(fu.followUpDate);
    }).length,
    missed: followUps.filter((fu) => {
      const fuDate = startOfDay(fu.followUpDate);
      return isBefore(fuDate, today) && !isToday(fu.followUpDate);
    }).length,
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
            onClick={() => setFilter(tab.id as FilterType)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2',
              filter === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {tab.label}
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs',
              filter === tab.id
                ? 'bg-primary-foreground/20'
                : 'bg-muted'
            )}>
              {counts[tab.id as FilterType]}
            </span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Follow-ups List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredFollowUps.map((fu, index) => {
            const fuDate = startOfDay(fu.followUpDate);
            const isPast = isBefore(fuDate, today);
            const isCurrentDay = isToday(fu.followUpDate);

            return (
              <div
                key={fu.id}
                className="medical-card animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-xl',
                        isCurrentDay
                          ? 'gradient-accent'
                          : isPast
                          ? 'bg-destructive/10'
                          : 'gradient-primary'
                      )}
                    >
                      <CalendarCheck
                        className={cn(
                          'h-7 w-7',
                          isCurrentDay || !isPast
                            ? 'text-white'
                            : 'text-destructive'
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{fu.patientName}</p>
                        {getStatusBadge(fu)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {fu.diagnosis || 'Follow-up consultation'}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {fu.patientPatientId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {fu.patientMobile}
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
                      <p className="font-medium text-foreground">{getDateLabel(fu.followUpDate)}</p>
                      <p className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {format(fu.followUpDate, 'hh:mm a')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkComplete(fu.id)}
                        disabled={isMarkingComplete}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-success transition-colors hover:bg-success/10 disabled:opacity-50"
                        title="Mark as completed"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleCancel(fu.id)}
                        disabled={isCancelling}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                        title="Cancel follow-up"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredFollowUps.length === 0 && (
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
