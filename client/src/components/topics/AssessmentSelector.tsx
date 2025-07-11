
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Assessment {
  id: string;
  title: string;
  description: string;
}

interface AssessmentSelectorProps {
  assessments: Assessment[];
  selectedId: string | null;
  onChange: (id: string) => void;
  isLoading: boolean;
}

export default function AssessmentSelector({ 
  assessments, 
  selectedId, 
  onChange, 
  isLoading 
}: AssessmentSelectorProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (assessments.length === 0) {
    return <p className="text-muted-foreground">No assessments available</p>;
  }

  return (
    <Select 
      value={selectedId || undefined} 
      onValueChange={onChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an assessment" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {assessments.map((assessment) => (
            <SelectItem key={assessment.id} value={assessment.id}>
              {assessment.title}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
