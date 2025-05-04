
// We can reuse the existing FormButtons.tsx but enhance it for our needs
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface FormButtonsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function FormButtons({ onCancel, onSave, isSaving = false }: FormButtonsProps) {
  return (
    <div className="flex justify-end space-x-2 mt-4">
      <Button 
        type="button" 
        variant="secondary" 
        onClick={onCancel}
        disabled={isSaving}
      >
        <X className="h-4 w-4 mr-2" />
        Avbryt
      </Button>
      <Button 
        type="button" 
        onClick={onSave}
        disabled={isSaving}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Sparar...' : 'Spara'}
      </Button>
    </div>
  );
}
