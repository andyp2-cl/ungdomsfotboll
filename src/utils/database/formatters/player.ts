
import { Player, PlayerDevelopment, PlayerPosition } from "@/types/player";

export interface DatabasePlayer {
  id: string;
  name: string;
  grade: string;
  position?: string; // Legacy field
  jersey_number?: string;
  image?: string;
  development?: string;
  created_at?: string;
}

// Default development values for all new fields
const getDefaultDevelopment = (): PlayerDevelopment => ({
  // Core original values
  technical: 1,
  gameUnderstanding: 1,
  passing: 1,
  offensive: 1,
  defensive: 1,
  mentality: 1,
  
  // New offensive values
  shooting: 1,
  crossing: 1,
  finishing: 1,
  creativity: 1,
  
  // New defensive values
  tackling: 1,
  interception: 1,
  positioning: 1,
  heading: 1,
  
  // New physical values
  speed: 1,
  stamina: 1,
  strength: 1,
  
  // New mental values
  leadership: 1,
  composure: 1,
  workRate: 1
});

// Helper function to safely parse positions from various formats
const parsePositions = (positionData?: string): PlayerPosition[] => {
  if (!positionData) return [];

  try {
    // If it starts with '[', it's probably a JSON array
    if (positionData.startsWith('[')) {
      const parsed = JSON.parse(positionData);
      return Array.isArray(parsed) ? parsed : [];
    }
    
    // If it contains commas, split by comma
    if (positionData.includes(',')) {
      return positionData.split(',').map(p => p.trim()) as PlayerPosition[];
    }
    
    // Single position as string
    return [positionData as PlayerPosition];
  } catch (error) {
    console.error('Error parsing position data:', positionData, error);
    return [];
  }
};

export const formatPlayerForDatabase = (player: Player): DatabasePlayer => {
  console.log("Formatting player for database:", player.name);
  console.log("Player image before formatting:", player.image);
  
  const formattedPlayer: DatabasePlayer = {
    id: player.id,
    name: player.name,
    grade: player.grade || "A",
    jersey_number: player.jerseyNumber,
    image: player.image, // Preserve image data
    development: player.development ? JSON.stringify(player.development) : undefined,
    created_at: new Date().toISOString()
  };
  
  console.log("Formatted player image:", formattedPlayer.image);
  
  return formattedPlayer;
};

export const formatDatabasePlayer = (dbPlayer: DatabasePlayer): Player => {
  console.log("Formatting database player:", dbPlayer.name);
  console.log("Database player image:", dbPlayer.image);
  console.log("Database player position field:", dbPlayer.position);
  
  let development: PlayerDevelopment | undefined = undefined;
  
  if (dbPlayer.development) {
    try {
      const parsedDev = JSON.parse(dbPlayer.development);
      console.log("Parsed development from database:", parsedDev);
      
      // Ensure all required fields exist with proper defaults
      const defaultDev = getDefaultDevelopment();
      development = {
        // Core original values
        technical: parsedDev.technical ?? defaultDev.technical,
        gameUnderstanding: parsedDev.gameUnderstanding ?? defaultDev.gameUnderstanding,
        passing: parsedDev.passing ?? defaultDev.passing,
        offensive: parsedDev.offensive ?? defaultDev.offensive,
        defensive: parsedDev.defensive ?? defaultDev.defensive,
        mentality: parsedDev.mentality ?? defaultDev.mentality,
        
        // New offensive values - inherit from existing if missing
        shooting: parsedDev.shooting ?? parsedDev.offensive ?? defaultDev.shooting,
        crossing: parsedDev.crossing ?? parsedDev.passing ?? defaultDev.crossing,
        finishing: parsedDev.finishing ?? parsedDev.offensive ?? defaultDev.finishing,
        creativity: parsedDev.creativity ?? parsedDev.gameUnderstanding ?? defaultDev.creativity,
        
        // New defensive values - inherit from existing if missing
        tackling: parsedDev.tackling ?? parsedDev.defensive ?? defaultDev.tackling,
        interception: parsedDev.interception ?? parsedDev.defensive ?? defaultDev.interception,
        positioning: parsedDev.positioning ?? parsedDev.gameUnderstanding ?? defaultDev.positioning,
        heading: parsedDev.heading ?? parsedDev.defensive ?? defaultDev.heading,
        
        // New physical values - inherit from existing if missing
        speed: parsedDev.speed ?? parsedDev.technical ?? defaultDev.speed,
        stamina: parsedDev.stamina ?? parsedDev.mentality ?? defaultDev.stamina,
        strength: parsedDev.strength ?? parsedDev.defensive ?? defaultDev.strength,
        
        // New mental values - inherit from existing if missing
        leadership: parsedDev.leadership ?? parsedDev.mentality ?? defaultDev.leadership,
        composure: parsedDev.composure ?? parsedDev.mentality ?? defaultDev.composure,
        workRate: parsedDev.workRate ?? parsedDev.mentality ?? defaultDev.workRate
      };
      
      console.log("Final development object:", development);
    } catch (error) {
      console.error("Error parsing development data:", error);
      development = getDefaultDevelopment();
    }
  }
  
  // Handle positions - parse from legacy position field
  const positions = parsePositions(dbPlayer.position);
  console.log("Parsed positions:", positions);
  
  const formattedPlayer: Player = {
    id: dbPlayer.id,
    name: dbPlayer.name,
    grade: dbPlayer.grade === "" ? undefined : dbPlayer.grade as any,
    positions: positions,
    jerseyNumber: dbPlayer.jersey_number,
    image: dbPlayer.image, // Preserve image data
    development: development,
    activities: [] // Will be populated separately
  };
  
  console.log("Formatted player with positions:", formattedPlayer.name, formattedPlayer.positions);
  
  return formattedPlayer;
};
