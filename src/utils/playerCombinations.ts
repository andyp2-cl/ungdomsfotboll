import { Player, Activity } from "@/types/player";
import { calculateDetailedPlayerActivityFrequency, generatePlayerSelectionReasoning } from "./playerActivityAnalysis";

// Interface for player in a lineup suggestion
export interface SuggestedPlayer {
  playerId: string;
  playerName: string;
  position: string;
  reasoning: string;
}

// Interface for lineup suggestion result
export interface LineupSuggestion {
  players: SuggestedPlayer[];
  benchPlayers?: SuggestedPlayer[];
  formation: string;
  totalEfficiency: number;
  expectedWinRate: number;
  confidence: number;
  reasoning: string[];
}

// Interface for balanced lineup suggestion
export interface BalancedLineupSuggestion extends LineupSuggestion {
  expectedGoalDifference: number;
  balanceScore: number;
  opponentAnalysis?: any;
}

// Interface for opponent match analysis
export interface OpponentAnalysis {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageGoalDifference: number;
  goalDifferenceRange: {
    min: number;
    max: number;
    variance: number;
  };
  recentForm: {
    date: string;
    result: 'W' | 'D' | 'L';
    goalDifference: number;
  }[];
}

// New interface for historical lineup analysis
export interface OpponentHistoricalAnalysis {
  averageGrade: number;
  gradeDistribution: Record<string, number>;
  lastMatchResult: {
    goalDifference: number;
    ourGrade: number;
    wasWin: boolean;
  } | null;
  recommendedGradeAdjustment: number; // -1 = go lower, 0 = same, +1 = go higher
  reasoning: string;
}

// Get unique opponents from activities
export const getOpponents = (activities: Activity[]): string[] => {
  const opponentSet = new Set<string>();
  
  activities.forEach(activity => {
    if (activity.type === 'match' && activity.name) {
      // Extract opponent name from activity name
      const parts = activity.name.split(/\s+vs\.?\s+|\s+mot\s+/i);
      if (parts.length > 1) {
        // Take the second part as opponent name
        opponentSet.add(parts[1].trim());
      } else {
        // If no "vs" or "mot" pattern, just use the whole name
        opponentSet.add(activity.name.trim());
      }
    }
  });
  
  return Array.from(opponentSet).sort();
};

