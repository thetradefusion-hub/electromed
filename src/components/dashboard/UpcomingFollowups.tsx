import { Calendar, Clock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFollowUps } from '@/hooks/useFollowUps';
import { format, isToday, isTomorrow, isBefore, startOfDay } from 'date-fns';

export function UpcomingFollowups() {
  const { followUps, isLoading } = useFollowUps();

  const today = startOfDay(new Date());
  
  // Filter to only upcoming (not past) and limit to 3
  const upcomingFollowUps = followUps
    .filter((fu) => {
      const fuDate = startOfDay(fu.followUpDate);
      return !isBefore(fuDate, today);
    })
    .slice(0, 3);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'dd MMM');
  };

  return (
    <div className="medical-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Upcoming Follow-ups</h3>
          <p className="text-sm text-muted-foreground">Scheduled appointments</p>
        </div>
        <Link
          to="/followups"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && upcomingFollowUps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No upcoming follow-ups</p>
        </div>
      )}

      {!isLoading && upcomingFollowUps.length > 0 && (
        <div className="space-y-3">
          {upcomingFollowUps.map((followup, index) => (
            <div
              key={followup.id}
              className="rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-sm animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{followup.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {followup.diagnosis || 'Follow-up consultation'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {getDateLabel(followup.followUpDate)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {format(followup.followUpDate, 'hh:mm a')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
