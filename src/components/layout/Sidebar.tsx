import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Pill,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  CalendarCheck,
  BookOpen,
  Shield,
  HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

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
];

const bottomNavItems: NavItem[] = [
  { icon: Settings, labelKey: 'nav.settings', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { role, signOut } = useAuth();
  const { t } = useTranslation();

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-sidebar-foreground">{t('sidebar.clinicName')}</h1>
                <p className="text-xs text-sidebar-foreground/60">{t('sidebar.clinicSubtitle')}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition-colors hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-sidebar-primary-foreground')} />
                {!collapsed && <span>{t(item.labelKey)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{t(item.labelKey)}</span>}
              </Link>
            );
          })}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive/80 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
