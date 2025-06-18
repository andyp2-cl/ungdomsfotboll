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
  league_id?: string;
  player_stats?: {
    goals?: { [key: string]: number };
    assists?: { [key: string]: number };
    cup_matches?: string[];
    cup_name?: string;
  };
  result?: string;
  home_score?: number;
  away_score?: number;
  is_win?: boolean;
  match_report?: string;
  youtube_link?: string;
  participants?: string[];
}

/**
 * Handles updating an existing activity
 */
export const handleActivityUpdate = async (
  activity: Activity,
  onSuccess?: (updatedActivity: Activity) => void,
  onError?: (error: Error) => void,
  onWarning?: (title: string, description: string) => void
): Promise<void> => {
  try {
    console.log("handleActivityUpdate called for activity:", activity.id, activity.name, activity.type);
    
    if (!activity || !activity.id) {
      throw new Error("Invalid activity data");
    }
    
    // Normalize player stats
    const normalizedActivity = {
      ...activity,
      player_stats: normalizePlayerStats(activity.player_stats)
    };
    
    // Format activity for database
    const formattedActivity = {
      id: normalizedActivity.id,
      name: normalizedActivity.name,
      date: normalizedActivity.date,
      type: normalizedActivity.type,
      time: normalizedActivity.time || null,
      location_name: normalizedActivity.location?.name || null,
      location_description: normalizedActivity.location?.description || null,
      location_gps_link: normalizedActivity.location?.gpsLink || null,
      player_stats: normalizedActivity.player_stats,
      cup_id: normalizedActivity.cupId || null,
      home_score: normalizedActivity.homeScore !== undefined ? normalizedActivity.homeScore : null,
      away_score: normalizedActivity.awayScore !== undefined ? normalizedActivity.awayScore : null,
      is_win: normalizedActivity.isWin !== undefined ? normalizedActivity.isWin : null,
      result: normalizedActivity.result || null,
      kiosk_assigned_player_id: normalizedActivity.kioskAssignedPlayerId || null,
      scraped: normalizedActivity.scraped || false,
      league_id: normalizedActivity.leagueId || null,
      match_report: normalizedActivity.matchReport || null,
      youtube_link: normalizedActivity.youtubeLink || null,
      home_team: normalizedActivity.homeTeam || null,
      away_team: normalizedActivity.awayTeam || null,
      status: normalizedActivity.status || 'scheduled',
      participants: normalizedActivity.participants || []
    };

    // First, update the activity in the database
    const { error: updateError } = await supabase
      .from('activities')
      .update(formattedActivity)
      .eq('id', normalizedActivity.id);

    if (updateError) {
      throw updateError;
    }

    // If this is a cup, update all related matches
    if (normalizedActivity.type === 'cup') {
      try {
        // Get all matches that reference this cup
        const { data: cupMatches, error: matchesError } = await supabase
          .from('activities')
          .select('*')
          .eq('cup_id', normalizedActivity.id);

        if (matchesError) {
          throw matchesError;
        }

        if (cupMatches && cupMatches.length > 0) {
          console.log(`Found ${cupMatches.length} matches to update for cup ${normalizedActivity.id}`);
          
          // Update each match to reflect the new cup name and participants
          const updatePromises = cupMatches.map(async (match) => {
            try {
              // Safely handle player_stats
              const existingStats = match.player_stats as { 
                goals?: Record<string, number>;
                assists?: Record<string, number>;
                cup_matches?: string[];
                cup_name?: string;
              } || {};
              
              const playerStats = {
                goals: existingStats.goals || {},
                assists: existingStats.assists || {},
                cup_matches: existingStats.cup_matches || [],
                cup_name: normalizedActivity.name
              };

              // Update both player_stats, cupName and participants for the match
              const { error: matchUpdateError } = await supabase
                .from('activities')
                .update({ 
                  player_stats: playerStats,
                  cup_name: normalizedActivity.name,
                  participants: normalizedActivity.participants // Sync participants from cup to match
                })
                .eq('id', match.id);

              if (matchUpdateError) {
                console.error(`Error updating match ${match.id}:`, matchUpdateError);
              }
            } catch (error) {
              console.error(`Error updating match ${match.id}:`, error);
            }
          });

          // Wait for all updates to complete
          await Promise.all(updatePromises);
        }
      } catch (cupError) {
        console.error("Error updating cup matches:", cupError);
        if (onWarning) {
          onWarning(
            "Varning",
            "Kunde inte uppdatera alla cup-matcher. Försök igen."
          );
        }
      }
    }

    // If this is a cup match, sync with the parent cup
    if (normalizedActivity.type === 'match' && normalizedActivity.cupId) {
      try {
        // Get the parent cup
        const { data: parentCup, error: cupError } = await supabase
          .from('activities')
          .select('*')
          .eq('id', normalizedActivity.cupId)
          .single();

        if (cupError) {
          throw cupError;
        }

        if (parentCup) {
          const typedParentCup = parentCup as DatabaseActivity;
          
          // Update the parent cup's player_stats and ensure participants are synced
          const existingStats = typedParentCup.player_stats as {
            goals?: Record<string, number>;
            assists?: Record<string, number>;
            cup_matches?: string[];
            cup_name?: string;
          } || {};
          
          const cupPlayerStats = {
            goals: existingStats.goals || {},
            assists: existingStats.assists || {},
            cup_matches: Array.from(new Set([
              ...(existingStats.cup_matches || []),
              normalizedActivity.id
            ]))
          };

          // Get all unique participants from the cup and the current match
          const allParticipants = Array.from(new Set([
            ...(typedParentCup.participants || []),
            ...(normalizedActivity.participants || [])
          ]));

          // Update the parent cup with combined participants
          const { error: updateCupError } = await supabase
            .from('activities')
            .update({ 
              player_stats: cupPlayerStats,
              name: parentCup.name,
              participants: allParticipants
            })
            .eq('id', parentCup.id);

          if (updateCupError) {
            throw updateCupError;
          }
        }
      } catch (error) {
        console.error("Error updating parent cup:", error);
        if (onWarning) {
          onWarning(
            "Varning",
            "Kunde inte uppdatera cup-information. Försök igen."
          );
        }
      }
    }

    // Call success callback if provided
    if (onSuccess) {
      onSuccess(normalizedActivity);
    }

  } catch (error) {
    console.error("Error updating activity:", error);
    
    // Call error callback if provided
    if (onError) {
      onError(error as Error);
    }
  }
};
