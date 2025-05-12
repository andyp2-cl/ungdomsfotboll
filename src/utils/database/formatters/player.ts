
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
      // Handle different data types for development
      if (typeof dbPlayer.development === 'object' && dbPlayer.development !== null) {
        // Already an object
        development = dbPlayer.development;
      } else if (typeof dbPlayer.development === 'string') {
        // Parse JSON string
        development = JSON.parse(dbPlayer.development);
      } else {
        console.error("Unknown development data type:", typeof dbPlayer.development);
        development = null;
      }
      
      console.log(`Successfully parsed development data for ${dbPlayer.name}:`, development);
    } catch (e) {
      console.error(`Error parsing player development data for ${dbPlayer.name}:`, e);
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
  
  // Ensure all development values have defaults applied if missing or invalid
  let completeDevelopment;
  if (development && typeof development === 'object') {
    completeDevelopment = {
      technical: development.technical || defaultDevelopment.technical,
      gameUnderstanding: development.gameUnderstanding || defaultDevelopment.gameUnderstanding,
      passing: development.passing || defaultDevelopment.passing,
      offensive: development.offensive || defaultDevelopment.offensive,
      defensive: development.defensive || defaultDevelopment.defensive,
      mentality: development.mentality || defaultDevelopment.mentality
    };
  } else {
    completeDevelopment = defaultDevelopment;
  }
  
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
