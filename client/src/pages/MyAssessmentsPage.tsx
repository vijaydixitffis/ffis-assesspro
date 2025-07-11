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

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl animate-in">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">My Assessments</h1>
            <p className="text-muted-foreground">
              View and manage your assigned assessments
            </p>
            <div className="mt-4 flex items-center space-x-2">
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
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No assessments have been assigned to you yet.</p>
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