// Analyze opponent match history
export const analyzeOpponentHistory = (activities: Activity[], opponent: string): OpponentAnalysis => {
  // Find all matches against this opponent
  const opponentMatches = activities.filter(activity => 
    activity.type === 'match' && 
    activity.name.toLowerCase().includes(opponent.toLowerCase())
  );
  
  if (opponentMatches.length === 0) {
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      averageGoalDifference: 0,
      goalDifferenceRange: { min: 0, max: 0, variance: 0 },
      recentForm: []
    };
  }
  
  // Sort by date (newest first)
  const sortedMatches = [...opponentMatches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Calculate stats
  let wins = 0;
  let losses = 0;
  let draws = 0;
  const goalDifferences: number[] = [];
  
  sortedMatches.forEach(match => {
    let goalDifference = 0;
    let result: 'W' | 'D' | 'L' = 'D';
    
    // Determine result and goal difference
    if (match.isWin === true) {
      wins++;
      result = 'W';
      goalDifference = match.homeScore && match.awayScore ? 
        match.homeScore - match.awayScore : 1;
    } else if (match.isWin === false) {
      // Check if it's a draw by comparing scores
      if (match.homeScore !== undefined && match.awayScore !== undefined) {
        if (match.homeScore === match.awayScore) {
          draws++;
          result = 'D';
          goalDifference = 0;
        } else {
          losses++;
          result = 'L';
          goalDifference = match.homeScore - match.awayScore;
        }
      } else {
        losses++;
        result = 'L';
        goalDifference = -1;
      }
    } else if (match.homeScore !== undefined && match.awayScore !== undefined) {
      goalDifference = match.homeScore - match.awayScore;
      if (goalDifference > 0) {
        wins++;
        result = 'W';
      } else if (goalDifference < 0) {
        losses++;
        result = 'L';
      } else {
        draws++;
        result = 'D';
      }
    }
    
    goalDifferences.push(goalDifference);
  });
  
  // Calculate average goal difference
  const averageGoalDifference = goalDifferences.length > 0 ?
    goalDifferences.reduce((sum, diff) => sum + diff, 0) / goalDifferences.length : 0;
  
  // Calculate variance
  const variance = goalDifferences.length > 0 ?
    goalDifferences.reduce((sum, diff) => sum + Math.pow(diff - averageGoalDifference, 2), 0) / goalDifferences.length : 0;
  
  // Get min and max goal differences
  const minGoalDiff = Math.min(...(goalDifferences.length > 0 ? goalDifferences : [0]));
  const maxGoalDiff = Math.max(...(goalDifferences.length > 0 ? goalDifferences : [0]));
  
  // Get recent form (last 5 matches)
  const recentForm = sortedMatches.slice(0, 5).map(match => {
    let result: 'W' | 'D' | 'L' = 'D';
    let goalDifference = 0;
    
    if (match.isWin === true) {
      result = 'W';
      goalDifference = match.homeScore && match.awayScore ? 
        match.homeScore - match.awayScore : 1;
    } else if (match.isWin === false) {
      if (match.homeScore !== undefined && match.awayScore !== undefined && match.homeScore === match.awayScore) {
        result = 'D';
        goalDifference = 0;
      } else {
        result = 'L';
        goalDifference = match.homeScore && match.awayScore ? 
          match.homeScore - match.awayScore : -1;
      }
    } else if (match.homeScore !== undefined && match.awayScore !== undefined) {
      goalDifference = match.homeScore - match.awayScore;
      result = goalDifference > 0 ? 'W' : goalDifference < 0 ? 'L' : 'D';
    }
    
    return {
      date: new Date(match.date).toLocaleDateString('sv-SE'),
      result,
      goalDifference
    };
  });
  
  return {
    totalMatches: opponentMatches.length,
    wins,
    losses,
    draws,
    winRate: (wins / opponentMatches.length) * 100,
    averageGoalDifference,
    goalDifferenceRange: {
      min: minGoalDiff,
      max: maxGoalDiff,
      variance
    },
    recentForm
  };
};

// Get positions for a formation
export const getFormationPositions = (formation: string): string[] => {
  // Default formation is 2-3-1
  const defaultPositions = ['Goalkeeper', 'RightBack', 'LeftBack', 'RightMid', 'CenterMid', 'LeftMid', 'Forward'];
  
  switch (formation) {
    case '2-3-1':
      return defaultPositions;
    case '3-2-1':
      return ['Goalkeeper', 'RightBack', 'CenterBack', 'LeftBack', 'RightMid', 'LeftMid', 'Forward'];
    case '2-2-2':
      return ['Goalkeeper', 'RightBack', 'LeftBack', 'RightMid', 'LeftMid', 'RightForward', 'LeftForward'];
    case '3-3':
      return ['Goalkeeper', 'RightBack', 'CenterBack', 'LeftBack', 'RightMid', 'CenterMid', 'LeftMid'];
    case '2-1-3':
      return ['Goalkeeper', 'RightBack', 'LeftBack', 'CenterMid', 'RightForward', 'CenterForward', 'LeftForward'];
    default:
      return defaultPositions;
  }
};

// Calculate compatibility between players
export const calculatePlayerCompatibility = (
  player1: Player,
  player2: Player,
  activities: Activity[]
): number => {
  // Find activities where both players participated
  const sharedActivities = activities.filter(activity => 
    activity.participants?.includes(player1.id) && 
    activity.participants?.includes(player2.id)
  );
  
  if (sharedActivities.length === 0) {
    return 0.5; // Neutral compatibility if no shared activities
  }
  
  // Calculate win rate in shared activities
  const wins = sharedActivities.filter(activity => activity.isWin === true).length;
  const winRate = wins / sharedActivities.length;
  
  // Calculate compatibility score (0-1)
  const baseCompatibility = winRate;
  
  // Bonus for playing together frequently
  const frequencyBonus = Math.min(0.2, sharedActivities.length / 10);
  
  // Bonus for complementary positions
  const positionBonus = arePositionsComplementary(player1.positions, player2.positions) ? 0.1 : 0;
  
  return Math.min(1, baseCompatibility + frequencyBonus + positionBonus);
};

