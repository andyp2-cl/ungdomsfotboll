
import { useState } from "react";
import { Activity } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { prepareUpdatedPlayerStats } from "./PlayerStatsUtil";
import { determineMatchOutcome } from "@/hooks/activities/actions/match-result";
import { extractTeamNames, isHomeMatch, isHassleholm } from "./utils";

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
    awayScore?: number
  ) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      console.log("Saving match result:", {
        activityId: activity.id,
        homeScore,
        awayScore,
        existingPlayerStats: activity.player_stats
      });
      
      // Determine if Hässleholms IF won the match
      const isWin = determineMatchOutcome(activity, homeScore, awayScore);
      
      console.log(`Determined match outcome for ${activity.name}: ${isWin === undefined ? 'draw' : isWin ? 'win' : 'loss'}`);
      
      // Create updated player stats - ensure we preserve existing stats
      const currentPlayerStats = activity.player_stats || { goals: {}, assists: {} };
      const updatedPlayerStats = prepareUpdatedPlayerStats(
        {
          ...activity,
          player_stats: currentPlayerStats
        },
        homeScore,
        awayScore,
        isWin
      );
      
      console.log("Updated player stats:", updatedPlayerStats);
      
      // Create updated activity object
      const updatedActivity: Activity = {
        ...activity,
        homeScore,
        awayScore,
        isWin, // This will be true/false/undefined (undefined for draw)
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
        isWin: updatedActivity.isWin,
        player_stats: updatedActivity.player_stats
      });
      
      // Call the activity update function
      await updateActivity(updatedActivity);
      
      // Force clear cache to ensure data is reloaded fresh next time
      localStorage.removeItem('cachedActivities');
      localStorage.removeItem('sb-activities-fetch-time');
      
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
