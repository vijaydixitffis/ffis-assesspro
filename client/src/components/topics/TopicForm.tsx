import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const topicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  sequence_number: z.number().min(1, 'Sequence number must be at least 1'),
  is_active: z.boolean().default(true),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface TopicFormProps {
  topic?: any;
  assessmentId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function TopicForm({ topic, assessmentId, onCancel, onSuccess }: TopicFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: topic?.title || '',
      description: topic?.description || '',
      sequence_number: topic?.sequence_number || 1,
      is_active: topic?.is_active ?? true,
    },
  });

  const onSubmit = async (data: TopicFormData) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      if (topic) {
        // Update existing topic
        const { error } = await supabase
          .from('topics')
          .update({
            title: data.title,
            description: data.description,
            sequence_number: data.sequence_number,
            is_active: data.is_active,
          })
          .eq('id', topic.id);

        if (error) throw error;
        toast.success('Topic updated successfully');
      } else {
        // Create new topic
        const { error } = await supabase
          .from('topics')
          .insert({
            title: data.title,
            description: data.description,
            sequence_number: data.sequence_number,
            is_active: data.is_active,
            assessment_id: assessmentId,
            created_by: user.id,
          });

        if (error) throw error;
        toast.success('Topic created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving topic:', error);
      toast.error('Failed to save topic');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...form.register('title')}
          placeholder="Enter topic title"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Enter topic description"
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="sequence_number">Sequence Number</Label>
        <Input
          id="sequence_number"
          type="number"
          {...form.register('sequence_number', { valueAsNumber: true })}
          placeholder="Enter sequence number"
        />
        {form.formState.errors.sequence_number && (
          <p className="text-sm text-red-500">{form.formState.errors.sequence_number.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={form.watch('is_active')}
          onCheckedChange={(checked) => form.setValue('is_active', checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : topic ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}