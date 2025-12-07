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
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-md">
        <div className="flex h-16 items-center px-6">
          {/* Navigation Section - Left/Center */}
          <nav className="flex items-center space-x-4 lg:space-x-6 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 select-none",
                  currentPage === item.id
                    ? "text-white font-bold bg-white/20 px-3 py-1.5 rounded-md"
                    : "text-primary-foreground/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-md"
                )}
              >
                <item.icon className="mr-2 size-4" />
                {item.title}
              </button>
            ))}
          </nav>

          {/* User & Actions Section - Right */}
          <div className="ml-auto flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-primary-foreground text-primary flex items-center justify-center font-bold border border-primary-foreground/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex items-center ml-2 border-l border-primary-foreground/20 pl-2 space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-primary-foreground/80 hover:text-white hover:bg-white/20"
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
