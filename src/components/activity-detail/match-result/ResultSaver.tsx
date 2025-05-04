
import { useState } from "react";
import { Activity } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { prepareUpdatedPlayerStats } from "./PlayerStatsUtil";

interface ResultSaverProps {
  activity: Activity;
  updateActivity: (activity: Activity) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
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
        manualWinStatus
      });
      
      // Calculate if it's a win (if not manually set)
      const isWin = manualWinStatus !== undefined 
        ? manualWinStatus 
        : homeScore !== undefined && awayScore !== undefined 
          ? homeScore > awayScore 
          : undefined;
      
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
        await onMatchResultUpdate(activity.id, homeScore, awayScore);
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
