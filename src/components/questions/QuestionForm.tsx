
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { QuestionFormProps, QuestionFormValues, questionSchema, Answer } from './types';
import AnswerOptions from './AnswerOptions';
import { validateAnswers, saveQuestion, setDefaultAnswers } from './questionUtils';

export default function QuestionForm({ question, topicId, userId, onClose, initialQuestionType }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const isEditing = !!question;

  // Define default values with non-optional properties to match schema requirements
  const defaultValues: QuestionFormValues = {
    question: question?.question || '',
    type: question?.type || initialQuestionType || 'multiple_choice',
    is_active: question?.is_active !== undefined ? question.is_active : true
  };

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues
  });

  const questionType = form.watch('type');

  // Initialize answers when component mounts or question changes
  useEffect(() => {
    if (isEditing && question.answers && question.answers.length > 0) {
      console.log('Setting answers from question:', question.answers);
      // Keep the original values for is_correct (including null)
      const formattedAnswers = question.answers.map(answer => ({
        ...answer,
        marks: answer.marks || '0'
      }));
      setAnswers(formattedAnswers);
    } else {
      // Initialize with default answers based on question type
      setAnswers(setDefaultAnswers(questionType));
    }
  }, [isEditing, question, question?.id, questionType]);

  // Add another useEffect to handle type changes
  useEffect(() => {
    // Only reset answers when question type changes and we're not in editing mode
    if (!isEditing || (isEditing && answers.length === 0)) {
      setAnswers(setDefaultAnswers(questionType));
    }
  }, [questionType, isEditing, answers.length]);

  const onSubmit = async (values: QuestionFormValues) => {
    if (!validateAnswers(answers, questionType)) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await saveQuestion(
        values,
        answers,
        isEditing,
        question?.id,
        topicId,
        userId
      );
      
      if (result !== null) {
        // Reset form and close
        form.reset();
        onClose();
      }
    } catch (error) {
      const err = error as Error;
      console.error('Error saving question:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        {isEditing && (
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
        )}

        <AnswerOptions 
          answers={answers}
          setAnswers={setAnswers}
          questionType={questionType}
        />

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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Question' : 'Create Question'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
