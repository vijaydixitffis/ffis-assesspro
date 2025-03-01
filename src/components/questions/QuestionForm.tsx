import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Trash, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Ensure these values exactly match the database constraint
const QUESTION_TYPES = ['multiple_choice', 'yes_no', 'free_text'] as const;
type QuestionType = typeof QUESTION_TYPES[number];

// Update the schema to match the database constraints
const questionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  // Use the strict type that matches the database constraint
  type: z.enum(QUESTION_TYPES),
  is_active: z.boolean().default(true),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface Answer {
  id?: string;
  text: string;
  is_correct: boolean;
  marks?: string | null; // Updated to match the new database type
}

interface QuestionFormProps {
  question?: {
    id: string;
    question: string;
    type: QuestionType;
    is_active: boolean;
    answers?: Answer[];
  };
  topicId: string;
  userId: string;
  onClose: () => void;
}

export default function QuestionForm({ question, topicId, userId, onClose }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const isEditing = !!question;

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: question?.question || '',
      type: question?.type || 'multiple_choice',
      is_active: question?.is_active ?? true
    }
  });

  const questionType = form.watch('type');

  useEffect(() => {
    // This will run when the component mounts
    if (isEditing && question.answers && question.answers.length > 0) {
      console.log('Setting answers from question:', question.answers);
      setAnswers([...question.answers]);
    } else {
      // Initialize with default answers based on question type
      setDefaultAnswers(form.getValues('type'));
    }
  }, [isEditing, question]);

  // Add another useEffect to handle type changes
  useEffect(() => {
    // Only reset answers when question type changes and we're not in editing mode
    // or if we are in editing mode but answers haven't been loaded yet
    if (!isEditing || (isEditing && answers.length === 0)) {
      setDefaultAnswers(questionType);
    }
  }, [questionType, isEditing, answers.length]);

  const setDefaultAnswers = (type: QuestionType) => {
    if (type === 'yes_no') {
      setAnswers([
        { text: 'Yes', is_correct: true, marks: '1' },
        { text: 'No', is_correct: false, marks: '0' }
      ]);
    } else if (type === 'multiple_choice') {
      setAnswers([
        { text: 'Option 1', is_correct: true, marks: '1' },
        { text: 'Option 2', is_correct: false, marks: '0' }
      ]);
    } else if (type === 'free_text') {
      setAnswers([{ text: 'Correct answer', is_correct: true, marks: '1' }]);
    }
  };

  const addAnswer = () => {
    // Fixed: Use a proper state update to preserve existing answers
    if (answers.length < 4) {
      setAnswers(prevAnswers => [...prevAnswers, { text: '', is_correct: false, marks: '0' }]);
      toast.success("New option added");
    } else {
      toast.error('Maximum 4 options allowed');
    }
  };

  const removeAnswer = (index: number) => {
    // Fixed: Use a proper state update
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers.splice(index, 1);
      return newAnswers;
    });
  };

  const updateAnswer = (index: number, field: keyof Answer, value: any) => {
    // Fixed: Use a proper state update
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = { ...newAnswers[index], [field]: value };

      // If setting this answer as correct, set all others to incorrect
      if (field === 'is_correct' && value === true) {
        newAnswers.forEach((answer, i) => {
          if (i !== index) {
            newAnswers[i] = { ...newAnswers[i], is_correct: false };
          }
        });
      }

      return newAnswers;
    });
  };

  const validateAnswers = () => {
    // Check if we have at least 1 answer for free_text or 2 for other types
    if (questionType === 'free_text' && answers.length < 1) {
      toast.error('Free text questions must have at least 1 correct answer');
      return false;
    }
    
    if (questionType !== 'free_text' && answers.length < 2) {
      toast.error('Questions must have at least 2 options');
      return false;
    }

    // Check if all answers have text
    const emptyAnswers = answers.filter(a => !a.text.trim());
    if (emptyAnswers.length > 0) {
      toast.error('All answers must have text');
      return false;
    }

    // Check if there's exactly one correct answer
    const correctAnswers = answers.filter(a => a.is_correct);
    if (correctAnswers.length !== 1) {
      toast.error('There must be exactly one correct answer');
      return false;
    }

    return true;
  };

  const onSubmit = async (values: QuestionFormValues) => {
    if (!validateAnswers()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      let questionId = question?.id;
      
      if (isEditing) {
        // Update existing question
        const { error } = await supabase
          .from('questions')
          .update({
            question: values.question,
            type: values.type,
            is_active: values.is_active
          })
          .eq('id', question.id);
        
        if (error) {
          console.error('Error updating question:', error);
          toast.error(`Failed to update question: ${error.message}`);
          return;
        }
        
        // Delete existing answers
        const { error: deleteError } = await supabase
          .from('answers')
          .delete()
          .eq('question_id', question.id);
        
        if (deleteError) {
          console.error('Error deleting answers:', deleteError);
          toast.error(`Error removing old answers: ${deleteError.message}`);
          return;
        }
      } else {
        // Create new question
        console.log('Creating new question with type:', values.type);
        const { data, error } = await supabase
          .from('questions')
          .insert({
            question: values.question,
            type: values.type,
            is_active: values.is_active,
            topic_id: topicId,
            created_by: userId
          })
          .select('id');
        
        if (error) {
          console.error('Error creating question:', error);
          toast.error(`Failed to create question: ${error.message}`);
          return;
        }
        
        if (!data || data.length === 0) {
          console.error('No question ID returned after insert');
          toast.error('Failed to get question ID');
          return;
        }
        
        questionId = data[0].id;
      }
      
      // Ensure we have a question ID before inserting answers
      if (!questionId) {
        console.error('Missing question ID');
        toast.error('Error saving question: No question ID available');
        return;
      }
      
      // Process answers to ensure correct data format - no need to constrain marks anymore
      const answersToInsert = answers.map(answer => ({
        text: answer.text,
        is_correct: answer.is_correct,
        marks: answer.marks, // Just pass the marks value as is (text)
        question_id: questionId
      }));
      
      // Insert answers
      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersToInsert);
      
      if (answersError) {
        console.error('Error inserting answers:', answersError);
        toast.error(`Failed to save answers: ${answersError.message}`);
        
        // If this is a new question and answers failed, we should delete the question to avoid orphaned data
        if (!isEditing) {
          await supabase.from('questions').delete().eq('id', questionId);
        }
        return;
      }
      
      toast.success(isEditing ? 'Question updated successfully' : 'Question created successfully');
      
      // Reset form and close
      form.reset();
      onClose();
      
    } catch (error) {
      const err = error as Error;
      console.error('Error saving question:', err);
      toast.error(`Unexpected error: ${err.message}`);
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Answer Options</h3>
            {questionType === 'multiple_choice' && answers.length < 4 && (
              <Button 
                type="button" 
                onClick={addAnswer} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Option
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {answers.map((answer, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={answer.is_correct}
                          onCheckedChange={(checked) => updateAnswer(index, 'is_correct', checked)}
                        />
                        <Label>{answer.is_correct ? 'Correct answer' : 'Incorrect answer'}</Label>
                      </div>
                      {(questionType === 'multiple_choice' && answers.length > 2) && (
                        <Button 
                          type="button" 
                          onClick={() => removeAnswer(index)} 
                          variant="ghost" 
                          size="sm"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor={`answer-${index}`}>Answer Text</Label>
                        <Input
                          id={`answer-${index}`}
                          value={answer.text}
                          onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                          placeholder="Enter answer text"
                          disabled={questionType === 'yes_no'}
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`marks-${index}`}>Marks</Label>
                        <Input
                          id={`marks-${index}`}
                          value={answer.marks || ''}
                          onChange={(e) => updateAnswer(index, 'marks', e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {questionType === 'free_text' && (
              <div className="text-sm text-muted-foreground italic">
                For free text questions, provide the exact correct answer text that will be used for scoring.
              </div>
            )}
          </div>
        </div>

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
