
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Topic {
  id: string;
  title: string;
  description: string;
  assessment_title?: string;
}

export function useTopicData(topicId: string | null) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      fetchTopic(topicId);
    } else {
      setIsLoading(false);
      toast.error('No topic selected');
    }
  }, [topicId]);

  const fetchTopic = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('topics')
        .select(`
          id, 
          title, 
          description,
          assessments (
            title
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTopic({
          id: data.id,
          title: data.title,
          description: data.description,
          assessment_title: data.assessments?.title
        });
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
      toast.error('Failed to load topic information');
    } finally {
      setIsLoading(false);
    }
  };

  return { topic, isLoading };
}
