
import { Activity } from "@/types/player";

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
      totalMatches++;
      
      // Count results
      if (match.homeScore === match.awayScore) {
        draws++;
      } else if (match.isWin === true) {
        wins++;
      } else {
        losses++;
      }
      
      // Count goals - assuming home team is "us"
      goalsScored += match.homeScore;
      goalsConceded += match.awayScore; // Fix: Use awayScore for goals conceded
      
      // Count clean sheets
      if (match.awayScore === 0) {
        cleanSheets++;
      }
    }
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
