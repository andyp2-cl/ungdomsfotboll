
import { Activity } from "@/types/player";
import { determineMatchOutcome } from "./determineOutcome";
import { formatActivityForDatabase } from "@/utils/database/formatters";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Updates a match result in the database
 */
export const updateMatchResultInDatabase = async (
  activityId: string,
  homeScore?: number,
  awayScore?: number
): Promise<boolean> => {
  try {
    console.log(`Updating match result in database for activity ${activityId}:`, {
      homeScore,
      awayScore
    });
    
    // First fetch the activity to get all current data
    const { data: activity, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();
    
    if (fetchError || !activity) {
      console.error("Error fetching activity for match result update:", fetchError);
      return false;
    }
    
    // Convert database activity to our application model
    const appActivity: Activity = {
      id: activity.id,
      name: activity.name,
      date: activity.date,
      type: activity.type as "match" | "cup",
      participants: [], // We don't need participants for this operation
      homeScore,
      awayScore
    };
    
    // Determine if the match was a win for Hässleholms IF
    const isWin = determineMatchOutcome(appActivity, homeScore, awayScore);
    
    console.log(`Match outcome determined: isWin=${isWin}`);
    
    // Format match result as text
    const result = (homeScore !== undefined && awayScore !== undefined) 
      ? `${homeScore}-${awayScore}` 
      : undefined;
    
    // Update the match in the database
    const { error: updateError } = await supabase
      .from('activities')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        is_win: isWin,
        result
      })
      .eq('id', activityId);
    
    if (updateError) {
      console.error("Error updating match result in database:", updateError);
      toast.error("Kunde inte spara matchresultatet i databasen");
      return false;
    }
    
    console.log(`Successfully updated match result in database for ${activityId}`);
    return true;
  } catch (error) {
    console.error("Unexpected error updating match result in database:", error);
    return false;
  }
};

/**
 * Updates a match result both in memory and the database
 */
export const handleMatchResultUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  activityId: string,
  homeScore?: number,
  awayScore?: number
): Promise<void> => {
  console.log(`Handling match result update: activityId=${activityId}, scores=${homeScore}-${awayScore}`);
  
  try {
    // First update the activity in memory
    const updatedActivities = activities.map(activity => {
      if (activity.id === activityId) {
        // Determine if the match was a win for Hässleholms IF
        const isWin = determineMatchOutcome(activity, homeScore, awayScore);
        
        // Format match result as text
        const result = (homeScore !== undefined && awayScore !== undefined) 
          ? `${homeScore}-${awayScore}` 
          : undefined;
        
        console.log(`Updating activity ${activityId} with scores ${homeScore}-${awayScore}, isWin=${isWin}`);
        
        return {
          ...activity,
          homeScore,
          awayScore,
          isWin,
          result
        };
      }
      return activity;
    });
    
    // Update state immediately for responsive UI
    setActivities(updatedActivities);
    
    // Now update the database
    const success = await updateMatchResultInDatabase(activityId, homeScore, awayScore);
    
    if (!success) {
      toast({
        title: "Varning",
        description: "Resultatet sparades i minnet men kunde inte sparas i databasen.",
        variant: "warning"
      });
    } else {
      // Force clear cache to ensure data is reloaded fresh next time
      localStorage.removeItem('cachedActivities');
      localStorage.removeItem('sb-activities-fetch-time');
      
      toast({
        title: "Matchresultat sparat",
        description: "Resultatet har sparats både lokalt och i databasen."
      });
    }
  } catch (error) {
    console.error("Error in handleMatchResultUpdate:", error);
    toast({
      title: "Fel vid sparande",
      description: "Ett oväntat fel inträffade. Försök igen.",
      variant: "destructive"
    });
  }
};
