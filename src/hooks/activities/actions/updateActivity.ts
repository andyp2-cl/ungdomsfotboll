import { Activity, Player, ActivityType, PlayerStats } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";
import { normalizePlayerStats } from "../utils/playerStatsUtils";
import { supabase } from "@/lib/supabase/client";

interface DatabaseActivity {
  id: string;
  name: string;
  date: string;
  type: string;
  time?: string;
  location_description?: string;
  location_name?: string;
  location_gps_link?: string;
  kiosk_assigned_player_id?: string;
  cup_id?: string;
  cup_name?: string;
  league_id?: string;
  player_stats?: PlayerStats;
  result?: string;
  home_score?: number;
  away_score?: number;
  is_win?: boolean;
  match_report?: string;
  youtube_link?: string;
}

/**
 * Handles updating an existing activity
 */
export const handleActivityUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  updatedActivity: Activity
): Promise<void> => {
  console.log("handleActivityUpdate called with:", {
    activityId: updatedActivity.id,
    activityName: updatedActivity.name,
    date: updatedActivity.date,
    cupId: updatedActivity.cupId,
    cupName: updatedActivity.cupName,
    participantsCount: updatedActivity.participants?.length || 0
  });
  
  try {
    // Find the existing activity
    const existingActivity = activities.find(activity => activity.id === updatedActivity.id);
    
    if (!existingActivity) {
      console.error("Activity not found:", updatedActivity.id);
      toast({
        title: "Kunde inte uppdatera aktivitet",
        description: "Aktiviteten hittades inte.",
        variant: "destructive"
      });
      return;
    }

    // Normalize player_stats before updating
    const normalizedActivity = {
      ...updatedActivity,
      player_stats: normalizePlayerStats(updatedActivity.player_stats)
    };

    // If this is a cup activity, we need to sync participants with all cup matches
    let cupMatches: Activity[] = [];
    if (normalizedActivity.cupId) {
      try {
        // Get all matches for this cup
        const { data: matches, error: cupMatchesError } = await supabase
          .from('activities')
          .select('*')
          .eq('cup_id', normalizedActivity.cupId);

        if (cupMatchesError) {
          throw cupMatchesError;
        }

        // Convert database format to Activity type
        cupMatches = (matches as DatabaseActivity[] || []).map(match => ({
          id: match.id,
          name: match.name,
          date: match.date,
          type: match.type as ActivityType,
          time: match.time,
          location: match.location_name ? {
            name: match.location_name,
            description: match.location_description,
            gpsLink: match.location_gps_link
          } : undefined,
          participants: [], // Will be updated with the cup's participants
          kioskAssignedPlayerId: match.kiosk_assigned_player_id,
          cupId: match.cup_id,
          cupName: match.cup_name,
          leagueId: match.league_id,
          player_stats: match.player_stats,
          result: match.result,
          homeScore: match.home_score,
          awayScore: match.away_score,
          isWin: match.is_win,
          matchReport: match.match_report,
          youtubeLink: match.youtube_link
        }));
      } catch (cupError) {
        console.error("Error fetching cup matches:", cupError);
        toast({
          title: "Varning",
          description: "Kunde inte hämta cup-matcher. Försök igen.",
          variant: "destructive"
        });
        throw cupError;
      }
    }
    
    // Try to save to database FIRST, before updating UI state
    try {
      console.log("Saving activity to database:", normalizedActivity.id, "with date:", normalizedActivity.date);
      
      // Create a clean copy that won't be mutated by other code
      const activityToSave = JSON.parse(JSON.stringify(normalizedActivity));
      
      // Save the main activity first
      await saveActivities([activityToSave]);
      console.log("Activity saved successfully to database");

      // If this is a cup activity, update all cup matches
      if (normalizedActivity.cupId && cupMatches.length > 0) {
        const updatedCupMatches = cupMatches.map(match => ({
          ...match,
          participants: normalizedActivity.participants || []
        }));

        // Save all cup matches to database
        await saveActivities(updatedCupMatches);
        console.log("Cup matches updated successfully");
      }
      
      // Update all states at once to avoid multiple re-renders
      const allUpdatedActivities = activities.map(activity => {
        if (activity.id === normalizedActivity.id) {
          return normalizedActivity;
        }
        if (normalizedActivity.cupId && activity.cupId === normalizedActivity.cupId) {
          return {
            ...activity,
            participants: normalizedActivity.participants || []
          };
        }
        return activity;
      });

      setActivities(allUpdatedActivities);
      
      // Update player-activity relationships if needed
      if (normalizedActivity.participants) {
        const updatedPlayers = players.map(player => {
          const isParticipating = normalizedActivity.participants?.includes(player.id);
          let playerActivities = player.activities || [];
          
          if (isParticipating && !playerActivities.includes(normalizedActivity.id)) {
            return {
              ...player,
              activities: [...playerActivities, normalizedActivity.id]
            };
          } else if (!isParticipating && playerActivities.includes(normalizedActivity.id)) {
            return {
              ...player,
              activities: playerActivities.filter(id => id !== normalizedActivity.id)
            };
          }
          
          return player;
        });
        
        setPlayers(updatedPlayers);
        
        // Create a copy of the players list to avoid mutations
        const playersToSave = JSON.parse(JSON.stringify(updatedPlayers));
        await savePlayers(playersToSave);
      }
      
      // Show success notification AFTER everything is saved
      toast({
        title: "Aktivitet uppdaterad",
        description: `${normalizedActivity.name} har uppdaterats.`,
      });
    } catch (saveError) {
      console.error("Error saving activity to database:", saveError);
      toast({
        title: "Databasfel",
        description: "Det gick inte att spara aktiviteten till databasen. Försök igen.",
        variant: "destructive"
      });
      throw saveError;
    }
  } catch (error) {
    console.error("Error saving activity updates:", error);
    
    toast({
      title: "Ett fel uppstod",
      description: "Kunde inte spara ändringarna. Försök igen.",
      variant: "destructive"
    });
    
    throw error; // Re-throw to allow caller to handle
  }
};
