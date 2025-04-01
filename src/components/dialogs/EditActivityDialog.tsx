
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

  // Säkerställ att vi har ett rent activity-objekt innan vi skickar det till formuläret
  const sanitizeActivity = (activity: Activity | null): Activity | null => {
    if (!activity) return null;
    
    // Säkerställ att player_stats är korrekt formaterat
    const sanitizedPlayerStats = sanitizePlayerStats(activity.player_stats);
    
    return {
      ...activity,
      player_stats: sanitizedPlayerStats
    };
  };

  const sanitizePlayerStats = (playerStats: any) => {
    if (!playerStats) {
      return { goals: {}, assists: {} };
    }
    
    if (typeof playerStats === 'string') {
      try {
        // Försök att tolka JSON-strängen
        const parsed = JSON.parse(playerStats);
        // Hantera dubbelt stringifierad JSON
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
    
    // Om det redan är ett objekt, säkerställ att det har nödvändiga egenskaper
    return {
      ...playerStats,
      goals: playerStats.goals || {},
      assists: playerStats.assists || {}
    };
  };

  const sanitizedActivity = sanitizeActivity(activity);

  const handleSave = (updatedActivity: Activity) => {
    try {
      console.log("EditActivityDialog - Updating activity:", {
        id: updatedActivity.id,
        playerStatsType: typeof updatedActivity.player_stats,
        homeScore: updatedActivity.homeScore,
        awayScore: updatedActivity.awayScore,
        isWin: updatedActivity.isWin
      });
      
      // Spara i ett lokalt scope för att undvika frysning i asynkrona operationer
      const finalActivity = { ...updatedActivity };
      
      // Uppdatera aktiviteten
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
