import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockFollowups = [
  {
    id: '1',
    patientName: 'Amit Sharma',
    patientId: 'EH-2024-001',
    scheduledDate: new Date(Date.now() + 86400000),
    time: '10:00 AM',
    reason: 'Review after medication',
  },
  {
    id: '2',
    patientName: 'Priya Singh',
    patientId: 'EH-2024-002',
    scheduledDate: new Date(Date.now() + 86400000 * 2),
    time: '11:30 AM',
    reason: 'Monthly checkup',
  },
  {
    id: '3',
    patientName: 'Ravi Verma',
    patientId: 'EH-2024-003',
    scheduledDate: new Date(Date.now() + 86400000 * 3),
    time: '02:00 PM',
    reason: 'Test results review',
  },
];

export function UpcomingFollowups() {
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

      <div className="space-y-3">
        {mockFollowups.map((followup, index) => (
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
                  <p className="text-xs text-muted-foreground">{followup.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {followup.scheduledDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {followup.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
