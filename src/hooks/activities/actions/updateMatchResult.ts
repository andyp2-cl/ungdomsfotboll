
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { supabase, updateActivityWithRLSHandling } from "@/lib/supabase/client";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";

/**
 * Updates match result (score) for an existing activity
 */
export const handleMatchResultUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  activityId: string,
  homeScore?: number,
  awayScore?: number
): Promise<void> => {
  try {
    console.log(`Updating match result for activity ${activityId}: ${homeScore}-${awayScore}`);
    
    // Find the existing activity
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) {
      console.error(`Activity not found: ${activityId}`);
      toast({
        title: "Kunde inte uppdatera matchresultat",
        description: "Matchen hittades inte.",
        variant: "destructive"
      });
      return;
    }
    
    // Create the updated activity object
    const updatedActivity = { 
      ...activity,
      homeScore, 
      awayScore
    };
    
    // Add result string if both scores are defined
    if (homeScore !== undefined && awayScore !== undefined) {
      updatedActivity.result = `${homeScore}-${awayScore}`;
      
      // Set isWin based on scores
      updatedActivity.isWin = homeScore > awayScore;
    } else {
      // Clear result if scores aren't defined
      updatedActivity.result = undefined;
      updatedActivity.isWin = undefined;
    }
    
    // Update the player stats scores
    if (!updatedActivity.player_stats) {
      updatedActivity.player_stats = { goals: {}, assists: {} };
    }
    
    updatedActivity.player_stats = {
      ...updatedActivity.player_stats,
      scores: {
        home: homeScore,
        away: awayScore
      },
      isWin: updatedActivity.isWin
    };
    
    try {
      console.log("Saving match result to database for activity:", updatedActivity.id);
      
      // Create focused update object containing only score-related fields
      const scoreUpdates = {
        home_score: homeScore,
        away_score: awayScore,
        is_win: updatedActivity.isWin,
        result: updatedActivity.result,
        player_stats: updatedActivity.player_stats
      };
      
      // Try our new RLS-aware update function first
      const { success, error } = await updateActivityWithRLSHandling(activityId, scoreUpdates);
      
      if (!success) {
        console.warn("RLS-aware update failed, falling back to saveActivities helper:", error);
        // Fall back to saveActivities if direct database update fails
        await saveActivities([updatedActivity]);
      }
      
      console.log("Match result saved successfully");
      
      // Update local state
      const updatedActivities = activities.map(a => 
        a.id === activityId ? updatedActivity : a
      );
      setActivities(updatedActivities);
      
      toast({
        title: "Resultat uppdaterat",
        description: homeScore !== undefined && awayScore !== undefined ? 
          `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
          "Resultat borttaget",
      });
    } catch (saveError: any) {
      console.error("Error saving match result to database:", saveError);
      
      // Still update local state to show the change to the user
      const updatedActivities = activities.map(a => 
        a.id === activityId ? updatedActivity : a
      );
      setActivities(updatedActivities);
      
      toast({
        title: "Lokalt uppdaterad",
        description: `Resultatet sparades lokalt, men kunde inte sparas i databasen: ${saveError?.message || "Okänt fel"}`,
        variant: "warning"
      });
      
      throw saveError;  // Propagate the error for additional handling if needed
    }
  } catch (error: any) {
    console.error("Error in handleMatchResultUpdate:", error);
    toast({
      title: "Ett fel uppstod",
      description: `Kunde inte uppdatera matchresultatet: ${error?.message || "Okänt fel"}`,
      variant: "destructive"
    });
    throw error;  // Propagate the error
  }
};
