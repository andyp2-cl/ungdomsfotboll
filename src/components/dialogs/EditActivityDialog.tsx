
import React from "react";
import { Activity } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditActivityForm } from "@/components/EditActivityForm";

interface EditActivityDialogProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityUpdate: (activity: Activity) => void;
}

export function EditActivityDialog({ 
  activity, 
  open, 
  onOpenChange, 
  onActivityUpdate 
}: EditActivityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redigera aktivitet</DialogTitle>
        </DialogHeader>
        {activity && (
          <EditActivityForm 
            activity={activity} 
            onSave={(updatedActivity) => {
              onActivityUpdate(updatedActivity);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
