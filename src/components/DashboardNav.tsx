
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { User, LogOut, Settings, FileText, BookOpen } from 'lucide-react';

export function DashboardNav() {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  const isAdmin = user?.role === 'admin';
  
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="font-semibold text-xl mr-6">Assessment Portal</Link>
        
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6 hidden md:block">
          <Link
            to="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          
          {isAdmin && (
            <>
              <Link
                to="/admin/topics"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Topics
              </Link>
            </>
          )}
        </nav>
        
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative rounded-full h-9 w-9 p-0">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/topics">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Topic Management</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>My Assessments</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
