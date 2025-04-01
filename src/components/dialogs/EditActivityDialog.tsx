
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
  const sanitizedActivity = activity ? {
    ...activity,
    // Ensure player_stats is properly formatted as an object
    player_stats: (() => {
      if (!activity.player_stats) {
        return { goals: {}, assists: {} };
      }
      
      if (typeof activity.player_stats === 'string') {
        try {
          // Try to parse JSON string
          const parsed = JSON.parse(activity.player_stats);
          // Handle double-stringified JSON
          if (typeof parsed === 'string') {
            try {
              return JSON.parse(parsed);
            } catch (e) {
              console.error("Double-string parse failed:", e);
              return { goals: {}, assists: {} };
            }
          }
          return parsed;
        } catch (e) {
          console.error("Error parsing player_stats string:", e);
          return { goals: {}, assists: {} };
        }
      }
      
      return activity.player_stats;
    })()
  } : null;

  const handleSave = (updatedActivity: Activity) => {
    try {
      // Ensure player_stats is properly handled before updating
      const finalActivity = {
        ...updatedActivity,
        player_stats: (() => {
          // If no player_stats, initialize with empty structure
          if (!updatedActivity.player_stats) {
            return { 
              goals: {}, 
              assists: {},
              scores: {
                home: updatedActivity.homeScore,
                away: updatedActivity.awayScore
              },
              isWin: updatedActivity.isWin
            };
          }
          
          // If player_stats is a string, parse it
          if (typeof updatedActivity.player_stats === 'string') {
            try {
              const parsed = JSON.parse(updatedActivity.player_stats);
              return {
                ...(typeof parsed === 'string' ? JSON.parse(parsed) : parsed),
                goals: parsed.goals || {},
                assists: parsed.assists || {},
                scores: {
                  home: updatedActivity.homeScore,
                  away: updatedActivity.awayScore
                },
                isWin: updatedActivity.isWin
              };
            } catch (e) {
              console.error("Failed to parse player_stats string:", e);
              return { 
                goals: {}, 
                assists: {},
                scores: {
                  home: updatedActivity.homeScore,
                  away: updatedActivity.awayScore
                },
                isWin: updatedActivity.isWin
              };
            }
          }
          
          // If it's already an object, ensure it has the required properties
          return {
            ...updatedActivity.player_stats,
            goals: updatedActivity.player_stats.goals || {},
            assists: updatedActivity.player_stats.assists || {},
            scores: {
              home: updatedActivity.homeScore,
              away: updatedActivity.awayScore
            },
            isWin: updatedActivity.isWin
          };
        })()
      };
      
      console.log("Updating activity with:", {
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
