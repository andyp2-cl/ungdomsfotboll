
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface FormButtonsProps {
  onCancel: () => void;
}

export function FormButtons({ onCancel }: FormButtonsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        <X className="h-4 w-4 mr-2" />
        Avbryt
      </Button>
      <Button type="submit">
        <Save className="h-4 w-4 mr-2" />
        Spara
      </Button>
    </div>
  );
}
