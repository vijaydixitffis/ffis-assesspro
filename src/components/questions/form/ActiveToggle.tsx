
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { QuestionFormValues } from '../types';

interface ActiveToggleProps {
  form: UseFormReturn<QuestionFormValues>;
}

export function ActiveToggle({ form }: ActiveToggleProps) {
  return (
    <FormField
      control={form.control}
      name="is_active"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Active</FormLabel>
            <FormDescription>
              Make this question available in assessments
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
  );
}
