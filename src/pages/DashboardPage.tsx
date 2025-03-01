
import { useAuth } from '@/contexts/auth';
import { DashboardNav } from '@/components/DashboardNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  useEffect(() => {
    // Add a small delay to ensure auth state is fully loaded
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [user]);
  
  if (isLoading || isPageLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Authentication Error</h2>
          <p className="text-muted-foreground">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }
  
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
