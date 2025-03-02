
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Answer } from './types';
import { Trash, Plus } from 'lucide-react';

interface QuestionFormProps {
  onSubmit: (questionData: { 
    question: string; 
    type: "multiple_choice" | "yes_no" | "free_text"; 
    is_active: boolean;
    sequence_number?: number;
    answers?: Answer[];
  }) => Promise<void>;
  initialQuestion?: string;
  initialType?: "multiple_choice" | "yes_no" | "free_text";
  initialIsActive?: boolean;
  initialSequenceNumber?: number;
  initialAnswers?: Answer[];
  onCancel: () => void;
  isEditing?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ 
  onSubmit, 
  initialQuestion = '', 
  initialType = 'multiple_choice', 
  initialIsActive = true,
  initialSequenceNumber,
  initialAnswers = [],
  onCancel,
  isEditing = false
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [questionType, setQuestionType] = useState<"multiple_choice" | "yes_no" | "free_text">(initialType);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [sequenceNumber, setSequenceNumber] = useState<number | undefined>(initialSequenceNumber);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize default answers based on question type
  useEffect(() => {
    if (answers.length === 0) {
      if (questionType === 'multiple_choice') {
        setAnswers([
          { text: '', is_correct: false, marks: '0' },
          { text: '', is_correct: false, marks: '0' },
          { text: '', is_correct: false, marks: '0' },
          { text: '', is_correct: false, marks: '0' }
        ]);
      } else if (questionType === 'yes_no') {
        setAnswers([
          { text: 'Yes', is_correct: true, marks: '1' },
          { text: 'No', is_correct: false, marks: '0' }
        ]);
      } else if (questionType === 'free_text') {
        setAnswers([{ text: '', is_correct: true, marks: '1' }]);
      }
    }
  }, [questionType]);

  // Update answers when question type changes
  useEffect(() => {
    if (!isEditing) {
      if (questionType === 'multiple_choice') {
        setAnswers([
          { text: '', is_correct: false, marks: '0' },
          { text: '', is_correct: false, marks: '0' },
          { text: '', is_correct: false, marks: '0' },
          { text: '', is_correct: false, marks: '0' }
        ]);
      } else if (questionType === 'yes_no') {
        setAnswers([
          { text: 'Yes', is_correct: true, marks: '1' },
          { text: 'No', is_correct: false, marks: '0' }
        ]);
      } else if (questionType === 'free_text') {
        setAnswers([{ text: '', is_correct: true, marks: '1' }]);
      }
    }
  }, [questionType, isEditing]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Validate answers
      if (questionType === 'multiple_choice') {
        const filledAnswers = answers.filter(a => a.text.trim() !== '');
        if (filledAnswers.length < 2) {
          throw new Error('Please provide at least 2 answer options');
        }
        
        const hasCorrectAnswer = answers.some(a => a.is_correct === true);
        if (!hasCorrectAnswer) {
          throw new Error('Please mark at least one answer as correct');
        }
      } else if (questionType === 'free_text' && (!answers[0] || answers[0].text.trim() === '')) {
        throw new Error('Please provide the correct answer for the free text question');
      }
      
      const questionData = {
        question: question,
        type: questionType,
        is_active: isActive,
        sequence_number: sequenceNumber,
        answers: answers
      };
      
      await onSubmit(questionData);
      toast.success('Question saved successfully!');
    } catch (e: any) {
      setError(e.message || 'Failed to save question');
      toast.error(e.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAnswer = (index: number, field: keyof Answer, value: any) => {
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = { ...newAnswers[index], [field]: value };
      return newAnswers;
    });
  };

  const addAnswerOption = () => {
    if (questionType === 'multiple_choice' && answers.length < 8) {
      setAnswers([...answers, { text: '', is_correct: false, marks: '0' }]);
    }
  };

