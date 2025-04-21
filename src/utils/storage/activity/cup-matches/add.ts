
import { supabase } from "@/lib/supabase";
import { Activity } from "@/types/player";

// Define CupMatch type locally
interface CupMatch {
  id?: string;
  name: string;
  time: string;
  location?: string;
  locationDescription?: string;
}

/**
 * Add cup matches to a cup activity
 */
export const addCupMatches = async (
  cupActivity: Activity,
  matches: Activity[]
): Promise<boolean> => {
  try {
    if (!cupActivity.id) {
      throw new Error("Cup activity ID is missing");
    }

    // Update the cup activity to include references to match IDs
    const matchIds = matches.map(match => match.id);
    
    // Get current player_stats or create new if needed
    const playerStats = cupActivity.player_stats || {
      goals: {},
      assists: {},
      cup_matches: []
    };
    
    // Ensure cup_matches exists
    if (!playerStats.cup_matches) {
      playerStats.cup_matches = [];
    }
    
    // Update cup_matches array
    playerStats.cup_matches = [...playerStats.cup_matches, ...matchIds];
    
    // Update the cup activity
    const { error: cupError } = await supabase
      .from('activities')
      .update({
        player_stats: playerStats as any
      })
      .eq('id', cupActivity.id);
      
    if (cupError) throw cupError;
    
    // Update each match to reference the cup
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
    console.error("Error adding cup matches:", error);
    return false;
  }
};
