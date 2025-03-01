
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Pencil } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface TopicsListProps {
  assessmentId: string;
  onEdit: (topic: Topic) => void;
}

export default function TopicsList({ assessmentId, onEdit }: TopicsListProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (assessmentId) {
      fetchTopics();
    }
  }, [assessmentId]);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('title');
      
      if (error) throw error;
      
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (topic: Topic) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_active: !topic.is_active })
        .eq('id', topic.id);
      
      if (error) throw error;
      
      // Update the local state
      setTopics(topics.map(t => 
        t.id === topic.id ? { ...t, is_active: !t.is_active } : t
      ));
      
      toast.success(`Topic ${topic.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">No topics found for this assessment</p>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Topics</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24 text-center">Active</TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell className="font-medium">{topic.title}</TableCell>
                <TableCell>{topic.description}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Switch 
                      checked={topic.is_active} 
                      onCheckedChange={() => handleToggleActive(topic)} 
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(topic)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
