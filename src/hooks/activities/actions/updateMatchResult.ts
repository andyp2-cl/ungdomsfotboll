
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { supabase, updateActivityWithRLSHandling } from "@/lib/supabase/client";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";

/**
 * Updates match result (score) for an existing activity
 * Enhanced with multiple fallback methods to ensure successful saving
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
    
    // Always update local state first to give immediate feedback
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    setActivities(updatedActivities);
    
    // Save to database with multiple fallback approaches
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
      
      // DEBUG: Log the actual content being sent
      console.log("Sending update with data:", JSON.stringify(scoreUpdates));
      
      // Step 1: Try our enhanced RLS-aware update function first
      const { success, error } = await updateActivityWithRLSHandling(activityId, scoreUpdates);
      
      if (success) {
        console.log("Enhanced RLS-aware update succeeded");
        
        toast({
          title: "Resultat uppdaterat",
          description: homeScore !== undefined && awayScore !== undefined ? 
            `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
            "Resultat borttaget",
        });
        return;
      }
      
      // Step 2: If direct update fails, try saveActivities helper as fallback
      console.warn("Enhanced RLS-aware update failed, falling back to saveActivities helper:", error);
      
      // Format the activity for database storage
      const dbActivity = formatActivityForDatabase(updatedActivity);
      console.log("Formatted activity for database save:", {
        id: dbActivity.id,
        home_score: dbActivity.home_score,
        away_score: dbActivity.away_score,
        is_win: dbActivity.is_win
      });
      
      // Try to save via our utility function
      await saveActivities([updatedActivity]);
      console.log("Saved via saveActivities helper");
      
      toast({
        title: "Resultat uppdaterat",
        description: homeScore !== undefined && awayScore !== undefined ? 
          `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
          "Resultat borttaget",
      });
      
    } catch (saveError: any) {
      console.error("Error saving match result to database:", saveError);
      
      // Try a last-resort local storage save
      try {
        await saveActivities([updatedActivity]);
        console.log("Saved to local storage as last resort");
      } catch (localSaveError) {
        console.error("Even local storage save failed:", localSaveError);
      }
      
      toast({
        title: "Lokalt uppdaterad",
        description: `Resultatet sparades lokalt, men kunde inte sparas i databasen: ${saveError?.message || "Okänt fel"}`,
        variant: "warning"
      });
    }
  } catch (error: any) {
    console.error("Error in handleMatchResultUpdate:", error);
    toast({
      title: "Ett fel uppstod",
      description: `Kunde inte uppdatera matchresultatet: ${error?.message || "Okänt fel"}`,
      variant: "destructive"
    });
    throw error;
  }
};
