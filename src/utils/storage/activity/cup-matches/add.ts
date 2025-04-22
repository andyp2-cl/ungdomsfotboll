
import { Activity } from "@/types/player";
import { v4 as uuidv4 } from 'uuid';
import { normalizePlayerStats } from "@/utils/player-stats";
import { useToast } from "@/hooks/use-toast";

/**
 * Add new matches to a cup
 */
export const addCupMatches = async (
  cupActivity: Activity,
  newMatches: Omit<Activity, 'id'>[],
  updateActivity: (activity: Activity) => Promise<void>
): Promise<Activity[]> => {
  try {
    console.log(`Adding ${newMatches.length} matches to cup ${cupActivity.name}`);
    
    // Create full activities with IDs
    const matchActivities: Activity[] = newMatches.map(match => ({
      ...match,
      id: uuidv4(),
      // Make sure cupId is set
      cupId: cupActivity.id,
      // Ensure matches is initialized as empty array
      matches: []
    }));
    
    // Update the cup to add these matches
    const updatedCup = { ...cupActivity };
    
    // Initialize matches array if it doesn't exist
    if (!updatedCup.matches) {
      updatedCup.matches = [];
    }
    
    // Add new match IDs
    updatedCup.matches = [
      ...updatedCup.matches,
      ...matchActivities.map(m => m.id)
    ];
    
    // Ensure player_stats exists with cup_matches
    const playerStats = normalizePlayerStats(updatedCup.player_stats);
    
    // Add match IDs to cup_matches in player_stats
    playerStats.cup_matches = [
      ...playerStats.cup_matches,
      ...matchActivities.map(m => m.id)
    ];
    
    updatedCup.player_stats = playerStats;
    
    console.log(`Updating cup with match IDs:`, updatedCup.matches);
    
    // First update the cup to reference these new matches
    await updateActivity(updatedCup);
    console.log("Updated cup with match references successfully");
    
    // Then create each match activity
    for (const match of matchActivities) {
      console.log(`Creating match ${match.id}: ${match.name} with cupId: ${match.cupId}`);
      // Save the activity to the database and state
      await updateActivity(match);
      console.log(`Successfully created match ${match.id}: ${match.name}`);
    }
    
    console.log(`Successfully added ${matchActivities.length} matches to cup ${cupActivity.name}`);
    return matchActivities;
    
  } catch (error) {
    console.error("Error adding cup matches:", error);
    throw error;
  }
};
