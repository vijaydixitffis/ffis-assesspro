
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { QuestionFormProps, QuestionFormValues, questionSchema, Answer } from './types';
import AnswerOptions from './AnswerOptions';
import { validateAnswers, saveQuestion, setDefaultAnswers } from './questionUtils';
import { QuestionInput } from './form/QuestionInput';
import { QuestionTypeSelector } from './form/QuestionTypeSelector';
import { ActiveToggle } from './form/ActiveToggle';
import { FormActions } from './form/FormActions';

export default function QuestionForm({ question, topicId, userId, onClose, initialQuestionType }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const isEditing = !!question;

  // Define default values that match schema requirements
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
      setAnswers(question.answers.map(answer => ({
        ...answer,
        id: answer.id,
        text: answer.text,
        is_correct: answer.is_correct,
        marks: answer.marks || '0'
      })));
    } else {
      // Initialize with default answers based on question type
      setAnswers(setDefaultAnswers(questionType));
    }
  }, [isEditing, question, questionType]);

  // Update answers when question type changes (only if not editing)
  useEffect(() => {
    if (!isEditing) {
      setAnswers(setDefaultAnswers(questionType));
    }
  }, [questionType, isEditing]);

  const onSubmit = async (values: QuestionFormValues) => {
    if (!validateAnswers(answers, questionType)) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create a properly typed object for saveQuestion
      const questionData: QuestionFormValues = {
        question: values.question,
        type: values.type,
        is_active: values.is_active
      };
      
      const result = await saveQuestion(
        questionData,
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
        <QuestionInput form={form} />
        <QuestionTypeSelector form={form} isEditing={isEditing} />
        <AnswerOptions 
          answers={answers}
          setAnswers={setAnswers}
          questionType={questionType}
        />
        <ActiveToggle form={form} />
        <FormActions 
          onClose={onClose} 
          isSubmitting={isSubmitting} 
          isEditing={isEditing} 
        />
      </form>
    </Form>
  );
}
