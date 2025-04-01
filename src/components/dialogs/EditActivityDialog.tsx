
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

  // Ensure we have a clean activity object before passing it to the form
  const sanitizePlayerStats = (playerStats: any) => {
    if (!playerStats) {
      return { goals: {}, assists: {} };
    }
    
    if (typeof playerStats === 'string') {
      try {
        // Try to parse JSON string
        const parsed = JSON.parse(playerStats);
        // Handle double-stringified JSON
        if (typeof parsed === 'string') {
          try {
            const doubleParsed = JSON.parse(parsed);
            return {
              ...doubleParsed,
              goals: doubleParsed.goals || {},
              assists: doubleParsed.assists || {}
            };
          } catch (e) {
            console.error("Double-string parse failed:", e);
            return { goals: {}, assists: {} };
          }
        }
        return {
          ...parsed,
          goals: parsed.goals || {},
          assists: parsed.assists || {}
        };
      } catch (e) {
        console.error("Error parsing player_stats string:", e);
        return { goals: {}, assists: {} };
      }
    }
    
    // If it's already an object, ensure it has the required properties
    return {
      ...playerStats,
      goals: playerStats.goals || {},
      assists: playerStats.assists || {}
    };
  };

  const sanitizedActivity = activity ? {
    ...activity,
    // Ensure player_stats is properly formatted as an object
    player_stats: sanitizePlayerStats(activity.player_stats)
  } : null;

  const handleSave = (updatedActivity: Activity) => {
    try {
      // Ensure player_stats is properly handled before updating
      const sanitizedPlayerStats = sanitizePlayerStats(updatedActivity.player_stats);
      
      // Add scores and win status to player_stats
      const finalPlayerStats = {
        ...sanitizedPlayerStats,
        scores: {
          home: updatedActivity.homeScore || 0,
          away: updatedActivity.awayScore || 0
        },
        isWin: updatedActivity.isWin === undefined ? false : updatedActivity.isWin
      };
      
      const finalActivity = {
        ...updatedActivity,
        player_stats: finalPlayerStats
      };
      
      console.log("EditActivityDialog - Updating activity with:", {
        id: finalActivity.id,
        playerStatsType: typeof finalActivity.player_stats,
        playerStats: finalActivity.player_stats
      });
      
      // Now update the activity
      onActivityUpdate(finalActivity);
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
        {sanitizedActivity && (
          <EditActivityForm 
            activity={sanitizedActivity} 
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
