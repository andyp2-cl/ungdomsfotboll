
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

  const handleSave = (updatedActivity: Activity) => {
    try {
      console.log("EditActivityDialog - Updating activity:", {
        id: updatedActivity.id,
        playerStatsType: typeof updatedActivity.player_stats,
        homeScore: updatedActivity.homeScore,
        awayScore: updatedActivity.awayScore,
        isWin: updatedActivity.isWin
      });
      
      // Uppdatera aktiviteten
      onActivityUpdate(updatedActivity);
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
        {activity && (
          <EditActivityForm 
            activity={activity} 
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
