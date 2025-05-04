
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

export const calculateMatchStats = (matches: Activity[]): MatchStats => {
  // Initialize stats
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsScored = 0;
  let goalsConceded = 0;
  let cleanSheets = 0;
  
  // Matches with actual results (that have scores)
  const matchesWithResults = matches.filter(match => 
    match.homeScore !== undefined && match.awayScore !== undefined
  );
  
  // Process each match with results
  matchesWithResults.forEach(match => {
    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;
    const isHome = isHomeMatch(match);
    
    // Check if this match has a clear win/loss/draw status set
    if (match.homeScore === match.awayScore) {
      // It's a draw if scores are equal
      draws++;
    }
    else if (match.isWin === true) {
      // Explicitly marked as a win
      wins++;
    }
    else if (match.isWin === false) {
      // Explicitly marked as a loss
      losses++;
    }
    else {
      // Calculate based on scores
      if (isHome) {
        if (homeScore > awayScore) wins++;
        else if (homeScore < awayScore) losses++;
        else draws++;
      } else {
        if (awayScore > homeScore) wins++;
        else if (awayScore < homeScore) losses++;
        else draws++;
      }
    }
    
    // Calculate goals scored/conceded based on home/away
    if (isHome) {
      goalsScored += homeScore;
      goalsConceded += awayScore;
      if (awayScore === 0) cleanSheets++;
    } else {
      goalsScored += awayScore;
      goalsConceded += homeScore;
      if (homeScore === 0) cleanSheets++;
    }
  });

  return {
    totalMatches: matchesWithResults.length,
    wins,
    draws,
    losses,
    goalsScored,
    goalsConceded,
    cleanSheets
  };
};
