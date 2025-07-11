import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { DashboardNav } from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentsTable } from "@/components/assessments/AssessmentsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AssignedAssessment } from "@/types/assessment";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle2, Play, Database, BookOpen, Target, TrendingUp } from "lucide-react";

export default function MyAssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssignedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.id) {
      fetchAssignedAssessments();
    }
  }, [user]);

  async function fetchAssignedAssessments() {
    setIsLoading(true);
    try {
      console.log('Fetching assignments for user:', user?.id);
      // Fetch assessments assigned to the current user with the assessment title
      const { data, error } = await supabase
        .from('assessment_assignments')
        .select(`
          id,
          assessment_id,
          status,
          due_date,
          assigned_at,
          scope,
          assessments:assessment_id (title)
        `)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to load your assignments');
        return;
      }

      console.log('Fetched assignments data:', data);

      // Transform the data to include assessment title
      const formattedAssessments = data.map(item => ({
        id: item.id,                   // Assignment ID (primary key)
        assessment_id: item.assessment_id,  // Assessment ID (foreign key)
        assessment_title: item.assessments.title,
        status: item.status,
        due_date: item.due_date,
        assigned_at: item.assigned_at,
        scope: item.scope || ''
      }));

      console.log('Formatted assessments:', formattedAssessments);
      setAssessments(formattedAssessments);
      await computeCompletionMap(formattedAssessments);
    } catch (error) {
      console.error('Error in fetch operation:', error);
      toast.error('An error occurred while loading assignments');
    } finally {
      setIsLoading(false);
    }
  }

  async function computeCompletionMap(assignments: AssignedAssessment[]) {
    const map: Record<string, boolean> = {};
    for (const a of assignments) {
      const { count: total, error: tErr } = await supabase
        .from('topics')
        .select('id', { count: 'exact', head: true })
        .eq('assessment_id', a.assessment_id)
        .eq('is_active', true);
      const { count: done, error: dErr } = await supabase
        .from('topic_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('assessment_assignment_id', a.id)
        .eq('user_id', user?.id)
        .eq('status', 'COMPLETED');
      map[a.id] = (total || 0) > 0 && done === total;
    }
    setCompletionMap(map);
  }

  const handleStatusUpdate = (assignmentId: string, newStatus: string) => {
    console.log('Handling status update:', { assignmentId, newStatus });
    setAssessments(prevAssessments => 
      prevAssessments.map(a => {
        if (a.id === assignmentId) {
          console.log(`Updating assessment ${assignmentId} from ${a.status} to ${newStatus}`);
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  const getStatusStats = () => {
    const total = assessments.length;
    const completed = assessments.filter(a => a.status === 'COMPLETED').length;
    const started = assessments.filter(a => a.status === 'STARTED').length;
    const notStarted = assessments.filter(a => a.status === 'ASSIGNED').length;
    
    return { total, completed, started, notStarted };
  };

  const stats = getStatusStats();

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6 bg-gray-50/30 dark:bg-gray-900/30">
        <div className="container mx-auto max-w-7xl animate-in">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Assessments</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your progress and manage assigned assessments
                </p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assessments</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.started}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Not Started</p>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.notStarted}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex items-center space-x-2 mb-6">
              <Switch 
                id="debug-mode" 
                checked={showDebugInfo}
                onCheckedChange={setShowDebugInfo}
              />
              <Label htmlFor="debug-mode">Show debug info</Label>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : assessments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No assessments have been assigned to you yet.</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Contact your administrator to get started.</p>
            </div>
          ) : (
            <AssessmentsTable 
              assessments={assessments} 
              userId={user?.id || ''} 
              onStatusUpdate={handleStatusUpdate}
              showDebug={showDebugInfo}
              completionMap={completionMap}
            />
          )}
        </div>
      </main>
    </div>
  );
}
