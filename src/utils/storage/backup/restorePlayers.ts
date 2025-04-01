
import { savePlayers } from "../playerStorage";

/**
 * Restores players from backup data
 */
export const restorePlayers = async (players: any[]): Promise<{
  success: boolean;
  count: number;
  error?: any;
}> => {
  try {
    // Make sure player data is valid before saving
    const validPlayers = players.filter(player => 
      player && player.id && player.name && player.grade
    );
    
    if (validPlayers.length === 0) {
      console.error("No valid players found in backup");
      return { success: false, count: 0, error: "No valid players found" };
    }
    
    console.log(`Restoring ${validPlayers.length} players`);
    await savePlayers(validPlayers);
    console.log("Players restored successfully");
    
    return { success: true, count: validPlayers.length };
  } catch (error) {
    console.error("Error restoring players:", error);
    return { success: false, count: 0, error };
  }
};
