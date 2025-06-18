import React from "react";
import { Activity } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditActivityForm } from "@/components/EditActivityForm";
import { useToast } from "@/hooks/use-toast";
import { normalizePlayerStats } from "@/hooks/activities/utils/playerStatsUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // Make a defensive copy of the activity to avoid mutations
  const activityCopy = activity ? {
    ...activity,
    // Normalize player_stats to ensure it's always an object
    player_stats: normalizePlayerStats(activity.player_stats)
  } : null;

  const handleSave = async (updatedActivity: Activity) => {
    if (!activityCopy) return;
    
    try {
      console.log("EditActivityDialog handleSave called with:", updatedActivity);
      console.log("Activity leagueId:", updatedActivity.leagueId);
      
      // Pass the updated activity to the parent component
      await onActivityUpdate(updatedActivity);
      console.log("onActivityUpdate completed");
      
      // Close the dialog only after successful update
      onOpenChange(false);
      
      console.log("Activity update completed and dialog closed");
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Redigera aktivitet</DialogTitle>
        </DialogHeader>
        
        {activityCopy && (
          <ScrollArea className="max-h-[calc(90vh-8rem)] pr-2">
            <div className="pb-4">
              <EditActivityForm 
                activity={activityCopy} 
                onSave={handleSave}
                onCancel={() => onOpenChange(false)}
              />
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
