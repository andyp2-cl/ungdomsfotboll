
import { Activity } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { isHomeMatch, calculateWinStatus } from "./utils";
import { prepareUpdatedPlayerStats } from "./PlayerStatsUtil";
import { supabase } from "@/lib/supabase";
import { formatActivityForDatabase } from "@/utils/database/formatters";

interface UseResultSaverParams {
  activity: Activity;
  updateActivity: (updatedActivity: Activity) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function useResultSaver({ 
  activity, 
  updateActivity, 
  onMatchResultUpdate 
}: UseResultSaverParams) {
  const { toast } = useToast();

  /**
   * Saves the match result to the database and updates local state
   */
  const saveMatchResult = async (
    homeScore: number | undefined, 
    awayScore: number | undefined, 
    manualWinStatus: boolean | undefined
  ) => {
    try {
      console.log("Saving match result:", {
        homeScore, 
        awayScore, 
        manualWinStatus, 
        activityId: activity.id
      });
      
      // Create result string if both scores are defined
      const resultString = homeScore !== undefined && awayScore !== undefined 
        ? `${homeScore}-${awayScore}` 
        : undefined;
      
      // Determine if this is a home match for our team
      const isHome = isHomeMatch(activity);
      
      // Determine win status - we'll respect the manually set status if available
      let isWin = manualWinStatus;
      
      // If no manual status, calculate based on scores
      if (isWin === undefined && homeScore !== undefined && awayScore !== undefined) {
        isWin = calculateWinStatus(homeScore, awayScore, isHome);
        console.log("Calculated win status:", isWin);
      }
      
      // Prepare updated player_stats with all necessary properties
      const updatedPlayerStats = prepareUpdatedPlayerStats(
        activity, 
        homeScore, 
        awayScore, 
        isWin, 
        isHome
      );
      
      // If we have the onMatchResultUpdate prop, use it
      if (onMatchResultUpdate) {
        await onMatchResultUpdate(activity.id, homeScore, awayScore);
        console.log("Used onMatchResultUpdate to save result");
      } else {
        // Otherwise directly update the database - FORMATTED FOR DATABASE!
        console.log("Directly updating database with match result");
        const formattedActivity = {
          id: activity.id,
          home_score: homeScore,
          away_score: awayScore,
          is_win: isWin,
          result: resultString,
          player_stats: updatedPlayerStats
        };
        
        const { error } = await supabase
          .from('activities')
          .update(formattedActivity)
          .eq('id', activity.id);
          
        if (error) {
          console.error("Error saving match result to database:", error);
          throw error;
        } else {
          console.log("Successfully saved match result directly to database");
        }
      }
      
      // Then update the local state
      const updatedActivity = {
        ...activity,
        result: resultString,
        homeScore,
        awayScore,
        isWin,
        player_stats: updatedPlayerStats
      };
      
      console.log("Updated local activity state with win status:", {
        id: updatedActivity.id,
        name: updatedActivity.name,
        isWin: updatedActivity.isWin
      });
      
      // Use the update function from props
      updateActivity(updatedActivity);
      
      // Using the toast methods correctly
      toast({
        title: "Matchresultat sparat",
        description: resultString 
          ? `Resultat ${resultString} har sparats för ${activity.name}.` 
          : `Matchresultat har rensats för ${activity.name}.`,
        duration: 5000
      });

      return true;
    } catch (error) {
      console.error("Failed to save match result:", error);
      toast({
        title: "Kunde inte spara matchresultat",
        description: "Ett fel uppstod när resultatet skulle sparas. Försök igen.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { saveMatchResult };
}
