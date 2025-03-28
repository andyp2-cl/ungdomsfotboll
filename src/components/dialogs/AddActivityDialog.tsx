
import React from "react";
import { Activity } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddActivityForm } from "@/components/AddActivityForm";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: Activity) => void;
}

export function AddActivityDialog({ 
  open, 
  onOpenChange, 
  onAddActivity 
}: AddActivityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till ny aktivitet</DialogTitle>
        </DialogHeader>
        <AddActivityForm 
          onSave={(activity) => {
            onAddActivity(activity);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