// Check if positions are complementary
const arePositionsComplementary = (
  positions1: string[] | undefined, 
  positions2: string[] | undefined
): boolean => {
  if (!positions1 || !positions2) return false;
  
  const defensePositions = ['Goalkeeper', 'RightBack', 'CenterBack', 'LeftBack'];
  const offensePositions = ['RightForward', 'CenterForward', 'LeftForward', 'Forward'];
  
  const isPlayer1Defense = positions1.some(pos => defensePositions.includes(pos));
  const isPlayer2Defense = positions2.some(pos => defensePositions.includes(pos));
  
  const isPlayer1Offense = positions1.some(pos => offensePositions.includes(pos));
  const isPlayer2Offense = positions2.some(pos => offensePositions.includes(pos));
  
  // Complementary if one is defense and one is offense
  return (isPlayer1Defense && isPlayer2Offense) || (isPlayer1Offense && isPlayer2Defense);
};

// Find the best combination of players for positions
export const findBestCombination = (
  players: Player[],
  positions: string[],
  scorePlayerFn: (player: Player, position: string) => number
): LineupSuggestion => {
  // Map to store best player for each position
  const bestPlayers: Record<string, { player: Player; score: number; reasoning: string }> = {};
  
  // Map to store bench players
  const benchPlayers: { player: Player; score: number; position: string; reasoning: string }[] = [];
  
  // For each position, find the best player
  positions.forEach(position => {
    let bestScore = -1;
    let bestPlayer: Player | null = null;
    
    players.forEach(player => {
      // Skip players already assigned to a position
      if (Object.values(bestPlayers).some(bp => bp.player.id === player.id)) {
        return;
      }
      
      const score = scorePlayerFn(player, position);
      
      if (score > bestScore) {
        bestScore = score;
        bestPlayer = player;
      }
    });
    
    if (bestPlayer) {
      // Generate reasoning for this selection
      const reasoning = `Bäst lämpad för ${position} baserat på position och prestanda`;
      
      bestPlayers[position] = {
        player: bestPlayer,
        score: bestScore,
        reasoning
      };
    }
  });
  
  // Find bench players (next best players not in starting lineup)
  const startingPlayerIds = Object.values(bestPlayers).map(bp => bp.player.id);
  const availablePlayers = players.filter(p => !startingPlayerIds.includes(p.id));
  
  // For each available player, find their best position
  availablePlayers.forEach(player => {
    let bestPositionScore = -1;
    let bestPosition = '';
    
    positions.forEach(position => {
      const score = scorePlayerFn(player, position);
      if (score > bestPositionScore) {
        bestPositionScore = score;
        bestPosition = position;
      }
    });
    
    if (bestPosition) {
      const reasoning = `Backup för ${bestPosition}`;
      
      benchPlayers.push({
        player,
        score: bestPositionScore,
        position: bestPosition,
        reasoning
      });
    }
  });
  
  // Sort bench players by score
  benchPlayers.sort((a, b) => b.score - a.score);
  
  // Calculate total efficiency
  const totalEfficiency = Object.values(bestPlayers)
    .reduce((sum, bp) => sum + bp.score, 0) / positions.length;
  
  // Calculate expected win rate based on efficiency
  const expectedWinRate = Math.min(95, Math.round(totalEfficiency * 70 + 30));
  
  // Calculate confidence based on data availability
  const confidence = Math.min(90, Math.round(totalEfficiency * 50 + 40));
  
  // Create result object
  const result: LineupSuggestion = {
    players: Object.entries(bestPlayers).map(([position, data]) => ({
      playerId: data.player.id,
      playerName: data.player.name,
      position,
      reasoning: data.reasoning
    })),
    benchPlayers: benchPlayers.slice(0, 5).map(bp => ({
      playerId: bp.player.id,
      playerName: bp.player.name,
      position: bp.position,
      reasoning: bp.reasoning
    })),
    formation: positions.length === 7 ? '2-3-1' : `${positions.length}-?`,
    totalEfficiency,
    expectedWinRate,
    confidence,
    reasoning: [
      `Lineup optimerad för maximal prestanda`,
      `Förväntad vinstchans: ${expectedWinRate}%`,
      `Baserat på spelarnas positioner och historiska prestanda`,
      `Totalt ${positions.length} spelare i startelvan`
    ]
  };
  
  return result;
};

