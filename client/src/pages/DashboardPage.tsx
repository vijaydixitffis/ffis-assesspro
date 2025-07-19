import { useAuth } from '@/contexts/auth';
import { DashboardNav } from '@/components/DashboardNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Activity,
  Shield,
  Database,
  BarChart3,
  Calendar,
  AlertTriangle,
  Star
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('DashboardPage mounted, auth state:', { user, isLoading, userId: user?.id });
    
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      console.log('No authenticated user found, redirecting to login');
      toast.error('Please log in to access the dashboard');
      navigate('/login');
      return;
    }
    
    const timer = setTimeout(() => {
      console.log('Dashboard page ready, auth state:', { user, isLoading, userId: user?.id });
      setIsPageLoading(false);
      
      // If authentication is complete but no user data is available, show error
      if (!isLoading && !user) {
        toast.error('Authentication error - please try logging in again');
      }
    }, 1000); // Shorter delay to improve UX
    
    return () => clearTimeout(timer);
  }, [user, isLoading, navigate]);
  
  // Show loading state when either auth is loading or page is still initializing
  if (isLoading || isPageLoading) {
    console.log('Dashboard showing loading state, auth status:', { isLoading, isPageLoading });
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if no user data is available
  if (!user) {
    console.log('Dashboard has no user data, showing error');
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Authentication Error</h2>
          <p className="text-muted-foreground">Please log in to access the dashboard</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 rounded bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  console.log('Dashboard rendering with user:', { 
    id: user.id, 
    name: user.name, 
    firstName: user.firstName, 
    lastName: user.lastName, 
    role: user.role 
  });
  
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl animate-in">
          <div className="space-y-6">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Welcome, {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'User'}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Here's what's happening in your {user.role === 'admin' ? 'admin' : 'client'} dashboard
                  </p>
                </div>
              </div>
            </div>
          
          {user.role === 'admin' && <AdminDashboard />}
          {user.role === 'client' && <ClientDashboard />}
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900 dark:text-white">Total Users</CardTitle>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardDescription>User accounts overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">152</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900 dark:text-white">Active Assessments</CardTitle>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardDescription>Ongoing assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">28</div>
          <p className="text-xs text-muted-foreground">8 due this week</p>
        </CardContent>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900 dark:text-white">System Status</CardTitle>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <CardDescription>All systems operational</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Online</span>
          </div>
          <p className="text-xs text-muted-foreground">Last updated: Today, 10:45 AM</p>
        </CardContent>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg text-gray-900 dark:text-white">Recent Activity</CardTitle>
          </div>
          <CardDescription>Latest system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm">New client account created</span>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm">Assessment template updated</span>
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">System backup completed</span>
              <span className="text-xs text-muted-foreground">2 days ago</span>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}

function ClientDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900 dark:text-white">My Assessments</CardTitle>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardDescription>Your active assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">3</div>
          <p className="text-xs text-muted-foreground">1 due this week</p>
        </CardContent>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900 dark:text-white">Completed</CardTitle>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardDescription>Finished assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">12</div>
          <p className="text-xs text-muted-foreground">View history</p>
        </CardContent>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900 dark:text-white">Average Score</CardTitle>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <CardDescription>Your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">86%</div>
          <p className="text-xs text-muted-foreground">+4% from last assessment</p>
        </CardContent>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg text-gray-900 dark:text-white">Upcoming Deadlines</CardTitle>
          </div>
          <CardDescription>Assessments requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm">Quarterly Security Review</span>
              <span className="text-xs font-medium text-destructive">Due in 2 days</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-sm">Compliance Assessment</span>
              <span className="text-xs text-muted-foreground">Due in 2 weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Risk Management Survey</span>
              <span className="text-xs text-muted-foreground">Due in 1 month</span>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
