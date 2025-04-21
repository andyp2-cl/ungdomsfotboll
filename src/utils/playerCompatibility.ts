// Utility functions to ensure compatibility between different player data formats

/**
 * Ensures a player object has all required fields in the expected format
 */
export function normalizePlayer(player: any): any {
  if (!player) return null;
  
  return {
    id: player.id || '',
    name: player.name || '',
    grade: player.grade || 'C',
    positions: Array.isArray(player.positions) ? player.positions : [],
    jerseyNumber: player.jerseyNumber || player.jersey_number || '',
    image: player.image || '',
    activities: Array.isArray(player.activities) ? player.activities : [],
    // Add any other fields that need normalization
  };
}

// Convert old format players to new format
export function convertOldPlayerToNew(oldPlayer: any): any {
  if (!oldPlayer) return null;

  return {
    ...oldPlayer,
    // Convert jersey_number to jerseyNumber if needed
    jerseyNumber: oldPlayer.jerseyNumber || oldPlayer.jersey_number || undefined,
    // Keep any other properties
  };
}

/**
 * Merges player data from different sources, prioritizing newer data
 */
export function mergePlayerData(oldPlayer: any, newPlayer: any): any {
  if (!oldPlayer) return newPlayer;
  if (!newPlayer) return oldPlayer;
  
  return {
    ...oldPlayer,
    ...newPlayer,
    // Special handling for arrays - concat and deduplicate
    positions: [...new Set([
      ...(Array.isArray(oldPlayer.positions) ? oldPlayer.positions : []),
      ...(Array.isArray(newPlayer.positions) ? newPlayer.positions : [])
    ])],
    activities: [...new Set([
      ...(Array.isArray(oldPlayer.activities) ? oldPlayer.activities : []),
      ...(Array.isArray(newPlayer.activities) ? newPlayer.activities : [])
    ])],
  };
}
