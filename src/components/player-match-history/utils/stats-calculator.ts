
import { Player, Activity } from "@/types/player";

interface PlayerStats {
  totalGoals: number;
  totalAssists: number;
  matchesWithGoals: number;
  matchesWithAssists: number;
  wins: number;
  draws: number;
  losses: number;
  matches: number;
}

export const calculatePlayerStats = (player: Player, matches: Activity[]): PlayerStats => {
  let totalGoals = 0;
  let totalAssists = 0;
  let matchesWithGoals = 0;
  let matchesWithAssists = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  
  // Only count matches that have been played (have results OR explicit win/loss status OR are in the past with no future date)
  const playedMatches = matches.filter(match => {
    // A match is considered played if it has scores OR explicit win/loss status OR is clearly in the past
    const hasScores = match.homeScore !== undefined && match.awayScore !== undefined;
    const hasResult = match.isWin !== undefined;
    
    // Check if the match is in the past (more than 3 hours ago to account for same-day matches)
    const matchDate = new Date(match.date);
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    const isInPast = matchDate < threeHoursAgo;
    
    return hasScores || hasResult || isInPast;
  });

  playedMatches.forEach(match => {
    // Count goals and assists
    const goals = match.player_stats?.goals?.[player.id] || 0;
    const assists = match.player_stats?.assists?.[player.id] || 0;
    
    totalGoals += goals;
    totalAssists += assists;
    
    if (goals > 0) matchesWithGoals++;
    if (assists > 0) matchesWithAssists++;
    
    // First check if scores are equal (draw)
    if (match.homeScore !== undefined && match.awayScore !== undefined && 
        match.homeScore === match.awayScore) {
      draws++;
    }
    // Then check explicit win/loss status
    else if (match.isWin === true) {
      wins++;
    } 
    else if (match.isWin === false) {
      losses++;
    }
    // If we have scores but no explicit win/loss, determine from scores
    else if (match.homeScore !== undefined && match.awayScore !== undefined) {
      if (match.homeScore > match.awayScore) {
        wins++;
      } else {
        losses++;
      }
    }
  });

  return {
    totalGoals,
    totalAssists,
    matchesWithGoals,
    matchesWithAssists,
    wins,
    draws,
    losses,
    matches: playedMatches.length
  };
};
