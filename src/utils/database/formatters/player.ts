import { Player, PlayerPosition } from "@/types/player";

/**
 * Formats a player object from our application format to the database format
 */
export const formatPlayerForDatabase = (player: any) => {
  // Ensure position is properly formatted for database storage
  let position = player.position;
  
  // If position is an array, keep it as is
  if (Array.isArray(position)) {
    position = position;
  } else if (typeof position === 'string') {
    // If it's already a string, convert to array (space-separated)
    position = position.split(' ').filter((p: string) => p.trim() !== '');
  } else {
    position = null;
  }
  
  // Create a formatted player object for database storage
  return {
    id: player.id,
    name: player.name,
    grade: player.grade || null,
    position: position || null,
    jersey_number: player.jersey_number || null,
    image: player.image || null
  };
};

/**
 * Formats a player from database format to our application format
 */
export const formatDatabasePlayer = (dbPlayer: any) => {
  // Ensure the position is always an array of PlayerPosition
  let position: PlayerPosition[] = [];
  
  if (dbPlayer.position) {
    if (Array.isArray(dbPlayer.position)) {
      // Validate each position is a valid PlayerPosition
      position = dbPlayer.position.filter((pos: string) => 
        ["MV", "BACK", "MF", "ANF", "TRÄNARE"].includes(pos)
      ) as PlayerPosition[];
    } else if (typeof dbPlayer.position === 'string') {
      // If it contains brackets and quotes, it might be a JSON string
      if (dbPlayer.position.includes('[') && dbPlayer.position.includes('"')) {
        try {
          const parsed = JSON.parse(dbPlayer.position);
          // Validate each parsed position
          position = Array.isArray(parsed) ? 
            parsed.filter((pos: string) => 
              ["MV", "BACK", "MF", "ANF", "TRÄNARE"].includes(pos)
            ) as PlayerPosition[] : [];
        } catch (e) {
          // If parsing fails, treat as space-separated string
          position = dbPlayer.position
            .split(' ')
            .filter(p => p.trim() !== '' && ["MV", "BACK", "MF", "ANF", "TRÄNARE"].includes(p)) as PlayerPosition[];
        }
      } else {
        // Treat as space-separated string
        position = dbPlayer.position
          .split(' ')
          .filter(p => p.trim() !== '' && ["MV", "BACK", "MF", "ANF", "TRÄNARE"].includes(p)) as PlayerPosition[];
      }
    }
  }
  
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    grade: dbPlayer.grade || undefined,
    position: position,
    jersey_number: dbPlayer.jersey_number || undefined,
    image: dbPlayer.image || undefined,
    activities: [] // Will be populated separately
  };
};
