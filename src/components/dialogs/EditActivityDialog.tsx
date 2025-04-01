import React from "react";
import { Activity } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditActivityForm } from "@/components/EditActivityForm";
import { useToast } from "@/hooks/use-toast";
import { normalizePlayerStats } from "@/hooks/activities/utils/playerStatsUtils";

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
    player_stats: normalizePlayerStats(activity.player_stats)
  } : null;

  const handleSave = async (updatedActivity: Activity) => {
    if (!activityCopy) return;
    
    try {
      console.log("Handling activity save:", updatedActivity.name);
      
      // Pass the updated activity to the parent component
      onActivityUpdate(updatedActivity);
      
      // Close the dialog only after successful update
      onOpenChange(false);
      
      console.log("Activity update completed");
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
