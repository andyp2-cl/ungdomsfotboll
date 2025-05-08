
import React from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, X } from "lucide-react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface HeaderActionButtonsProps {
  onEdit?: (activity: Activity) => void;
  currentActivity: Activity;
  onDeleteActivity?: (activityId: string) => Promise<boolean>;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
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
  return (
    <div className="flex gap-2">
      {onEdit && (
        <Button variant="outline" size="icon" onClick={() => onEdit(currentActivity)}>
          <Edit className="h-5 w-5" />
        </Button>
      )}
      {onDeleteActivity && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
        </AlertDialog>
      )}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleClose}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
