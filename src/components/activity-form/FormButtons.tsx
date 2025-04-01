
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface FormButtonsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FormButtons({ onCancel, isSubmitting = false }: FormButtonsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <X className="h-4 w-4 mr-2" />
        Avbryt
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Sparar...' : 'Spara'}
      </Button>
    </div>
  );
}
