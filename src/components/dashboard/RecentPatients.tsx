import { User, Phone, Calendar, ArrowRight } from 'lucide-react';
import { mockPatients } from '@/data/mockData';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function RecentPatients() {
  const recentPatients = mockPatients.slice(0, 5);

  return (
    <div className="medical-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Patients</h3>
          <p className="text-sm text-muted-foreground">Latest patient registrations</p>
        </div>
        <Link
          to="/patients"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentPatients.map((patient, index) => (
          <div
            key={patient.id}
            className={cn(
              'flex items-center justify-between rounded-lg border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 animate-fade-in',
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{patient.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{patient.patientId}</span>
                  <span>•</span>
                  <span>{patient.age}y, {patient.gender}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{patient.mobile}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(patient.visitDate, 'dd MMM')}</span>
              </div>
              <span
                className={cn(
                  'medical-badge',
                  patient.caseType === 'new'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {patient.caseType === 'new' ? 'New' : 'Follow-up'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
