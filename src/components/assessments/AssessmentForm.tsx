
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

const assessmentSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  is_active: z.boolean().default(true)
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  assessment?: {
    id: string;
    title: string;
    description: string;
    is_active: boolean;
  };
  userId: string;
  onClose: () => void;
}

export default function AssessmentForm({ assessment, userId, onClose }: AssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!assessment;

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: assessment?.title || '',
      description: assessment?.description || '',
      is_active: assessment?.is_active ?? true
    }
  });

  const onSubmit = async (values: AssessmentFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        // Update existing assessment
        const { error } = await supabase
          .from('assessments')
          .update({
            title: values.title,
            description: values.description,
            is_active: values.is_active
          })
          .eq('id', assessment.id);
        
        if (error) throw error;
        
        toast.success('Assessment updated successfully');
      } else {
        // Create new assessment
        const { error } = await supabase
          .from('assessments')
          .insert({
            title: values.title,
            description: values.description,
            is_active: values.is_active,
            created_by: userId
          });
        
        if (error) throw error;
        
        toast.success('Assessment created successfully');
      }
      
      // Reset form and close
      form.reset();
      onClose();
      
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
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
                <Input placeholder="Enter assessment title" {...field} />
              </FormControl>
              <FormDescription>
                A clear, concise title for this assessment
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
                  placeholder="Enter assessment description" 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide a detailed description of what this assessment covers
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
                  Make this assessment available to users
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Assessment' : 'Create Assessment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
