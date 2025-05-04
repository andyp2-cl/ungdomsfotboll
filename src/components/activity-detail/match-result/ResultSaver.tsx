
import { useState } from "react";
import { Activity } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { prepareUpdatedPlayerStats } from "./PlayerStatsUtil";
import { isHomeMatch, extractTeamNames, isHassleholm } from "./utils";

interface ResultSaverProps {
  activity: Activity;
  updateActivity: (activity: Activity) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
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
      
      // Enhanced logic to determine if Hässleholms IF won the match
      let isWin: boolean | undefined;
      
      // Only calculate outcome if we have scores
      if (homeScore !== undefined && awayScore !== undefined) {
        // For draws (equal scores), isWin will be undefined
        if (homeScore === awayScore) {
          isWin = undefined; // Draw
          console.log("Match is a draw");
        } else {
          // Extract team names to check which team is Hässleholms IF
          const { homeTeam, awayTeam } = extractTeamNames(activity);
          const isHifHome = isHassleholm(homeTeam);
          const isHifAway = isHassleholm(awayTeam);
          
          console.log("Team detection:", {
            homeTeam,
            awayTeam,
            isHifHome,
            isHifAway
          });
          
          // If we can identify that Hässleholms IF is home or away, use that to determine win
          if (isHifHome) {
            isWin = homeScore > awayScore;
            console.log(`HIF is home team, ${isWin ? "win" : "loss"}`);
          } else if (isHifAway) {
            isWin = awayScore > homeScore;
            console.log(`HIF is away team, ${isWin ? "win" : "loss"}`);
          } else {
            // If we can't identify by name, fall back to using isHomeMatch
            const isHome = isHomeMatch(activity);
            isWin = isHome ? (homeScore > awayScore) : (awayScore > homeScore);
            console.log(`Could not detect HIF in team names, using fallback: isHome=${isHome}, isWin=${isWin}`);
          }
        }
        
        console.log(`Determined match outcome for ${activity.name}: ${isWin === undefined ? 'draw' : isWin ? 'win' : 'loss'}`);
      }
      
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
      let updateResult = true;
      if (onMatchResultUpdate) {
        updateResult = await onMatchResultUpdate(activity.id, homeScore, awayScore);
      }
      
      toast({
        title: updateResult ? "Matchresultat sparat" : "Varning: Delvis sparat",
        description: updateResult 
          ? `Resultatet ${homeScore}-${awayScore} har sparats.`
          : "Resultatet sparades lokalt men kunde inte sparas i databasen."
      });
      
      return updateResult;
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
