
import { useState } from "react";
import { Activity } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { prepareUpdatedPlayerStats } from "./PlayerStatsUtil";
import { isHomeMatch, calculateWinStatus } from "./utils";

interface ResultSaverProps {
  activity: Activity;
  updateActivity: (activity: Activity) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number, isWin?: boolean) => Promise<void>;
}

export function useResultSaver({
  activity,
  updateActivity,
  onMatchResultUpdate,
}: ResultSaverProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const saveMatchResult = async (
    homeScore?: number,
    awayScore?: number,
    manualWinStatus?: boolean
  ) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      console.log("Saving match result:", {
        homeScore,
        awayScore,
        manualWinStatus: manualWinStatus === undefined ? "undefined/draw" : manualWinStatus
      });
      
      // Calculate if it's a win (if not manually set)
      // For scores, if they're equal it's a draw (undefined)
      // If manual status is set, use that
      let isWin: boolean | undefined = manualWinStatus;
      
      // If no manual status but we have scores, calculate based on the scores
      if (isWin === undefined && homeScore !== undefined && awayScore !== undefined) {
        if (homeScore === awayScore) {
          isWin = undefined; // Draw
        } else {
          const isHome = isHomeMatch(activity);
          isWin = calculateWinStatus(homeScore, awayScore, isHome);
        }
      }
      
      console.log(`Final isWin value: ${isWin === undefined ? 'undefined (draw)' : isWin ? 'true (win)' : 'false (loss)'}`)
      
      // Create updated player stats
      const updatedPlayerStats = prepareUpdatedPlayerStats(
        activity,
        homeScore,
        awayScore,
        isWin,
        true // Assuming we're always the home team for now
      );
      
      // Create updated activity object
      const updatedActivity: Activity = {
        ...activity,
        homeScore,
        awayScore,
        isWin,
        player_stats: updatedPlayerStats,
      };
      
      // Update the result string if we have scores
      if (homeScore !== undefined && awayScore !== undefined) {
        updatedActivity.result = `${homeScore}-${awayScore}`;
      } else {
        updatedActivity.result = undefined;
      }
      
      console.log("Updating activity with new result:", {
        activityId: updatedActivity.id,
        result: updatedActivity.result,
        isWin: updatedActivity.isWin
      });
      
      // Call the activity update function
      await updateActivity(updatedActivity);
      
      // Also call the match result update function if provided
      if (onMatchResultUpdate) {
        await onMatchResultUpdate(activity.id, homeScore, awayScore, isWin);
      }
      
      toast({
        title: "Matchresultat sparat",
        description: `Resultatet ${homeScore}-${awayScore} har sparats.`
      });
      
      return true;
    } catch (error) {
      console.error("Error saving match result:", error);
      toast({
        title: "Fel vid sparande av matchresultat",
        description: "Resultatet kunde inte sparas. Försök igen.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveMatchResult, isSaving };
}
