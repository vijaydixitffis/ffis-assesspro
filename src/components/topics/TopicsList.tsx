
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, FileQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface TopicsListProps {
  assessmentId: string;
  onEdit: (topic: any) => void;
  refreshTrigger: number;
}

export default function TopicsList({ assessmentId, onEdit, refreshTrigger }: TopicsListProps) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        .select('id, title, description, is_active, created_at, sequence_number')
        .eq('assessment_id', assessmentId)
        .order('sequence_number', { ascending: true });
      
      if (error) throw error;
      
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageQuestions = (topicId: string) => {
    navigate(`/admin/questions?topicId=${topicId}`);
  };

  const toggleTopicStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setTopics(topics.map(topic => 
        topic.id === id 
          ? { ...topic, is_active: !currentStatus } 
          : topic
      ));
      
      toast.success(`Topic ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling topic status:', error);
      toast.error('Failed to update topic status');
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading topics...</div>;
  }

  if (topics.length === 0) {
    return <div className="text-center py-4">No topics found for this assessment. Add your first topic!</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Topics ({topics.length})</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Sequence</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell>{topic.sequence_number}</TableCell>
              <TableCell className="font-medium">{topic.title}</TableCell>
              <TableCell>{topic.description.substring(0, 100)}{topic.description.length > 100 ? '...' : ''}</TableCell>
              <TableCell>
                <Switch
                  checked={topic.is_active}
                  onCheckedChange={() => toggleTopicStatus(topic.id, topic.is_active)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(topic)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleManageQuestions(topic.id)} title="Manage Questions">
                    <FileQuestion className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
