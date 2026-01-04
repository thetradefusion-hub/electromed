import { Bell, Search, User } from 'lucide-react';
import { currentDoctor } from '@/data/mockData';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patients, prescriptions..."
              className="h-10 w-64 rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              3
            </span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-foreground">{currentDoctor.name}</p>
              <p className="text-xs text-muted-foreground">{currentDoctor.registrationNo}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
