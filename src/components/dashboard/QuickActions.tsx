import { UserPlus, Stethoscope, FileText, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  {
    icon: UserPlus,
    label: 'Add Patient',
    description: 'Register new patient',
    path: '/patients/new',
    variant: 'primary' as const,
  },
  {
    icon: Stethoscope,
    label: 'New Consultation',
    description: 'Start consultation',
    path: '/consultation',
    variant: 'accent' as const,
  },
  {
    icon: FileText,
    label: 'View Prescriptions',
    description: 'Recent prescriptions',
    path: '/prescriptions',
    variant: 'default' as const,
  },
  {
    icon: Pill,
    label: 'Medicine Library',
    description: 'Browse medicines',
    path: '/medicines',
    variant: 'default' as const,
  },
];

export function QuickActions() {
  return (
    <div className="medical-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Common tasks</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link
            key={action.path}
            to={action.path}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-md animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${
                action.variant === 'primary'
                  ? 'gradient-primary'
                  : action.variant === 'accent'
                  ? 'gradient-accent'
                  : 'bg-secondary'
              }`}
            >
              <action.icon
                className={`h-6 w-6 ${
                  action.variant === 'default' ? 'text-muted-foreground' : 'text-white'
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
