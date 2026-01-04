import { ReactNode } from 'react';
import { Search, User, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'super_admin':
        return t('roles.superAdmin');
      case 'doctor':
        return t('roles.doctor');
      case 'staff':
        return t('roles.staff');
      default:
        return t('roles.user');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>}
          </div>
          {action && <div className="hidden sm:block ml-4">{action}</div>}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Desktop only */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              className="h-10 w-56 xl:w-64 rounded-xl border border-input bg-secondary/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Language Switcher - Desktop */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 md:gap-3 rounded-xl border border-border bg-card p-2 md:px-3 md:py-2 hover:bg-secondary/50 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || t('roles.user')}
                  </p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.user_metadata?.name || t('roles.user')}</p>
                  <p className="text-xs text-muted-foreground font-normal truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                {t('nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t('auth.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
