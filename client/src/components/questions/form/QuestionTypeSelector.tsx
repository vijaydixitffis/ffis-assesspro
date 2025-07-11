
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { QuestionFormValues } from '../types';

interface QuestionTypeSelectorProps {
  form: UseFormReturn<QuestionFormValues>;
  isEditing: boolean;
}

export function QuestionTypeSelector({ form, isEditing }: QuestionTypeSelectorProps) {
  const questionType = form.watch('type');
  
  // If editing or adding a multiple choice question, display the question type as read-only text
  if (isEditing || questionType === 'multiple_choice') {
    const displayType = 
      questionType === 'yes_no' ? 'Yes/No' :
      questionType === 'multiple_choice' ? 'Multiple Choice' : 'Free Text';
    
    return (
      <FormItem className="space-y-3">
        <FormLabel>Question Type</FormLabel>
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700">{displayType}</span>
          {isEditing && (
            <span className="ml-2 text-xs text-muted-foreground">(Cannot be changed when editing)</span>
          )}
        </div>
        <FormDescription>
          {isEditing ? "Question type cannot be modified after creation" : "Multiple choice question type is selected"}
        </FormDescription>
      </FormItem>
    );
  }
  
  // For new questions that aren't multiple choice, allow selection
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
