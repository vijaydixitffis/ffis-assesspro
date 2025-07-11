import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Edit, Trash2, FileQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Topic {
  id: string;
  title: string;
  description: string;
  sequence_number: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TopicsListProps {
  assessmentId: string;
  onEdit: (topic: Topic) => void;
  refreshTrigger: number;
}

export default function TopicsList({ assessmentId, onEdit, refreshTrigger }: TopicsListProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (assessmentId) {
      fetchTopics();
    }
  }, [assessmentId, refreshTrigger]);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('sequence_number');

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;

      toast.success('Topic deleted successfully');
      fetchTopics(); // Refresh the list
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('Failed to delete topic');
    }
  };

  const handleManageQuestions = (topicId: string) => {
    navigate(`/questions?topicId=${topicId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sequence</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No topics found for this assessment
              </TableCell>
            </TableRow>
          ) : (
            topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell className="font-medium">
                  {topic.sequence_number}
                </TableCell>
                <TableCell className="font-medium">
                  {topic.title}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {topic.description}
                </TableCell>
                <TableCell>
                  <Badge variant={topic.is_active ? 'default' : 'destructive'}>
                    {topic.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageQuestions(topic.id)}
                      title="Manage Questions"
                    >
                      <FileQuestion className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(topic)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTopic(topic.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}