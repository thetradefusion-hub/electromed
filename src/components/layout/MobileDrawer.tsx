import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Pill,
  FileText,
  Settings,
  LogOut,
  Activity,
  CalendarCheck,
  BookOpen,
  Shield,
  HeartPulse,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  path: string;
  roles?: ('super_admin' | 'doctor' | 'staff')[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: '/' },
  { icon: Users, labelKey: 'nav.patients', path: '/patients' },
  { icon: CalendarCheck, labelKey: 'nav.appointments', path: '/appointments' },
  { icon: Stethoscope, labelKey: 'nav.consultation', path: '/consultation', roles: ['super_admin', 'doctor'] },
  { icon: FileText, labelKey: 'nav.prescriptions', path: '/prescriptions', roles: ['super_admin', 'doctor'] },
  { icon: HeartPulse, labelKey: 'nav.symptoms', path: '/symptoms', roles: ['super_admin', 'doctor'] },
  { icon: Pill, labelKey: 'nav.medicines', path: '/medicines', roles: ['super_admin', 'doctor'] },
  { icon: BookOpen, labelKey: 'nav.rulesEngine', path: '/rules', roles: ['super_admin', 'doctor'] },
  { icon: Activity, labelKey: 'nav.analytics', path: '/analytics', roles: ['super_admin', 'doctor'] },
  { icon: Shield, labelKey: 'nav.superAdmin', path: '/admin', roles: ['super_admin'] },
  { icon: Activity, labelKey: 'nav.saasAdmin', path: '/saas-admin', roles: ['super_admin'] },
];

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const location = useLocation();
  const { role, signOut, user } = useAuth();
  const { t } = useTranslation();

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  const handleNavClick = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <DrawerTitle className="text-left text-lg">{t('sidebar.clinicName')}</DrawerTitle>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <DrawerClose asChild>
              <button className="touch-target rounded-xl hover:bg-secondary">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 pb-safe-bottom">
          <div className="space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{t(item.labelKey)}</span>
                  </div>
                  <ChevronRight className={cn('h-4 w-4', isActive ? 'text-primary-foreground/70' : 'text-muted-foreground')} />
                </Link>
              );
            })}
          </div>

          <div className="mt-6 border-t border-border pt-4 space-y-1">
            <Link
              to="/settings"
              onClick={handleNavClick}
              className={cn(
                'flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-all',
                location.pathname === '/settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <span>{t('nav.settings')}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <button
              onClick={() => {
                signOut();
                handleNavClick();
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-destructive transition-all hover:bg-destructive/10"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                <span>{t('nav.logout')}</span>
              </div>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
