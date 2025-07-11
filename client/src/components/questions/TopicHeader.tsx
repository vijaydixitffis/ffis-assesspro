
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { QuestionType } from './types';

interface Topic {
  id: string;
  title: string;
  description: string;
  assessment_title?: string;
}

interface TopicHeaderProps {
  topic: Topic | null;
  isAdding: boolean;
  editingQuestion: any;
  topicId: string | null;
  onAddQuestion: (questionType: QuestionType) => void;
}

export default function TopicHeader({ 
  topic, 
  isAdding, 
  editingQuestion, 
  topicId, 
  onAddQuestion 
}: TopicHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Question Management</h1>
        {topic && (
          <div className="text-sm text-muted-foreground">
            Topic: {topic.title} {topic.assessment_title && `(Assessment: ${topic.assessment_title})`}
          </div>
        )}
      </div>
      {!isAdding && !editingQuestion && topicId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              Add New Question <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => onAddQuestion("yes_no")}>
              Yes/No Question
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddQuestion("multiple_choice")}>
              Multi-choice Question
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddQuestion("free_text")}>
              Free-text Question
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
