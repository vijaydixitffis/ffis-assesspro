
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

const topicSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  is_active: z.boolean().default(true),
  sequence_number: z.coerce.number().int().min(0, 'Sequence must be a positive number').default(0)
});

type TopicFormValues = z.infer<typeof topicSchema>;

interface TopicFormProps {
  topic?: {
    id: string;
    title: string;
    description: string;
    is_active: boolean;
    sequence_number?: number;
  };
  assessmentId: string;
  userId: string;
  onClose: () => void;
}

export default function TopicForm({ topic, assessmentId, userId, onClose }: TopicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!topic;

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: topic?.title || '',
      description: topic?.description || '',
      is_active: topic?.is_active ?? true,
      sequence_number: topic?.sequence_number || 0
    }
  });

  const onSubmit = async (values: TopicFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        // Update existing topic
        const { error } = await supabase
          .from('topics')
          .update({
            title: values.title,
            description: values.description,
            is_active: values.is_active,
            sequence_number: values.sequence_number
          })
          .eq('id', topic.id);
        
        if (error) throw error;
        
        toast.success('Topic updated successfully');
      } else {
        // Create new topic
        const { error } = await supabase
          .from('topics')
          .insert({
            title: values.title,
            description: values.description,
            is_active: values.is_active,
            sequence_number: values.sequence_number,
            assessment_id: assessmentId,
            created_by: userId
          });
        
        if (error) throw error;
        
        toast.success('Topic created successfully');
      }
      
      // Reset form and close
      form.reset();
      onClose();
      
    } catch (error) {
      console.error('Error saving topic:', error);
      toast.error('Failed to save topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter topic title" {...field} />
              </FormControl>
              <FormDescription>
                A clear, concise title for this topic
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter topic description" 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide a detailed description of what this topic covers
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sequence_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sequence Number</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  placeholder="Enter sequence number" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Order in which this topic will appear (lower numbers first)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Make this topic available in assessments
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Topic' : 'Create Topic'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
