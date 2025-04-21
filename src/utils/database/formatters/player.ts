
import { Player, PlayerPosition } from "@/types/player";

/**
 * Formats a player object from our application format to the database format
 */
export const formatPlayerForDatabase = (player: any) => {
  // Ensure positions is properly formatted for database storage
  let positions = player.positions;
  
  // If positions is an array, join it into a string
  if (Array.isArray(positions)) {
    positions = positions;
  } else if (typeof positions === 'string') {
    // If it's already a string, convert to array (space-separated)
    positions = positions.split(' ').filter((p: string) => p.trim() !== '');
  } else {
    positions = null;
  }
  
  // Create a formatted player object for database storage
  return {
    id: player.id,
    name: player.name,
    grade: player.grade || null,
    position: positions || null,
    jersey_number: player.jerseyNumber || null,
    image: player.image || null
  };
};

/**
 * Formats a player from database format to our application format
 */
export const formatDatabasePlayer = (dbPlayer: any) => {
  // Ensure the position is always an array of PlayerPosition
  let positions: PlayerPosition[] = [];
  
  if (dbPlayer.position) {
    if (Array.isArray(dbPlayer.position)) {
      // Validate each position is a valid PlayerPosition
      positions = dbPlayer.position.filter((pos: string) => 
        ["MV", "BACK", "MF", "ANF", "TRÄNARE"].includes(pos)
      ) as PlayerPosition[];
    } else if (typeof dbPlayer.position === 'string') {
      // If it contains brackets and quotes, it might be a JSON string
      if (dbPlayer.position.includes('[') && dbPlayer.position.includes('"')) {
        try {
          const parsed = JSON.parse(dbPlayer.position);
          // Validate each parsed position
          positions = Array.isArray(parsed) ? 
            parsed.filter((pos: string) => 
              ["MV", "BACK", "MF", "ANF", "TRÄNARE"].includes(pos)
            ) as PlayerPosition[] : [];
        } catch (e) {
          // If parsing fails, treat as space-separated string
          positions = dbPlayer.position
            .split(' ')
            .filter(p => p.trim() !== '' && ["MV", "BACK", "MF", "ANF", "TRÄNARE"].includes(p)) as PlayerPosition[];
        }
      } else {
        // Treat as space-separated string
        positions = dbPlayer.position
          .split(' ')
          .filter(p => p.trim() !== '' && ["MV", "BACK", "MF", "ANF", "TRÄNARE"].includes(p)) as PlayerPosition[];
      }
    }
  }
  
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    grade: dbPlayer.grade || undefined,
    positions: positions,
    jerseyNumber: dbPlayer.jersey_number || undefined,
    image: dbPlayer.image || undefined,
    activities: [] // Will be populated separately
  };
};

