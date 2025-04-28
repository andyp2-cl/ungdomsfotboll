
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";

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
    
    // First check if Supabase is configured
    const isConnected = await isSupabaseConfigured();
    if (!isConnected) {
      console.error("Supabase connection is not properly configured");
      toast({
        title: "Databasfel",
        description: "Kunde inte ansluta till databasen. Kontrollera internetanslutningen.",
        variant: "destructive"
      });
      return;
    }
    
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
      
      // Create a clean copy for saving to avoid circular references
      const activityToSave = JSON.parse(JSON.stringify(updatedActivity));
      await saveActivities([activityToSave]);
      
      console.log("Match result saved successfully to database");
      
      // Only update local state AFTER successful database save
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
      
      toast({
        title: "Ett fel uppstod",
        description: `Kunde inte spara matchresultatet: ${saveError?.message || "Okänt fel"}`,
        variant: "destructive"
      });
      
      throw saveError;
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
