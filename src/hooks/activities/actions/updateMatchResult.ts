import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { updateActivityWithRLSHandling } from "@/lib/supabase";

/**
 * Updates match result (score) for an existing activity
 * Uses multiple approaches for maximum reliability
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
    
    // Create a copy of the activity to avoid mutations
    const updatedActivity: Activity = { 
      ...activity,
      homeScore, 
      awayScore
    };
    
    // Add result string if both scores are defined
    if (homeScore !== undefined && awayScore !== undefined) {
      updatedActivity.result = `${homeScore}-${awayScore}`;
      
      // Set isWin based on scores (win = true, loss = false, draw = undefined)
      if (homeScore > awayScore) {
        updatedActivity.isWin = true;
      } else if (homeScore < awayScore) {
        updatedActivity.isWin = false;
      } else {
        // For a draw, set isWin to undefined (not false)
        updatedActivity.isWin = undefined;
      }
    } else {
      // Clear result if scores aren't defined
      updatedActivity.result = undefined;
      updatedActivity.isWin = undefined;
    }
    
    // Update player stats
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
    
    // Update local state first to give immediate feedback
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    setActivities(updatedActivities);
    
    // IMPROVEMENT 1: Save to localStorage as a fallback
    saveToLocalStorage(activityId, {
      homeScore,
      awayScore,
      isWin: updatedActivity.isWin,
      result: updatedActivity.result
    });
    
    // Try MULTIPLE saving approaches in sequence for maximum reliability
    try {
      // APPROACH 1: Use enhanced RLS handling method from client.ts
      console.log("Trying direct RLS handling approach...");
      const rlsResult = await updateActivityWithRLSHandling(activityId, {
        home_score: homeScore,
        away_score: awayScore,
        is_win: updatedActivity.isWin,
        result: updatedActivity.result,
        player_stats: updatedActivity.player_stats
      });
      
      if (rlsResult.success) {
        console.log("Match result saved successfully via RLS handling");
        toast({
          title: "Resultat uppdaterat",
          description: homeScore !== undefined && awayScore !== undefined ? 
            `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
            "Resultat borttaget",
        });
        return;
      }
      
      console.log("RLS handling approach didn't work, trying next approach...");
      
      // APPROACH 2: Use the standard saveActivities helper 
      console.log("Trying standard saveActivities approach...");
      await saveActivities([updatedActivity]);
      console.log("Match result saved successfully via saveActivities");
      
      toast({
        title: "Resultat uppdaterat",
        description: homeScore !== undefined && awayScore !== undefined ? 
          `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
          "Resultat borttaget",
      });
      
      // APPROACH 3: Direct REST API call as last resort
      // This is implemented but will only execute if the previous approaches fail
      
    } catch (error) {
      console.error("Error saving match result:", error);
      
      try {
        // APPROACH 3: Direct REST API call as last resort
        console.log("Trying direct REST API call...");
        const apiUrl = `https://zkrruihxszziifyogzko.supabase.co/rest/v1/activities?id=eq.${activityId}`;
        const directApiResult = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            home_score: homeScore,
            away_score: awayScore,
            is_win: updatedActivity.isWin,
            result: updatedActivity.result
          })
        });
        
        if (directApiResult.ok) {
          console.log("Match result saved successfully via direct API call");
          toast({
            title: "Resultat uppdaterat",
            description: homeScore !== undefined && awayScore !== undefined ? 
              `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
              "Resultat borttaget",
          });
          return;
        } else {
          console.error("Direct API call failed:", await directApiResult.text());
          throw new Error("Direct API call failed");
        }
      } catch (directApiError) {
        console.error("Error with direct API approach:", directApiError);
        
        toast({
          title: "Lokalt uppdaterad",
          description: "Resultatet har sparats lokalt, men kunde inte sparas i databasen. Synkroniseras automatiskt senare.",
          variant: "warning"
        });
      }
    }
  } catch (error: any) {
    console.error("Error in handleMatchResultUpdate:", error);
    toast({
      title: "Ett fel uppstod",
      description: `Resultatet har sparats lokalt. ${error?.message || "Okänt fel"}`,
      variant: "warning"
    });
  }
};

// Local storage helper for offline capability
const saveToLocalStorage = (activityId: string, scoreData: any) => {
  try {
    const pendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
    pendingUpdates[activityId] = {
      ...scoreData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
    console.log("Match result saved to localStorage as backup");
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};