// Enhanced function to analyze opponent's historical data and suggest grade adjustments
export const analyzeOpponentGradeHistory = (
  activities: Activity[],
  opponent: string,
  players: Player[]
): OpponentHistoricalAnalysis => {
  // Find all matches against this opponent
  const opponentMatches = activities
    .filter(activity => 
      activity.type === 'match' && 
      activity.name.toLowerCase().includes(opponent.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (opponentMatches.length === 0) {
    return {
      averageGrade: 2.5, // Default B/C level
      gradeDistribution: {},
      lastMatchResult: null,
      recommendedGradeAdjustment: 0,
      reasoning: "Ingen tidigare data mot detta lag - använder standardnivå"
    };
  }

  // Helper function to convert grade to numeric value
  const gradeToNumber = (grade: string): number => {
    switch (grade?.toUpperCase()) {
      case 'A': return 4;
      case 'B': return 3;
      case 'C': return 2;
      case 'D': return 1;
      default: return 2.5;
    }
  };

  // Helper function to convert numeric value back to grade
  const numberToGrade = (num: number): string => {
    if (num >= 3.5) return 'A';
    if (num >= 2.5) return 'B';
    if (num >= 1.5) return 'C';
    return 'D';
  };

  // Analyze the last match for specific recommendations
  const lastMatch = opponentMatches[0];
  let lastMatchResult = null;
  let recommendedGradeAdjustment = 0;
  let reasoning = "";

  if (lastMatch && lastMatch.participants) {
    // Calculate average grade of our players in the last match
    const lastMatchPlayers = players.filter(p => 
      lastMatch.participants?.includes(p.id)
    );
    
    const lastMatchGrades = lastMatchPlayers.map(p => gradeToNumber(p.grade));
    const ourLastGrade = lastMatchGrades.length > 0 
      ? lastMatchGrades.reduce((a, b) => a + b, 0) / lastMatchGrades.length 
      : 2.5;

    // Determine goal difference and result
    let goalDifference = 0;
    let wasWin = false;

    if (lastMatch.homeScore !== undefined && lastMatch.awayScore !== undefined) {
      goalDifference = lastMatch.homeScore - lastMatch.awayScore;
      wasWin = goalDifference > 0;
    } else if (lastMatch.isWin !== undefined) {
      wasWin = lastMatch.isWin;
      // Estimate goal difference from result text if available
      if (lastMatch.result) {
        const scoreMatch = lastMatch.result.match(/(\d+)-(\d+)/);
        if (scoreMatch) {
          goalDifference = parseInt(scoreMatch[1]) - parseInt(scoreMatch[2]);
        }
      }
    }

    lastMatchResult = {
      goalDifference,
      ourGrade: ourLastGrade,
      wasWin
    };

    // Smart grade adjustment logic
    if (wasWin && Math.abs(goalDifference) >= 5) {
      // Won by large margin - suggest lower grade for more even match
      recommendedGradeAdjustment = -1;
      reasoning = `Förra matchen vann vi med ${goalDifference} mål med nivå ${numberToGrade(ourLastGrade)}-snitt. Föreslår lägre nivå för jämnare match.`;
    } else if (wasWin && Math.abs(goalDifference) <= 2) {
      // Won narrowly - keep similar or slightly higher
      recommendedGradeAdjustment = 0;
      reasoning = `Förra matchen vann vi knappt (${goalDifference} mål) med nivå ${numberToGrade(ourLastGrade)}-snitt. Behåller liknande nivå.`;
    } else if (!wasWin) {
      // Lost - suggest higher grade for better chances
      recommendedGradeAdjustment = 1;
      reasoning = `Förra matchen förlorade vi med ${Math.abs(goalDifference)} mål med nivå ${numberToGrade(ourLastGrade)}-snitt. Föreslår högre nivå för säkrare vinst.`;
    } else {
      // Moderate win - keep similar level
      recommendedGradeAdjustment = 0;
      reasoning = `Förra matchen vann vi med ${goalDifference} mål med nivå ${numberToGrade(ourLastGrade)}-snitt. Behåller liknande nivå.`;
    }
  }

  // Calculate overall historical grade distribution
  const allGrades: number[] = [];
  const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

  opponentMatches.forEach(match => {
    if (match.participants) {
      const matchPlayers = players.filter(p => match.participants?.includes(p.id));
      matchPlayers.forEach(player => {
        const gradeNum = gradeToNumber(player.grade);
        allGrades.push(gradeNum);
        gradeDistribution[player.grade || 'C']++;
      });
    }
  });

  const averageGrade = allGrades.length > 0 
    ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length 
    : 2.5;

  return {
    averageGrade,
    gradeDistribution,
    lastMatchResult,
    recommendedGradeAdjustment,
    reasoning: reasoning || `Historiskt snitt mot detta lag: nivå ${numberToGrade(averageGrade)}`
  };
};

// Enhanced balanced lineup suggestion with grade-based strategy
export const suggestBalancedLineup = (
  players: Player[],
  activities: Activity[],
  opponent: string,
  formation: string,
  targetGoalDifference: number = 2,
  prioritizeNewPlayers: boolean = false,
  rotationStrength: number = 70
): BalancedLineupSuggestion => {
  // Get opponent analysis including grade recommendations
  const opponentAnalysis = analyzeOpponentGradeHistory(activities, opponent, players);
  
  // Get formation positions
  const positions = getFormationPositions(formation);
  
  // Filter active players only
  const activePlayers = players.filter(player => player.isActive !== false);
  
  // Calculate activity frequency for rotation
  const activityStats = calculateDetailedPlayerActivityFrequency(activePlayers, activities);
  
  // Helper function to convert grade to numeric value with strategic adjustment
  const gradeToNumber = (grade: string): number => {
    const baseValue = {
      'A': 4,
      'B': 3, 
      'C': 2,
      'D': 1
    }[grade?.toUpperCase()] || 2;
    
    // Apply strategic adjustment based on opponent history
    return baseValue + (opponentAnalysis.recommendedGradeAdjustment * 0.5);
  };

  // Enhanced player scoring with grade strategy
  const scorePlayer = (player: Player, position: string): number => {
    let score = 0;
    
    // Base grade score with strategic adjustment
    const gradeScore = gradeToNumber(player.grade || 'C') * 3;
    score += gradeScore;
    
    // Position compatibility
    if (player.positions?.includes(position)) {
      score += 8;
    } else if (player.positions?.some(pos => 
      (position.includes('Back') && pos.includes('Back')) ||
      (position.includes('Mid') && pos.includes('Mid')) ||
      (position.includes('Forward') && pos.includes('Forward'))
    )) {
      score += 4;
    }
    
    // Historical performance against this opponent
    const playerOpponentMatches = activities.filter(activity =>
      activity.type === 'match' &&
      activity.name.toLowerCase().includes(opponent.toLowerCase()) &&
      activity.participants?.includes(player.id)
    );
    
    if (playerOpponentMatches.length > 0) {
      const wins = playerOpponentMatches.filter(match => match.isWin === true).length;
      const winRate = wins / playerOpponentMatches.length;
      score += winRate * 4; // Bonus for players who've performed well against this opponent
    } else if (prioritizeNewPlayers) {
      score += 3; // Bonus for players who haven't faced this opponent
    }
    
    // Rest/rotation factor (scaled by rotationStrength parameter)
    const playerStats = activityStats[player.id];
    if (playerStats) {
      const restBonus = (1 - playerStats.restFactor) * (rotationStrength / 100) * 4;
      score += restBonus;
    }
    
    return score;
  };

  const suggestion = findBestCombination(activePlayers, positions, scorePlayer);
  
  // Enhanced reasoning with opponent-specific strategy
  const reasoning = [
    opponentAnalysis.reasoning,
    `Formation: ${formation} med ${suggestion.players.length} spelare`,
    `Målet är ${targetGoalDifference} måls vinst för balanserad match`,
    rotationStrength > 50 
      ? `Prioriterar vila (${rotationStrength}% viktning)`
      : `Fokuserar på prestanda (${rotationStrength}% viktning)`,
    prioritizeNewPlayers 
      ? "Prioriterar spelare som inte mött detta lag tidigare"
      : "Baserat på historisk prestanda mot motståndaren"
  ];

  // Calculate expected goal difference based on grade adjustment
  const baseExpectedDifference = targetGoalDifference;
  const adjustedExpectedDifference = baseExpectedDifference + (opponentAnalysis.recommendedGradeAdjustment * 1.5);

  return {
    ...suggestion,
    expectedGoalDifference: Math.max(0.5, adjustedExpectedDifference),
    reasoning,
    opponentAnalysis, // Add this for display in UI
    confidence: suggestion.confidence * (opponentAnalysis.lastMatchResult ? 1.1 : 0.9), // Higher confidence if we have historical data
    balanceScore: 70 // Default balance score
  };
};

// Enhanced optimal lineup with opponent awareness
export const suggestOptimalLineup = (
  players: Player[],
  activities: Activity[],
  formation: string,
  opponent?: string
): LineupSuggestion => {
  // Get formation positions
  const positions = getFormationPositions(formation);
  
  // Filter active players only
  const activePlayers = players.filter(player => player.isActive !== false);
  
  // Calculate activity frequency for rotation
  const activityStats = calculateDetailedPlayerActivityFrequency(activePlayers, activities);
  
  // Get opponent analysis if opponent is specified
  const opponentAnalysis = opponent ? analyzeOpponentGradeHistory(activities, opponent, players) : null;
  
  // Enhanced player scoring with opponent-specific adjustments
  const scorePlayer = (player: Player, position: string): number => {
    let score = 0;
    
    // Base grade score with potential strategic adjustment
    let gradeMultiplier = 1;
    if (opponentAnalysis) {
      gradeMultiplier += opponentAnalysis.recommendedGradeAdjustment * 0.3;
    }
    
    const gradeScore = ({
      'A': 15,
      'B': 10,
      'C': 5,
      'D': 0
    }[player.grade?.toUpperCase()] || 5) * gradeMultiplier;
    
    score += gradeScore;
    
    // Position compatibility
    if (player.positions?.includes(position)) {
      score += 10;
    } else if (player.positions?.some(pos => 
      (position.includes('Back') && pos.includes('Back')) ||
      (position.includes('Mid') && pos.includes('Mid')) ||
      (position.includes('Forward') && pos.includes('Forward'))
    )) {
      score += 5;
    }
    
    // Historical performance
    const playerMatches = activities.filter(activity =>
      activity.type === 'match' &&
      activity.participants?.includes(player.id)
    );
    
    if (playerMatches.length > 0) {
      const wins = playerMatches.filter(match => match.isWin === true).length;
      const winRate = wins / playerMatches.length;
      score += winRate * 5;
    }
    
    // Opponent-specific performance if opponent is specified
    if (opponent) {
      const playerOpponentMatches = activities.filter(activity =>
        activity.type === 'match' &&
        activity.name.toLowerCase().includes(opponent.toLowerCase()) &&
        activity.participants?.includes(player.id)
      );
      
      if (playerOpponentMatches.length > 0) {
        const wins = playerOpponentMatches.filter(match => match.isWin === true).length;
        const winRate = wins / playerOpponentMatches.length;
        score += winRate * 8; // Higher bonus for opponent-specific performance
      }
    }
    
    // Rest factor (less important for optimal lineup)
    const playerStats = activityStats[player.id];
    if (playerStats) {
      const restBonus = (1 - playerStats.restFactor) * 2;
      score += restBonus;
    }
    
    return score;
  };

  const suggestion = findBestCombination(activePlayers, positions, scorePlayer);
  
  // Enhanced reasoning
  const reasoning = [
    `Optimal lineup för formation ${formation}`,
    opponent && opponentAnalysis 
      ? opponentAnalysis.reasoning
      : "Baserat på spelarkvalitet och vila",
    `Totalt ${suggestion.players.length} spelare valda`,
    "Optimerad för högsta möjliga prestanda"
  ];

  return {
    ...suggestion,
    reasoning
  };
};

// Calculate player combinations efficiency
export const calculateCombinationEfficiency = (
  players: Player[],
  activities: Activity[]
): { combination: string; efficiency: number; matches: number; winRate: number }[] => {
  // Get all player combinations that have played together
  const combinations: Record<string, { wins: number; matches: number; players: string[] }> = {};
  
  // Filter match activities
  const matchActivities = activities.filter(activity => activity.type === 'match');
  
  // For each match, record player combinations
  matchActivities.forEach(match => {
    if (!match.participants || match.participants.length < 2) return;
    
    // Get player IDs for this match
    const playerIds = match.participants;
    
    // Generate all possible pairs
    for (let i = 0; i < playerIds.length; i++) {
      for (let j = i + 1; j < playerIds.length; j++) {
        const player1 = playerIds[i];
        const player2 = playerIds[j];
        
        // Create a unique key for this pair
        const key = [player1, player2].sort().join('-');
        
        if (!combinations[key]) {
          combinations[key] = { wins: 0, matches: 0, players: [player1, player2] };
        }
        
        combinations[key].matches++;
        
        // Count as win if match was won
        if (match.isWin === true) {
          combinations[key].wins++;
        }
      }
    }
  });
  
  // Convert to array and calculate efficiency
  const result = Object.entries(combinations).map(([key, data]) => {
    const winRate = data.matches > 0 ? (data.wins / data.matches) * 100 : 0;
    
    // Get player names
    const playerNames = data.players.map(id => {
      const player = players.find(p => p.id === id);
      return player ? player.name : 'Unknown';
    });
    
    return {
      combination: playerNames.join(' & '),
      efficiency: winRate,
      matches: data.matches,
      winRate
    };
  });
  
  // Sort by efficiency and filter for minimum matches
  return result
    .filter(item => item.matches >= 3)
    .sort((a, b) => b.efficiency - a.efficiency);
};

// Calculate player synergy matrix
export const calculatePlayerSynergyMatrix = (
  players: Player[],
  activities: Activity[]
): { player1: string; player2: string; synergy: number; matches: number }[] => {
  const synergyMatrix: { player1: string; player2: string; synergy: number; matches: number }[] = [];
  
  // For each pair of players, calculate synergy
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const player1 = players[i];
      const player2 = players[j];
      
      const compatibility = calculatePlayerCompatibility(player1, player2, activities);
      
      // Find matches where both players participated
      const sharedMatches = activities.filter(activity => 
        activity.type === 'match' &&
        activity.participants?.includes(player1.id) && 
        activity.participants?.includes(player2.id)
      );
      
      synergyMatrix.push({
        player1: player1.name,
        player2: player2.name,
        synergy: compatibility,
        matches: sharedMatches.length
      });
    }
  }
  
  // Sort by synergy and filter for minimum matches
  return synergyMatrix
    .filter(item => item.matches >= 2)
    .sort((a, b) => b.synergy - a.synergy);
};
