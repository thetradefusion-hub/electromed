import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  CalendarCheck, 
  Menu 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface MobileNavProps {
  onMenuClick: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/' },
    { icon: Users, label: t('nav.patients'), path: '/patients' },
    { icon: Stethoscope, label: t('nav.consultation'), path: '/consultation' },
    { icon: CalendarCheck, label: t('nav.appointments'), path: '/appointments' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'mobile-nav-item flex-1 max-w-[72px]',
                isActive && 'active'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className={cn('text-[10px] font-medium', isActive && 'text-primary')}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={onMenuClick}
          className="mobile-nav-item flex-1 max-w-[72px]"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t('nav.more') || 'More'}</span>
        </button>
      </div>
    </nav>
  );
}
