
import { Player } from "@/types/player";

export const formatPlayerForDatabase = (player: Player) => {
  console.log("Formatting player for database with development data:", player.development);
  
  // Create a database-compatible object
  return {
    id: player.id,
    name: player.name,
    grade: player.grade,
    position: player.positions, // Store positions array as JSON string
    jersey_number: player.jerseyNumber,
    image: player.image,
    development: player.development ? JSON.stringify(player.development) : null // Convert development object to JSON string
  };
};

export const formatDatabasePlayer = (dbPlayer: any): Player => {
  let development = null;
  
  // Parse development JSON if it exists
  if (dbPlayer.development) {
    try {
      development = typeof dbPlayer.development === 'string' 
        ? JSON.parse(dbPlayer.development) 
        : dbPlayer.development;
      
      console.log("Successfully parsed development data:", development);
    } catch (e) {
      console.error("Error parsing player development data:", e);
      development = null;
    }
  } else {
    console.log("No development data found for player:", dbPlayer.name);
  }
  
  // Default development values if missing or invalid
  const defaultDevelopment = {
    technical: 1,
    gameUnderstanding: 1,
    passing: 1,
    offensive: 1,
    defensive: 1,
    mentality: 1
  };
  
  // Ensure all development values have defaults applied if missing
  const completeDevelopment = development ? {
    technical: development.technical ?? defaultDevelopment.technical,
    gameUnderstanding: development.gameUnderstanding ?? defaultDevelopment.gameUnderstanding,
    passing: development.passing ?? defaultDevelopment.passing,
    offensive: development.offensive ?? defaultDevelopment.offensive,
    defensive: development.defensive ?? defaultDevelopment.defensive,
    mentality: development.mentality ?? defaultDevelopment.mentality
  } : defaultDevelopment;
  
  // Construct the player object with all necessary fields
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    grade: dbPlayer.grade,
    positions: Array.isArray(dbPlayer.position) ? dbPlayer.position : (dbPlayer.position ? [dbPlayer.position] : []),
    jerseyNumber: dbPlayer.jersey_number,
    image: dbPlayer.image,
    activities: [], // Activities will be populated separately
    development: completeDevelopment
  };
};
