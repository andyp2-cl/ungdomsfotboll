
import { supabase } from "@/lib/supabase";
import { Activity, PlayerStats } from "@/types/player";

export const updateCupMatches = async (cupActivity: Activity, matches: Activity[]): Promise<boolean> => {
  try {
    // Update the cup activity to reference all matches
    const matchIds = matches.map(match => match.id);
    
    // Get current player_stats or create new if needed
    const playerStats: PlayerStats = cupActivity.player_stats || {
      goals: {},
      assists: {},
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
    
    // Update cup_matches array
    if (!playerStats.cup_matches) {
      playerStats.cup_matches = [];
    }
    
    playerStats.cup_matches = matchIds;
    
    // Update the cup activity in the database
    const { error } = await supabase
      .from('activities')
      .update({
        player_stats: playerStats as any // Type cast to any to avoid JSON type issues
      })
      .eq('id', cupActivity.id);
    
    if (error) throw error;
    
    // Update the matches to reference the cup
    for (const match of matches) {
      const { error: matchError } = await supabase
        .from('activities')
        .update({
          cup_id: cupActivity.id,
          cup_name: cupActivity.name
        })
        .eq('id', match.id);
      
      if (matchError) {
        console.error(`Error updating match ${match.id}:`, matchError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating cup matches:", error);
    return false;
  }
};
