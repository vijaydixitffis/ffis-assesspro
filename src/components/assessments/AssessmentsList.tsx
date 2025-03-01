
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Assessment {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface AssessmentsListProps {
  onEdit: (assessment: Assessment) => void;
}

export default function AssessmentsList({ onEdit }: AssessmentsListProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('title');
      
      if (error) throw error;
      
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAssessmentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setAssessments(assessments.map(assessment => 
        assessment.id === id 
          ? { ...assessment, is_active: !currentStatus } 
          : assessment
      ));
      
      toast.success(`Assessment ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling assessment status:', error);
      toast.error('Failed to update assessment status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      // First check if the assessment has topics
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('id')
        .eq('assessment_id', deleteId);
      
      if (topicsError) throw topicsError;
      
      if (topics && topics.length > 0) {
        toast.error('Cannot delete assessment that has topics. Deactivate it instead.');
        setDeleteId(null);
        return;
      }
      
      // If no topics, proceed with deletion
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      setAssessments(assessments.filter(assessment => assessment.id !== deleteId));
      toast.success('Assessment deleted successfully');
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Failed to delete assessment');
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div>Loading assessments...</div>;
  }

  if (assessments.length === 0) {
    return <div>No assessments found. Create your first assessment to get started.</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Assessments</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => (
            <TableRow key={assessment.id}>
              <TableCell className="font-medium">{assessment.title}</TableCell>
              <TableCell>{assessment.description.length > 100 
                ? `${assessment.description.substring(0, 100)}...` 
                : assessment.description}
              </TableCell>
              <TableCell>
                <Badge variant={assessment.is_active ? "success" : "secondary"}>
                  {assessment.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{new Date(assessment.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => onEdit(assessment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => toggleAssessmentStatus(assessment.id, assessment.is_active)}
                  >
                    {assessment.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => setDeleteId(assessment.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assessment.
              If the assessment has topics, you cannot delete it and should deactivate it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
