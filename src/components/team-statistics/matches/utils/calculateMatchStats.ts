
import { Activity } from "@/types/player";
import { determineOutcome } from "@/components/activity-detail/match-result/utils";
import { isHomeMatch } from "@/components/activity-detail/match-result/utils";

export interface MatchStatistics {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  winPercentage: number;
}

/**
 * Calculate match statistics from activities
 */
export const calculateMatchStatistics = (activities: Activity[]): MatchStatistics => {
  // Filter to only match activities with scores
  const matchActivities = activities.filter(
    a => a.type === 'match' && 
    a.homeScore !== undefined && 
    a.awayScore !== undefined
  );
  
  console.log(`Found ${matchActivities.length} matches with scores`);
  
  // Initialize statistics
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  
  // Count for each match
  matchActivities.forEach(match => {
    // Skip if no scores
    if (match.homeScore === undefined || match.awayScore === undefined) {
      return;
    }
    
    // Determine if this is a home match for Hässleholms IF
    const isHome = isHomeMatch(match);
    console.log(`Match ${match.id} (${match.name}): isHome=${isHome}, scores=${match.homeScore}-${match.awayScore}`);
    
    // Determine number of goals for and against
    if (isHome) {
      goalsFor += match.homeScore;
      goalsAgainst += match.awayScore;
    } else {
      goalsFor += match.awayScore;
      goalsAgainst += match.homeScore;
    }
    
    // Determine if the match is a win, loss, or draw
    if (match.homeScore === match.awayScore) {
      draws++;
      console.log(`Match ${match.id} is a draw: ${match.homeScore}-${match.awayScore}`);
    } else {
      // Use explicit isWin if available
      if (match.isWin === true) {
        wins++;
        console.log(`Match ${match.id} is explicitly marked as a win`);
      } else if (match.isWin === false) {
        losses++;
        console.log(`Match ${match.id} is explicitly marked as a loss`);
      } else {
        // Calculate based on isHome and scores
        const isWin = determineOutcome(match);
        if (isWin === true) {
          wins++;
          console.log(`Match ${match.id} calculated as a win`);
        } else if (isWin === false) {
          losses++;
          console.log(`Match ${match.id} calculated as a loss`);
        } else {
          draws++; // This should not happen, but just in case
          console.log(`Match ${match.id} has undefined outcome, marking as draw`);
        }
      }
    }
  });
  
  // Calculate total and win percentage
  const total = matchActivities.length;
  const winPercentage = total > 0 ? (wins / total) * 100 : 0;
  
  // Log stats for debugging
  console.log("Match statistics:", {
    total,
    wins,
    losses, 
    draws,
    goalsFor,
    goalsAgainst,
    winPercentage: winPercentage.toFixed(1) + "%"
  });
  
  return {
    total,
    wins,
    losses,
    draws,
    goalsFor,
    goalsAgainst,
    winPercentage
  };
};
