
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
  
  let totalMatches = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsScored = 0;
  let goalsConceded = 0;
  let cleanSheets = 0;
  
  // Process each match
  matches.forEach(match => {
    // Only count matches with scores
    if (match.homeScore !== undefined && match.awayScore !== undefined) {
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
    }
  });
  
  console.log("Final stats:", {
    totalMatches,
    wins,
    draws,
    losses,
    goalsScored,
    goalsConceded,
    cleanSheets
  });
  
  return {
    totalMatches,
    wins,
    draws,
    losses,
    goalsScored,
    goalsConceded,
    cleanSheets
  };
}
