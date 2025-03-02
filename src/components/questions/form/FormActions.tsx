
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onClose: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export function FormActions({ onClose, isSubmitting, isEditing }: FormActionsProps) {
  return (
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
  );
}
