
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut } from 'lucide-react';

export function DashboardNav() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    console.log('Logout button clicked');
    logout();
  };

  return (
    <header className="dashboard-header">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/74e171ed-dfc9-4ff4-8aae-44113fefa8f9.png" 
            alt="FFIS AssessPro Logo" 
            className="h-8 w-auto" 
          />
        </div>
        
        {/* Mobile menu button */}
        <button 
          onClick={toggleMobileMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {user?.role === 'admin' && (
            <>
              <a href="/dashboard" className="nav-item">Dashboard</a>
              <a href="#" className="nav-item">Users</a>
              <a href="#" className="nav-item">Settings</a>
              <a href="#" className="nav-item">Reports</a>
            </>
          )}
          
          {user?.role === 'client' && (
            <>
              <a href="/dashboard" className="nav-item">Dashboard</a>
              <a href="#" className="nav-item">Assessments</a>
              <a href="#" className="nav-item">Profile</a>
            </>
          )}
          
          {/* User profile dropdown */}
          <div className="ml-4 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User size={16} />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="absolute inset-x-0 top-16 z-50 w-full animate-in border-b bg-background p-4 shadow-sm md:hidden">
          <nav className="flex flex-col space-y-2">
            {user?.role === 'admin' && (
              <>
                <a href="/dashboard" className="nav-item">Dashboard</a>
                <a href="#" className="nav-item">Users</a>
                <a href="#" className="nav-item">Settings</a>
                <a href="#" className="nav-item">Reports</a>
              </>
            )}
            
            {user?.role === 'client' && (
              <>
                <a href="/dashboard" className="nav-item">Dashboard</a>
                <a href="#" className="nav-item">Assessments</a>
                <a href="#" className="nav-item">Profile</a>
              </>
            )}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="flex w-full justify-start items-center text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out ({user?.name})</span>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
