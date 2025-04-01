
import React from "react";
import { Activity } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditActivityForm } from "@/components/EditActivityForm";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Make a defensive copy of the activity to avoid mutations
  const activityCopy = activity ? {
    ...activity,
    // Normalize player_stats to ensure it's always an object
    player_stats: typeof activity.player_stats === 'string'
      ? JSON.parse(activity.player_stats)
      : activity.player_stats || { goals: {}, assists: {} }
  } : null;

  const handleSave = (updatedActivity: Activity) => {
    if (!activityCopy) return;
    
    try {
      // Pass the updated activity to the parent component
      onActivityUpdate(updatedActivity);
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Kunde inte spara aktivitet",
        description: "Ett fel uppstod när aktiviteten skulle sparas. Försök igen.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redigera aktivitet</DialogTitle>
        </DialogHeader>
        {activityCopy && (
          <EditActivityForm 
            activity={activityCopy} 
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
