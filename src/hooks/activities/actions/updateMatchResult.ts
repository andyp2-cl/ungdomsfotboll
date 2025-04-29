
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
    
    // Format activity data for database to ensure consistent types
    const formattedData = formatActivityForDatabase(updatedActivity);
    
    // MULTIPLE APPROACHES TO SAVE DATA
    let saveSuccess = false;
    let lastError = null;
    
    try {
      // APPROACH 1: Try standard saveActivities helper first
      console.log("APPROACH 1: Using saveActivities helper");
      await saveActivities([updatedActivity]);
      console.log("Match result saved successfully via saveActivities");
      saveSuccess = true;
    } catch (error1) {
      console.error("saveActivities approach failed:", error1);
      lastError = error1;
      
      try {
        // APPROACH 2: Try minimal direct update with only score fields
        console.log("APPROACH 2: Trying minimal direct update with score fields only");
        const scoreUpdate = {
          home_score: formattedData.home_score,
          away_score: formattedData.away_score,
          is_win: formattedData.is_win,
          result: formattedData.result
        };
        
        const { error } = await supabase
          .from('activities')
          .update(scoreUpdate)
          .eq('id', activityId);
        
        if (!error) {
          console.log("Match result updated successfully via direct update");
          saveSuccess = true;
        } else {
          console.error("Direct update failed:", error.message);
          lastError = error;
          
          // APPROACH 3: Try complete upsert
          console.log("APPROACH 3: Trying complete upsert");
          const completeUpsertData = {
            // Include all required fields for the activity
            id: activityId,
            name: formattedData.name,
            date: formattedData.date,
            type: formattedData.type,
            // Score fields
            home_score: formattedData.home_score,
            away_score: formattedData.away_score,
            is_win: formattedData.is_win,
            result: formattedData.result,
            player_stats: formattedData.player_stats
          };
          
          console.log("Upsert data:", JSON.stringify(completeUpsertData));
          
          const { error: upsertError } = await supabase
            .from('activities')
            .upsert(completeUpsertData, { onConflict: 'id' });
          
          if (!upsertError) {
            console.log("Match result updated successfully via upsert");
            saveSuccess = true;
          } else {
            console.error("Upsert failed:", upsertError.message);
            lastError = upsertError;
            
            // APPROACH 4: Try REST API approach
            try {
              console.log("APPROACH 4: Trying REST API approach");
              
              const apiUrl = `${supabase.supabaseUrl}/rest/v1/activities?id=eq.${activityId}`;
              const response = await fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': supabase.supabaseKey,
                  'Authorization': `Bearer ${supabase.supabaseKey}`,
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify(scoreUpdate)
              });
              
              if (response.ok) {
                console.log("Match result updated successfully via REST API");
                saveSuccess = true;
              } else {
                const errorText = await response.text();
                console.error("REST API update failed:", errorText);
                lastError = new Error(errorText);
              }
            } catch (restError) {
              console.error("REST API approach failed:", restError);
              lastError = restError;
            }
          }
        }
      } catch (error2) {
        console.error("All database update approaches failed:", error2);
        lastError = error2;
      }
    }
    
    if (saveSuccess) {
      toast({
        title: "Resultat uppdaterat",
        description: homeScore !== undefined && awayScore !== undefined ? 
          `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
          "Resultat borttaget",
      });
    } else {
      console.error("Failed to save match result after trying all approaches");
      toast({
        title: "Lokalt uppdaterad",
        description: "Resultatet har sparats lokalt, men kunde inte sparas i databasen. Försök igen senare.",
        variant: "warning"
      });
      
      // Throw the last error to propagate it for debugging
      if (lastError) {
        console.error("Final error:", lastError);
        throw lastError;
      }
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
