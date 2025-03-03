
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
import { Edit } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
            <TableHead>Active</TableHead>
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
              <TableCell>
                <Switch
                  checked={assessment.is_active}
                  onCheckedChange={() => toggleAssessmentStatus(assessment.id, assessment.is_active)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="icon" onClick={() => onEdit(assessment)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
