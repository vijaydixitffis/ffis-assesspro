
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { QuestionFormValues } from '../types';

interface QuestionInputProps {
  form: UseFormReturn<QuestionFormValues>;
}

export function QuestionInput({ form }: QuestionInputProps) {
  return (
    <FormField
      control={form.control}
      name="question"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Question Text</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter your question" 
              className="min-h-24" 
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Write a clear, concise question
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
