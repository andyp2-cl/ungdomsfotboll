
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddActivityButtonProps {
  onClick: () => void;
}

export function AddActivityButton({ onClick }: AddActivityButtonProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <Button onClick={onClick} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Lägg till
      </Button>
    </div>
  );
}
