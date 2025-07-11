import { useAuth } from '@/contexts/auth';
import { DashboardNav } from '@/components/DashboardNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if no user data is available
  if (!user) {
    console.log('Dashboard has no user data, showing error');
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Authentication Error</h2>
          <p className="text-muted-foreground">Please log in to access the dashboard</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
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
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl animate-in">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome, {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'User'}
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening in your {user.role === 'admin' ? 'admin' : 'client'} dashboard
            </p>
          </div>
          
          {user.role === 'admin' && <AdminDashboard />}
          {user.role === 'client' && <ClientDashboard />}
        </div>
      </main>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Users</CardTitle>
          <CardDescription>User accounts overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">152</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Active Assessments</CardTitle>
          <CardDescription>Ongoing assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">28</div>
          <p className="text-xs text-muted-foreground">8 due this week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>All systems operational</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Online</span>
          </div>
          <p className="text-xs text-muted-foreground">Last updated: Today, 10:45 AM</p>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm">New client account created</span>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm">Assessment template updated</span>
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">System backup completed</span>
              <span className="text-xs text-muted-foreground">2 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">My Assessments</CardTitle>
          <CardDescription>Your active assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">1 due this week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Completed</CardTitle>
          <CardDescription>Finished assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">View history</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Average Score</CardTitle>
          <CardDescription>Your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">86%</div>
          <p className="text-xs text-muted-foreground">+4% from last assessment</p>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          <CardDescription>Assessments requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm">Quarterly Security Review</span>
              <span className="text-xs font-medium text-destructive">Due in 2 days</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm">Compliance Assessment</span>
              <span className="text-xs text-muted-foreground">Due in 2 weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Risk Management Survey</span>
              <span className="text-xs text-muted-foreground">Due in 1 month</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
