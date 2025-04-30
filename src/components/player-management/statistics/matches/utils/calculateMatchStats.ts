
import { Activity } from "@/types/player";
import { isHomeMatch } from "@/components/activity-detail/match-result/utils";

export interface MatchStats {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
}

export function calculateMatchStats(matches: Activity[]): MatchStats {
  console.log("Starting match stats calculation with", matches.length, "matches");
  
  // Default values
  const defaultStats: MatchStats = {
    totalMatches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsScored: 0,
    goalsConceded: 0,
    cleanSheets: 0
  };
  
  // Return default stats if no matches
  if (!matches || matches.length === 0) {
    console.log("No matches to process, returning default stats");
    return defaultStats;
  }
  
  try {
    let totalMatches = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let cleanSheets = 0;
    
    // Filter out future matches
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    const historicalMatches = matches.filter(match => {
      const matchDate = new Date(match.date);
      return matchDate <= today;
    });
    
    console.log(`Filtered ${matches.length - historicalMatches.length} future matches, processing ${historicalMatches.length} historical matches`);
    
    // Process each match
    historicalMatches.forEach(match => {
      // Skip matches without scores
      if (match.homeScore === undefined || match.awayScore === undefined) {
        return;
      }
      
      console.log(`Match: ${match.name}, homeScore: ${match.homeScore}, awayScore: ${match.awayScore}`);
      totalMatches++;
      
      // Count results
      if (match.homeScore === match.awayScore) {
        draws++;
      } else if (match.isWin === true) {
        wins++;
      } else {
        losses++;
      }
      
      try {
        // Use the utility function to determine if this is a home match
        const isHome = isHomeMatch(match);
        
        // Count goals - depending on who is home/away
        if (!isHome) {
          // If we're the away team, reverse the scores
          goalsScored += match.awayScore;
          goalsConceded += match.homeScore;
        } else {
          // Default: assume we're the home team
          goalsScored += match.homeScore;
          goalsConceded += match.awayScore;
        }
        
        // Count clean sheets - also adjust based on home/away
        if ((!isHome && match.homeScore === 0) || 
            (isHome && match.awayScore === 0)) {
          cleanSheets++;
        }
      } catch (err) {
        console.error("Error processing match stats for match:", match.id, err);
      }
    });
    
    const finalStats = {
      totalMatches,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      cleanSheets
    };
    
    console.log("Final stats:", finalStats);
    
    return finalStats;
  } catch (error) {
    console.error("Error calculating match stats:", error);
    return defaultStats;
  }
}
