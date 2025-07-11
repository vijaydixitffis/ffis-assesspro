import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Assessment {
  id: string;
  title: string;
  description: string;
}

interface AssessmentSelectorProps {
  assessments: Assessment[];
  selectedId: string | null;
  onChange: (assessmentId: string) => void;
}

export default function AssessmentSelector({ assessments, selectedId, onChange }: AssessmentSelectorProps) {
  return (
    <Select value={selectedId || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select an assessment" />
      </SelectTrigger>
      <SelectContent>
        {assessments.map((assessment) => (
          <SelectItem key={assessment.id} value={assessment.id}>
            {assessment.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}