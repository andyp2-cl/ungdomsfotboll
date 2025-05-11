
import { Player } from "@/types/player";

export const formatPlayerForDatabase = (player: Player) => {
  console.log("Formatting player for database with development data:", player.development);
  
  // Create a database-compatible object with position as string
  return {
    id: player.id,
    name: player.name,
    grade: player.grade,
    position: player.positions ? JSON.stringify(player.positions) : null, // Convert positions array to JSON string
    jersey_number: player.jerseyNumber,
    image: player.image,
    development: player.development ? JSON.stringify(player.development) : null // Convert development object to JSON string
  };
};

export const formatDatabasePlayer = (dbPlayer: any): Player => {
  let development = null;
  let positions = [];
  
  // Parse positions JSON if it exists
  if (dbPlayer.position) {
    try {
      positions = typeof dbPlayer.position === 'string' 
        ? JSON.parse(dbPlayer.position) 
        : dbPlayer.position;
      
      console.log("Successfully parsed position data:", positions);
    } catch (e) {
      console.error("Error parsing player position data:", e);
      positions = [];
    }
  }
  
  // Parse development JSON if it exists
  if (dbPlayer.development) {
    try {
      // Force development to be parsed as a string
      const devStr = typeof dbPlayer.development === 'string' 
        ? dbPlayer.development 
        : JSON.stringify(dbPlayer.development);
      
      development = JSON.parse(devStr);
      console.log("Successfully parsed development data:", development);
    } catch (e) {
      console.error("Error parsing player development data:", e);
      console.error("Raw development data:", dbPlayer.development);
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
    positions: Array.isArray(positions) ? positions : (positions ? [positions] : []),
    jerseyNumber: dbPlayer.jersey_number,
    image: dbPlayer.image,
    activities: [], // Activities will be populated separately
    development: completeDevelopment
  };
};
