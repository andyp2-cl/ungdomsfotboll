
import { Button } from "@/components/ui/button";
import { Edit, Trash2, X } from "lucide-react";
import { Activity } from "@/types/player";

interface HeaderActionButtonsProps {
  onEdit?: (activity: Activity) => void;
  currentActivity: Activity;
  onDeleteActivity?: (activityId: string) => Promise<boolean>;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleClose: () => void;
}

export function HeaderActionButtons({
  onEdit,
  currentActivity,
  onDeleteActivity,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  handleClose
}: HeaderActionButtonsProps) {
  
  const handleEditClick = () => {
    console.log("Edit button clicked for activity:", currentActivity.id, currentActivity.name);
    if (onEdit) {
      console.log("Calling onEdit with activity:", currentActivity);
      onEdit(currentActivity);
    } else {
      console.error("onEdit function is not provided");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Redigera
        </Button>
      )}
      
      {onDeleteActivity && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Ta bort
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
