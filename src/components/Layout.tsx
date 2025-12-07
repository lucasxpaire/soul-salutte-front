import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'clientes',
      title: 'Clientes',
      icon: Users,
    },
    {
      id: 'agendamentos',
      title: 'Agendamentos',
      icon: Calendar,
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="flex h-16 items-center px-6">
          {/* Logo Section */}
          <div className="flex items-center gap-2 mr-8">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="size-5" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-bold text-lg">Soul Saluttē</span>
            </div>
          </div>

          {/* Navigation Section - Center */}
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  currentPage === item.id
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 size-4" />
                {item.title}
              </button>
            ))}
          </nav>

          {/* User & Actions Section - Right */}
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex items-center ml-2 border-l pl-2 space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                title="Sair"
              >
                <LogOut className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default Layout;
