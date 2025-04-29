
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { supabase } from "@/integrations/supabase/client";
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
    
    // DIRECT DATABASE UPDATE APPROACH:
    // Format activity data for database
    const formattedData = formatActivityForDatabase(updatedActivity);
    
    // Create a minimal update payload with just score fields
    const scoreUpdate = {
      home_score: formattedData.home_score,
      away_score: formattedData.away_score,
      is_win: formattedData.is_win,
      result: formattedData.result,
      player_stats: formattedData.player_stats
    };
    
    console.log("Attempting direct database update with:", JSON.stringify(scoreUpdate));
    
    // Try direct database update first - multiple approaches
    try {
      // APPROACH 1: Try minimal update first
      const { data, error } = await supabase
        .from('activities')
        .update(scoreUpdate)
        .eq('id', activityId);
      
      if (!error) {
        console.log("Match result updated successfully via direct update");
        toast({
          title: "Resultat uppdaterat",
          description: homeScore !== undefined && awayScore !== undefined ? 
            `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
            "Resultat borttaget",
        });
        return;
      }

      console.error("Direct database update failed, trying alternative approaches:", error);

      // APPROACH 2: Try upsert with onConflict
      const { error: upsertError } = await supabase
        .from('activities')
        .upsert({
          id: activityId,
          ...scoreUpdate
        }, { onConflict: 'id' });
      
      if (!upsertError) {
        console.log("Match result updated successfully via upsert");
        toast({
          title: "Resultat uppdaterat",
          description: homeScore !== undefined && awayScore !== undefined ? 
            `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
            "Resultat borttaget",
        });
        return;
      }

      console.error("Upsert also failed, using saveActivities helper:", upsertError);

      // APPROACH 3: Use saveActivities helper
      await saveActivities([updatedActivity]);
      console.log("Match result saved via saveActivities helper");
      toast({
        title: "Resultat uppdaterat",
        description: homeScore !== undefined && awayScore !== undefined ? 
          `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
          "Resultat borttaget",
      });
      
    } catch (dbError) {
      console.error("All database save approaches failed:", dbError);
      toast({
        title: "Lokalt uppdaterad",
        description: "Resultatet har sparats lokalt, men kunde inte sparas i databasen. Försök igen senare.",
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
