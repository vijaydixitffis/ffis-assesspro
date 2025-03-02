
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { QuestionFormValues } from '../types';

interface QuestionTypeSelectorProps {
  form: UseFormReturn<QuestionFormValues>;
  isEditing: boolean;
}

export function QuestionTypeSelector({ form, isEditing }: QuestionTypeSelectorProps) {
  if (!isEditing) return null;
  
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Question Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes_no" id="yes_no" />
                <Label htmlFor="yes_no">Yes/No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple_choice" id="multiple_choice" />
                <Label htmlFor="multiple_choice">Multiple Choice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free_text" id="free_text" />
                <Label htmlFor="free_text">Free Text</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormDescription>
            Select the type of question you want to create
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
