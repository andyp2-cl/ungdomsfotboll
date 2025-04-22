
import { Activity, PlayerStats } from "@/types/player";
import { normalizePlayerStats } from "@/utils/player-stats";
import { useToast } from "@/hooks/use-toast";

/**
 * Prepares updated player stats object with match result data
 */
export const prepareUpdatedPlayerStats = (
  activity: Activity,
  homeScore?: number,
  awayScore?: number,
  isWin?: boolean,
  isHome?: boolean
): PlayerStats => {
  const { toast } = useToast();
  
  try {
    // Start with existing player_stats or create a new object
    const playerStats = normalizePlayerStats(activity.player_stats);
    
    // Add the scores and win status
    playerStats.scores = {
      home: homeScore ?? 0,
      away: awayScore ?? 0
    };
    
    // Store the win status
    playerStats.isWin = isWin;
    
    // Add isHome information for context
    playerStats.isHomeMatch = isHome;
    
    return playerStats;
  } catch (error) {
    console.error("Error preparing player stats:", error);
    toast({
      title: "Fel vid uppdatering av statistik",
      description: "Kunde inte uppdatera matchstatistik. Försök igen.",
      variant: "destructive"
    });
    
    // Return a valid default object
    return {
      goals: {},
      assists: {},
      scores: {
        home: homeScore ?? 0,
        away: awayScore ?? 0
      },
      isWin: isWin,
      cup_matches: [],
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
  }
};

/**
 * @deprecated Use normalizePlayerStats from @/utils/player-stats instead
 */
const safeParseJson = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return { goals: {}, assists: {} };
  }
};
