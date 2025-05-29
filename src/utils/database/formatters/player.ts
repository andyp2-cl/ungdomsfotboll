
import { Player } from "@/types/player";

// Format player data for database storage
export const formatPlayerForDatabase = (player: Player) => {
  console.log("Formatting player for database:", player.name);
  console.log("Image data being formatted:", player.image ? "Yes" : "No");
  console.log("Development data being formatted:", player.development);
  
  return {
    id: player.id,
    name: player.name,
    grade: player.grade || 'A',
    position: player.positions ? JSON.stringify(player.positions) : null,
    jersey_number: player.jerseyNumber || null,
    image: player.image || null,
    development: player.development ? JSON.stringify(player.development) : null,
    is_active: player.isActive !== undefined ? player.isActive : true, // Default to true if not specified
  };
};

// Format database player data for application use
export const formatDatabasePlayer = (dbPlayer: any): Player => {
  console.log("Formatting database player:", dbPlayer.name);
  console.log("Raw development data from DB:", dbPlayer.development);
  console.log("Image data from DB:", dbPlayer.image ? "Yes" : "No");
  console.log("Is active from DB:", dbPlayer.is_active);
  
  let parsedDevelopment;
  try {
    if (dbPlayer.development && dbPlayer.development !== 'null') {
      if (typeof dbPlayer.development === 'string') {
        parsedDevelopment = JSON.parse(dbPlayer.development);
      } else {
        parsedDevelopment = dbPlayer.development;
      }
    }
  } catch (error) {
    console.error("Error parsing development data for player", dbPlayer.name, ":", error);
    parsedDevelopment = undefined;
  }
  
  let parsedPositions;
  try {
    if (dbPlayer.position && dbPlayer.position !== 'null') {
      if (typeof dbPlayer.position === 'string') {
        parsedPositions = JSON.parse(dbPlayer.position);
      } else {
        parsedPositions = dbPlayer.position;
      }
    }
  } catch (error) {
    console.error("Error parsing position data for player", dbPlayer.name, ":", error);
    parsedPositions = [];
  }
  
  const formattedPlayer: Player = {
    id: dbPlayer.id,
    name: dbPlayer.name,
    grade: dbPlayer.grade,
    positions: parsedPositions || [],
    jerseyNumber: dbPlayer.jersey_number,
    image: dbPlayer.image,
    development: parsedDevelopment,
    activities: [], // Will be populated separately
    isActive: dbPlayer.is_active !== undefined ? dbPlayer.is_active : true, // Default to true if not specified
  };
  
  console.log("Formatted player development:", formattedPlayer.development);
  console.log("Formatted player image:", formattedPlayer.image ? "Yes" : "No");
  console.log("Formatted player isActive:", formattedPlayer.isActive);
  
  return formattedPlayer;
};