  const removeAnswerOption = (index: number) => {
    if (questionType === 'multiple_choice' && answers.length > 2) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question text"
        />
      </div>

      <div>
        <Label htmlFor="sequenceNumber">Sequence Number</Label>
        <Input
          id="sequenceNumber"
          type="number"
          value={sequenceNumber || ''}
          onChange={(e) => setSequenceNumber(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Enter sequence number (optional)"
        />
      </div>

      {!isEditing && (
        <div>
          <Label>Question Type</Label>
          <Select value={questionType} onValueChange={(value) => setQuestionType(value as "multiple_choice" | "yes_no" | "free_text")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="yes_no">Yes/No</SelectItem>
              <SelectItem value="free_text">Free Text</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isEditing && (
        <div>
          <Label>Question Type</Label>
          <div className="text-sm text-muted-foreground mt-1">
            {questionType === 'multiple_choice' ? 'Multiple Choice' : 
             questionType === 'yes_no' ? 'Yes/No' : 'Free Text'}
          </div>
        </div>
      )}

      {/* Answers Section */}
      <div className="space-y-4 border p-4 rounded-md">
        <Label className="text-base font-medium">Answer Options</Label>

        {/* Multiple Choice Answers */}
        {questionType === 'multiple_choice' && (
          <div className="space-y-3">
            {answers.map((answer, index) => (
              <div key={index} className="flex gap-4 items-center border p-3 rounded-md">
                <div className="flex-1">
                  <Label htmlFor={`answer-${index}`}>Option {index + 1}</Label>
                  <Input
                    id={`answer-${index}`}
                    value={answer.text}
                    onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                    placeholder={`Answer option ${index + 1}`}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Label htmlFor={`correct-${index}`}>Correct</Label>
                  <Switch
                    id={`correct-${index}`}
                    checked={answer.is_correct === true}
                    onCheckedChange={(checked) => updateAnswer(index, 'is_correct', checked)}
                  />
                </div>
                <div className="w-20">
                  <Label htmlFor={`marks-${index}`}>Marks</Label>
                  <Input
                    id={`marks-${index}`}
                    type="number"
                    value={answer.marks || '0'}
                    onChange={(e) => updateAnswer(index, 'marks', e.target.value)}
                    min="0"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeAnswerOption(index)}
                  disabled={answers.length <= 2}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={addAnswerOption}
              disabled={answers.length >= 8}
              className="w-full mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
          </div>
        )}

        {/* Yes/No Answers */}
        {questionType === 'yes_no' && (
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Options</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  Yes/No questions have fixed options: Yes and No
                </div>
              </div>
              <div className="w-28">
                <Label>Correct Answer</Label>
                <RadioGroup 
                  value={answers.findIndex(a => a.is_correct === true).toString()} 
                  onValueChange={(value) => {
                    const newAnswers = [...answers];
                    newAnswers.forEach((a, i) => {
                      a.is_correct = i.toString() === value;
                    });
                    setAnswers(newAnswers);
                  }}
                  className="flex gap-4 mt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="yes-correct" />
                    <Label htmlFor="yes-correct">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="no-correct" />
                    <Label htmlFor="no-correct">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label htmlFor="yes-marks">Marks for Yes</Label>
                <Input
                  id="yes-marks"
                  type="number"
                  value={answers[0]?.marks || '0'}
                  onChange={(e) => updateAnswer(0, 'marks', e.target.value)}
                  min="0"
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="no-marks">Marks for No</Label>
                <Input
                  id="no-marks"
                  type="number"
                  value={answers[1]?.marks || '0'}
                  onChange={(e) => updateAnswer(1, 'marks', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Free Text Answer */}
        {questionType === 'free_text' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="correct-answer">Correct Answer</Label>
              <Textarea
                id="correct-answer"
                value={answers[0]?.text || ''}
                onChange={(e) => updateAnswer(0, 'text', e.target.value)}
                placeholder="Enter the correct answer"
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the exact text that will be considered correct. The answer is case-insensitive.
              </p>
            </div>
            <div>
              <Label htmlFor="free-text-marks">Marks</Label>
              <Input
                id="free-text-marks"
                type="number"
                value={answers[0]?.marks || '1'}
                onChange={(e) => updateAnswer(0, 'marks', e.target.value)}
                min="0"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="active">Active</Label>
        <Switch
          id="active"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked)}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? 'Saving...' : 'Save Question'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionForm;
