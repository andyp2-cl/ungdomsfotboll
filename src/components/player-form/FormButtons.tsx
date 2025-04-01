
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FormButtonsProps {
  onCancel: () => void;
}

export function FormButtons({ onCancel }: FormButtonsProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-end space-x-2'} pt-4`}>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className={isMobile ? 'w-full' : ''}
      >
        <X className="h-4 w-4 mr-2" />
        Avbryt
      </Button>
      <Button 
        type="submit"
        className={isMobile ? 'w-full' : ''}
      >
        <Save className="h-4 w-4 mr-2" />
        Spara
      </Button>
    </div>
  );
}
