
import { Activity } from "@/types/player";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { isHomeMatch, extractTeamNames, isHassleholm } from "@/components/activity-detail/match-result/utils";

/**
 * Updates match result (score) for an existing activity
 * Uses a simple direct approach to maximize reliability
 */
export const handleMatchResultUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  activityId: string,
  homeScore?: number,
  awayScore?: number
): Promise<boolean> => {
  try {
    console.log(`Updating match result for activity ${activityId}: ${homeScore}-${awayScore}`);
    
    // Find the existing activity
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) {
      console.error(`Activity with id ${activityId} not found`);
      toast.error("Kunde inte hitta aktiviteten");
      return false;
    }
    
    // Determine if it's a win for Hässleholms IF
    let isWin: boolean | null = null;
    
    if (homeScore !== undefined && awayScore !== undefined) {
      // Draw case
      if (homeScore === awayScore) {
        isWin = null; // Draw is represented as null
      } else {
        // Extract team names
        const { homeTeam, awayTeam } = extractTeamNames(activity);
        const isHifHome = isHassleholm(homeTeam);
        const isHifAway = isHassleholm(awayTeam);
        
        if (isHifHome) {
          isWin = homeScore > awayScore;
        } else if (isHifAway) {
          isWin = awayScore > homeScore;
        } else {
          // Fallback to checking if it's a home match
          const isHome = isHomeMatch(activity);
          isWin = isHome ? (homeScore > awayScore) : (awayScore > homeScore);
        }
      }
    }
    
    // Create result string if both scores exist
    const result = (homeScore !== undefined && awayScore !== undefined)
      ? `${homeScore}-${awayScore}`
      : null;
    
    console.log(`Determined win status: ${isWin === null ? 'draw' : isWin ? 'win' : 'loss'}`);
    
    // Update React state first for immediate feedback
    const updatedActivity: Activity = {
      ...activity,
      homeScore,
      awayScore,
      isWin: isWin === null ? undefined : isWin,
      result: result || undefined,
      player_stats: activity.player_stats || { goals: {}, assists: {} }
    };
    
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    
    setActivities(updatedActivities);
    
    // Clear any cached activities
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('sb-activities-fetch-time');
    
    // Prepare data for database update - use simple approach
    const updateData = {
      home_score: homeScore,
      away_score: awayScore,
      is_win: isWin,
      result
    };
    
    // Direct update approach
    const { error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', activityId);
    
    if (error) {
      console.error("Error updating match result:", error);
      toast.error("Kunde inte spara i databasen");
      return false;
    }
    
    toast.success("Matchresultat sparat i databasen");
    return true;
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.error("Ett oväntat fel inträffade");
    return false;
  }
};
