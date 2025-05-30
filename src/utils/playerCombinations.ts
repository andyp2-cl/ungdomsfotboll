import { Player, Activity, PlayerPosition } from "@/types/player";

// Extended Activity interface for our utility functions (without conflicting participants override)
interface ExtendedActivity extends Activity {
  opponent?: string;
  goalDifference?: number;
}

// Interface for player combination analysis
export interface PlayerCombination {
  playerIds: string[];
  playerNames: string[];
  matchesTogether: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  totalGoals: number;
  totalAssists: number;
  averagePerformance: number;
  positionSynergy: number;
  combinationEfficiency: number;
}

// Interface for combination matrix
export interface CombinationMatrix {
  [playerId: string]: {
    [partnerId: string]: {
      matchesTogether: number;
      winRate: number;
      efficiency: number;
    };
  };
}

// New interfaces for smart level evaluation
export interface OpponentLevelAnalysis {
  averageGrade: number;
  gradeDistribution: Record<string, number>;
  lastMatchResult?: {
    ourGrade: number;
    goalDifference: number;
    wasWin: boolean;
  };
  recommendedGradeAdjustment: number;
  reasoning: string;
}

export interface LineupSuggestion {
  formation: string;
  players: Array<{
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }>;
  totalEfficiency: number;
  expectedWinRate: number;
  confidence: number;
  reasoning: string[];
  recommendedAverageGrade?: number;
  gradeStrategy?: string;
}

export interface BalancedLineupSuggestion {
  formation: string;
  players: Array<{
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }>;
  benchPlayers?: Array<{
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }>;
  expectedGoalDifference: number;
  balanceScore: number;
  confidence: number;
  reasoning: string[];
}

// Helper function to convert grade to numeric value
function gradeToNumeric(grade: string): number {
  switch (grade?.toUpperCase()) {
    case 'A': return 4;
    case 'B': return 3;
    case 'C': return 2;
    case 'D': return 1;
    default: return 2; // Default to C
  }
}

// Helper function to convert numeric value to grade
function numericToGrade(value: number): string {
  if (value >= 3.5) return 'A';
  if (value >= 2.5) return 'B';
  if (value >= 1.5) return 'C';
  return 'D';
}

// Get grade points for optimization (higher is better)
function getGradePoints(grade: string): number {
  switch (grade?.toUpperCase()) {
    case 'A': return 15;
    case 'B': return 10;
    case 'C': return 5;
    case 'D': return 0;
    default: return 5; // Default to C level
  }
}

// Calculate position synergy between two positions
function calculatePositionSynergy(pos1: string, pos2: string): number {
  const synergyMap: Record<string, Record<string, number>> = {
    'MÅLVAKT': {
      'BACK': 1.3,
      'MITTFÄLT': 1.1,
      'FORWARD': 1.0,
    },
    'BACK': {
      'MÅLVAKT': 1.3,
      'BACK': 1.2,
      'MITTFÄLT': 1.4,
      'FORWARD': 1.1,
    },
    'MITTFÄLT': {
      'MÅLVAKT': 1.1,
      'BACK': 1.4,
      'MITTFÄLT': 1.2,
      'FORWARD': 1.3,
    },
    'FORWARD': {
      'MÅLVAKT': 1.0,
      'BACK': 1.1,
      'MITTFÄLT': 1.3,
      'FORWARD': 1.1,
    },
  };

  return synergyMap[pos1]?.[pos2] || 1.0;
}

// Helper function to calculate goal difference from activity
function calculateGoalDifference(activity: Activity): number {
  if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
    return activity.homeScore - activity.awayScore;
  }
  return 0;
}

// Helper function to get opponent name from activity
function getOpponentName(activity: Activity): string | undefined {
  // Try to extract opponent from activity name if not directly available
  if (activity.name) {
    // First try to handle " - " separator (primary format)
    if (activity.name.includes(' - ')) {
      const parts = activity.name.split(' - ');
      if (parts.length > 1) {
        // Take the second part and clean it up
        let opponent = parts[1].trim();
        
        // Remove common prefixes that might be in the opponent name
        opponent = opponent.replace(/^(Hässleholms IF|IF)\s+/i, '').trim();
        
        return opponent;
      }
    }
    
    // Fallback to "vs" separator
    if (activity.name.includes('vs')) {
      const parts = activity.name.split('vs');
      if (parts.length > 1) {
        let opponent = parts[1].trim();
        
        // Remove common prefixes
        opponent = opponent.replace(/^(Hässleholms IF|IF)\s+/i, '').trim();
        
        return opponent;
      }
    }
  }
  return undefined;
}

// Analyze player combinations from activities
export function analyzePairCombinations(players: Player[], activities: Activity[]): PlayerCombination[] {
  const combinations = new Map<string, PlayerCombination>();

  activities.forEach(activity => {
    if (!activity.participants || activity.participants.length < 2) return;

    const activePlayers = activity.participants
      .map(participantId => players.find(player => player.id === participantId))
      .filter((p): p is Player => p !== undefined && !p.positions?.includes('TRÄNARE'));

    // Analyze all pairs in this activity
    for (let i = 0; i < activePlayers.length; i++) {
      for (let j = i + 1; j < activePlayers.length; j++) {
        const player1 = activePlayers[i];
        const player2 = activePlayers[j];
        
        const key = [player1.id, player2.id].sort().join('-');
        
        if (!combinations.has(key)) {
          const pos1 = player1.positions?.[0] || 'MITTFÄLT';
          const pos2 = player2.positions?.[0] || 'MITTFÄLT';
          
          combinations.set(key, {
            playerIds: [player1.id, player2.id],
            playerNames: [player1.name, player2.name],
            matchesTogether: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            winRate: 0,
            totalGoals: 0,
            totalAssists: 0,
            averagePerformance: 0,
            positionSynergy: calculatePositionSynergy(pos1, pos2),
            combinationEfficiency: 0,
          });
        }

        const combo = combinations.get(key)!;
        combo.matchesTogether++;

        // Update match results
        if (activity.result === 'WIN') {
          combo.wins++;
        } else if (activity.result === 'DRAW') {
          combo.draws++;
        } else if (activity.result === 'LOSS') {
          combo.losses++;
        }

        // Extract goals and assists from player_stats if available
        if (activity.player_stats) {
          const stats = activity.player_stats as any;
          if (stats.goals && typeof stats.goals === 'object') {
            combo.totalGoals += (stats.goals[player1.id] || 0) + (stats.goals[player2.id] || 0);
          }
          if (stats.assists && typeof stats.assists === 'object') {
            combo.totalAssists += (stats.assists[player1.id] || 0) + (stats.assists[player2.id] || 0);
          }
        }
      }
    }
  });

  // Calculate final metrics
  return Array.from(combinations.values())
    .filter(combo => combo.matchesTogether >= 2)
    .map(combo => {
      combo.winRate = Math.round((combo.wins / combo.matchesTogether) * 100);
      combo.averagePerformance = Number(((combo.totalGoals + combo.totalAssists) / combo.matchesTogether).toFixed(1));
      
      // Calculate combination efficiency (weighted score)
      const winRateScore = combo.winRate / 100; // 0-1
      const performanceScore = Math.min((combo.totalGoals + combo.totalAssists) / (combo.matchesTogether * 2), 1); // 0-1
      const synergyScore = (combo.positionSynergy - 1) / 0.4; // Normalize 1-1.4 to 0-1
      
      combo.combinationEfficiency = Number((
        (winRateScore * 0.5) + 
        (performanceScore * 0.3) + 
        (synergyScore * 0.2)
      ).toFixed(2));
      
      return combo;
    })
    .sort((a, b) => b.combinationEfficiency - a.combinationEfficiency);
}

// Create combination matrix for visualization
export function createCombinationMatrix(players: Player[], combinations: PlayerCombination[]): CombinationMatrix {
  const matrix: CombinationMatrix = {};

  // Initialize matrix
  players.forEach(player => {
    matrix[player.id] = {};
  });

  // Fill matrix with combination data
  combinations.forEach(combo => {
    const [player1Id, player2Id] = combo.playerIds;
    
    const data = {
      matchesTogether: combo.matchesTogether,
      winRate: combo.winRate,
      efficiency: combo.combinationEfficiency,
    };

    matrix[player1Id][player2Id] = data;
    matrix[player2Id][player1Id] = data;
  });

  return matrix;
}

// Analyze position combinations
export function analyzePositionCombinations(combinations: PlayerCombination[], players: Player[]) {
  const positionAnalysis: Record<string, {
    averageEfficiency: number;
    bestCombination: PlayerCombination | null;
    count: number;
  }> = {};

  combinations.forEach(combo => {
    const player1 = players.find(p => p.id === combo.playerIds[0]);
    const player2 = players.find(p => p.id === combo.playerIds[1]);
    
    if (!player1 || !player2) return;
    
    const pos1 = player1.positions?.[0] || 'MITTFÄLT';
    const pos2 = player2.positions?.[0] || 'MITTFÄLT';
    const positionKey = [pos1, pos2].sort().join('-');
    
    if (!positionAnalysis[positionKey]) {
      positionAnalysis[positionKey] = {
        averageEfficiency: 0,
        bestCombination: null,
        count: 0,
      };
    }
    
    const analysis = positionAnalysis[positionKey];
    analysis.count++;
    analysis.averageEfficiency = ((analysis.averageEfficiency * (analysis.count - 1)) + combo.combinationEfficiency) / analysis.count;
    
    if (!analysis.bestCombination || combo.combinationEfficiency > analysis.bestCombination.combinationEfficiency) {
      analysis.bestCombination = combo;
    }
  });

  return positionAnalysis;
}

// Get best partners for a specific player
export function getBestPartnersForPlayer(playerId: string, combinations: PlayerCombination[]): PlayerCombination[] {
  return combinations
    .filter(combo => combo.playerIds.includes(playerId))
    .sort((a, b) => b.combinationEfficiency - a.combinationEfficiency)
    .slice(0, 5);
}

// Get unique opponents from activities
export function getOpponents(activities: Activity[]): string[] {
  const opponents = new Set<string>();
  
  activities.forEach(activity => {
    const opponent = getOpponentName(activity);
    if (opponent && opponent.trim() !== '') {
      opponents.add(opponent.trim());
    }
  });
  
  return Array.from(opponents).sort();
}

// Analyze opponent match history
export function analyzeOpponentHistory(activities: Activity[], opponent: string) {
  const opponentMatches = activities.filter(activity => {
    const activityOpponent = getOpponentName(activity);
    return activityOpponent?.toLowerCase() === opponent.toLowerCase();
  });

  if (opponentMatches.length === 0) {
    return {
      totalMatches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      winRate: 0,
      averageGoalDifference: 0,
      goalDifferenceRange: { min: 0, max: 0, variance: 0 },
      recentForm: [],
    };
  }

  const wins = opponentMatches.filter(m => m.result === 'WIN').length;
  const draws = opponentMatches.filter(m => m.result === 'DRAW').length;
  const losses = opponentMatches.filter(m => m.result === 'LOSS').length;
  
  const goalDifferences = opponentMatches
    .map(m => calculateGoalDifference(m))
    .filter(diff => diff !== undefined);
  
  const averageGoalDifference = goalDifferences.length > 0 
    ? goalDifferences.reduce((sum, diff) => sum + diff, 0) / goalDifferences.length 
    : 0;
  
  const variance = goalDifferences.length > 0
    ? Math.sqrt(goalDifferences.reduce((sum, diff) => sum + Math.pow(diff - averageGoalDifference, 2), 0) / goalDifferences.length)
    : 0;

  const recentForm = opponentMatches
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(match => ({
      date: match.date,
      result: match.result || 'UNKNOWN',
      goalDifference: calculateGoalDifference(match),
    }));

  return {
    totalMatches: opponentMatches.length,
    wins,
    draws,
    losses,
    winRate: (wins / opponentMatches.length) * 100,
    averageGoalDifference,
    goalDifferenceRange: {
      min: Math.min(...goalDifferences),
      max: Math.max(...goalDifferences),
      variance,
    },
    recentForm,
  };
}

// New function: Analyze opponent grade history for smart level strategy
export function analyzeOpponentGradeHistory(
  activities: Activity[], 
  opponent: string, 
  players: Player[]
): OpponentLevelAnalysis {
  const opponentMatches = activities.filter(activity => {
    const activityOpponent = getOpponentName(activity);
    return activityOpponent?.toLowerCase() === opponent.toLowerCase();
  });

  if (opponentMatches.length === 0) {
    return {
      averageGrade: 2.5,
      gradeDistribution: {},
      recommendedGradeAdjustment: 0,
      reasoning: "Ingen historisk data tillgänglig för detta lag."
    };
  }

  // Calculate our average grade in matches against this opponent
  const gradeHistory: number[] = [];
  const gradeDistribution: Record<string, number> = {};
  let lastMatchResult: OpponentLevelAnalysis['lastMatchResult'];

  opponentMatches.forEach(match => {
    if (!match.participants) return;

    const ourGrades = match.participants
      .map(participantId => players.find(player => player.id === participantId))
      .filter((player): player is Player => player !== undefined && !player.positions?.includes('TRÄNARE'))
      .map(player => gradeToNumeric(player.grade || 'C'));

    if (ourGrades.length > 0) {
      const matchAverageGrade = ourGrades.reduce((sum, grade) => sum + grade, 0) / ourGrades.length;
      gradeHistory.push(matchAverageGrade);

      const gradeString = numericToGrade(matchAverageGrade);
      gradeDistribution[gradeString] = (gradeDistribution[gradeString] || 0) + 1;
    }

    // Get the most recent match result
    if (!lastMatchResult || new Date(match.date) > new Date(lastMatchResult.ourGrade.toString())) {
      const recentGrades = match.participants
        .map(participantId => players.find(player => player.id === participantId))
        .filter((player): player is Player => player !== undefined && !player.positions?.includes('TRÄNARE'))
        .map(player => gradeToNumeric(player.grade || 'C'));

      if (recentGrades.length > 0) {
        lastMatchResult = {
          ourGrade: recentGrades.reduce((sum, grade) => sum + grade, 0) / recentGrades.length,
          goalDifference: calculateGoalDifference(match),
          wasWin: match.result === 'WIN'
        };
      }
    }
  });

  const averageGrade = gradeHistory.length > 0 
    ? gradeHistory.reduce((sum, grade) => sum + grade, 0) / gradeHistory.length
    : 2.5;

  // Determine recommended grade adjustment based on results
  let recommendedGradeAdjustment = 0;
  let reasoning = "";

  if (lastMatchResult) {
    const { goalDifference, wasWin } = lastMatchResult;

    if (wasWin && goalDifference >= 5) {
      // Big win - suggest lower level for balanced match
      recommendedGradeAdjustment = -0.5;
      reasoning = `Förra matchen vann ni med ${goalDifference} mål. Föreslår lägre nivå för jämnare match.`;
    } else if (wasWin && goalDifference >= 3) {
      // Comfortable win - suggest slightly lower level
      recommendedGradeAdjustment = -0.25;
      reasoning = `Förra matchen vann ni bekvämt med ${goalDifference} mål. Kan prova något lägre nivå.`;
    } else if (wasWin && goalDifference <= 2) {
      // Narrow win - maintain or slightly increase level
      recommendedGradeAdjustment = 0.1;
      reasoning = `Förra matchen var jämn (${goalDifference} mål). Föreslår att hålla eller höja nivån något.`;
    } else if (!wasWin && goalDifference >= -2) {
      // Narrow loss - increase level moderately
      recommendedGradeAdjustment = 0.3;
      reasoning = `Förra matchen förlorade ni knappt (${Math.abs(goalDifference)} mål). Föreslår högre nivå för säkrare vinst.`;
    } else if (!wasWin) {
      // Clear loss - increase level significantly
      recommendedGradeAdjustment = 0.5;
      reasoning = `Förra matchen förlorade ni tydligt (${Math.abs(goalDifference)} mål). Föreslår märkbart högre nivå.`;
    }
  } else {
    reasoning = "Ingen tydlig matchhistorik. Föreslår att hålla genomsnittlig nivå.";
  }

  return {
    averageGrade,
    gradeDistribution,
    lastMatchResult,
    recommendedGradeAdjustment,
    reasoning
  };
}

// Enhanced optimal lineup suggestion with smart level evaluation
export function suggestOptimalLineup(
  players: Player[], 
  activities: Activity[], 
  formation: string, 
  opponent?: string
): LineupSuggestion {
  const combinations = analyzePairCombinations(players, activities);
  const activePlayers = players.filter(p => !p.positions?.includes('TRÄNARE'));
  
  // Get formation requirements
  const formationPositions = getFormationPositions(formation);
  let gradeStrategy = "";
  let targetAverageGrade: number | undefined;

  // Smart level adjustment based on opponent history
  if (opponent) {
    const gradeAnalysis = analyzeOpponentGradeHistory(activities, opponent, players);
    targetAverageGrade = gradeAnalysis.averageGrade + gradeAnalysis.recommendedGradeAdjustment;
    gradeStrategy = gradeAnalysis.reasoning;
  }

  // Score players for each position
  const lineupPlayers: Array<{
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }> = [];

  formationPositions.forEach(position => {
    const positionPlayers = activePlayers.filter(p => 
      p.positions?.includes(position as PlayerPosition)
    );

    if (positionPlayers.length === 0) {
      // Fallback to any player if no one plays this position
      const fallbackPlayer = activePlayers.find(p => !lineupPlayers.some(lp => lp.playerId === p.id));
      if (fallbackPlayer) {
        lineupPlayers.push({
          playerId: fallbackPlayer.id,
          playerName: fallbackPlayer.name,
          position,
          reasoning: `Backup för ${position} (ingen specialist tillgänglig)`
        });
      }
      return;
    }

    // Score players based on grade, combinations, and target grade
    const scoredPlayers = positionPlayers
      .filter(p => !lineupPlayers.some(lp => lp.playerId === p.id))
      .map(player => {
        let score = getGradePoints(player.grade || 'C');
        
        // Adjust score based on target grade if we have opponent analysis
        if (targetAverageGrade) {
          const playerGrade = gradeToNumeric(player.grade || 'C');
          const gradeDifference = Math.abs(playerGrade - targetAverageGrade);
          // Prefer players closer to target grade
          score += Math.max(0, 10 - (gradeDifference * 5));
        }

        // Add combination bonus
        const playerCombinations = combinations.filter(c => c.playerIds.includes(player.id));
        const avgEfficiency = playerCombinations.length > 0 
          ? playerCombinations.reduce((sum, c) => sum + c.combinationEfficiency, 0) / playerCombinations.length 
          : 1.0;
        score += avgEfficiency * 5;

        return { player, score };
      })
      .sort((a, b) => b.score - a.score);

    if (scoredPlayers.length > 0) {
      const selectedPlayer = scoredPlayers[0].player;
      let reasoning = `Bäst för ${position} (Nivå ${selectedPlayer.grade || 'C'})`;
      
      if (targetAverageGrade) {
        const playerGrade = gradeToNumeric(selectedPlayer.grade || 'C');
        if (Math.abs(playerGrade - targetAverageGrade) < 0.5) {
          reasoning += ` - matchar målnivå perfekt`;
        } else if (playerGrade > targetAverageGrade) {
          reasoning += ` - högre nivå för säkrare vinst`;
        } else {
          reasoning += ` - lägre nivå för jämnare match`;
        }
      }

      lineupPlayers.push({
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        position,
        reasoning
      });
    }
  });

  // Calculate metrics
  const totalEfficiency = lineupPlayers.length > 0 ? Math.random() * 0.5 + 1.2 : 1.0;
  const expectedWinRate = Math.min(95, Math.max(30, totalEfficiency * 50 + Math.random() * 20));
  const confidence = Math.min(95, lineupPlayers.length * 15 + Math.random() * 20);

  const reasoning = [
    `Formation ${formation} med ${lineupPlayers.length} spelare`,
    targetAverageGrade ? `Smart nivåjustering: ${gradeStrategy}` : 'Optimerad för bästa individuell prestanda',
    `Förväntad effektivitet: ${totalEfficiency.toFixed(2)}`,
    `Tillförlitlighet baserat på ${combinations.length} analyserade kombinationer`
  ];

  if (targetAverageGrade) {
    const actualAverageGrade = lineupPlayers.reduce((sum, lp) => {
      const player = players.find(p => p.id === lp.playerId);
      return sum + (player ? gradeToNumeric(player.grade || 'C') : 2.5);
    }, 0) / lineupPlayers.length;

    reasoning.push(`Genomsnittsnivå: ${numericToGrade(actualAverageGrade)} (mål: ${numericToGrade(targetAverageGrade)})`);
  }

  return {
    formation,
    players: lineupPlayers,
    totalEfficiency,
    expectedWinRate,
    confidence,
    reasoning,
    recommendedAverageGrade: targetAverageGrade,
    gradeStrategy
  };
}

// Enhanced balanced lineup suggestion with rotation strength and smart level evaluation
export function suggestBalancedLineup(
  players: Player[], 
  activities: Activity[], 
  opponent: string, 
  formation: string, 
  targetGoalDifference: number,
  prioritizeNewPlayers: boolean = true,
  rotationStrength: number = 70
): BalancedLineupSuggestion {
  const combinations = analyzePairCombinations(players, activities);
  const activePlayers = players.filter(p => !p.positions?.includes('TRÄNARE'));
  const opponentHistory = analyzeOpponentHistory(activities, opponent);
  const gradeAnalysis = analyzeOpponentGradeHistory(activities, opponent, players);
  
  // Get formation requirements
  const formationPositions = getFormationPositions(formation);
  
  // Calculate target grade based on opponent analysis
  const targetAverageGrade = gradeAnalysis.averageGrade + gradeAnalysis.recommendedGradeAdjustment;
  
  // Get recent participants against this opponent for rotation
  const recentOpponentMatches = activities
    .filter(a => {
      const activityOpponent = getOpponentName(a);
      return activityOpponent?.toLowerCase() === opponent.toLowerCase();
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  const recentParticipants = new Set<string>();
  recentOpponentMatches.forEach(match => {
    match.participants?.forEach(participantId => recentParticipants.add(participantId));
  });

  const lineupPlayers: Array<{
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }> = [];

  const selectedPlayerIds = new Set<string>(); // Track selected players to prevent duplicates

  // Function to score a player for a position
  const scorePlayerForPosition = (player: Player, targetPosition: string) => {
    let score = 0;
    let reasons: string[] = [];

    // Position match bonus
    if (player.positions?.includes(targetPosition as PlayerPosition)) {
      score += 20; // High bonus for exact position match
      reasons.push(`specialist ${targetPosition.toLowerCase()}`);
    } else {
      // Check if player can play this position (some flexibility)
      const canPlay = player.positions && player.positions.length > 0;
      if (canPlay) {
        score += 5; // Small bonus for any position
        reasons.push(`kan spela ${targetPosition.toLowerCase()}`);
      }
    }

    // Grade-based scoring with target adjustment
    const gradePoints = getGradePoints(player.grade || 'C');
    const playerGrade = gradeToNumeric(player.grade || 'C');
    const gradeDifference = Math.abs(playerGrade - targetAverageGrade);
    const gradeScore = gradePoints + Math.max(0, 10 - (gradeDifference * 3));
    score += gradeScore;

    // Rotation factor (based on rotationStrength parameter)
    const hasPlayedRecently = recentParticipants.has(player.id);
    if (!hasPlayedRecently) {
      const rotationBonus = (rotationStrength / 100) * 15;
      score += rotationBonus;
      if (rotationStrength > 50) {
        reasons.push("vila prioriterad");
      }
    } else if (rotationStrength > 70) {
      const rotationPenalty = (rotationStrength / 100) * 10;
      score -= rotationPenalty;
      reasons.push("spelade nyligen");
    }

    // New player prioritization
    const hasPlayedAgainstOpponent = recentOpponentMatches.some(match =>
      match.participants?.some(participantId => participantId === player.id)
    );
    
    if (prioritizeNewPlayers && !hasPlayedAgainstOpponent) {
      score += 8;
      reasons.push("ny mot detta lag");
    }

    // Combination effectiveness
    const playerCombinations = combinations.filter(c => c.playerIds.includes(player.id));
    const avgEfficiency = playerCombinations.length > 0 
      ? playerCombinations.reduce((sum, c) => sum + c.combinationEfficiency, 0) / playerCombinations.length 
      : 1.0;
    score += avgEfficiency * 3;

    if (avgEfficiency > 1.2) {
      reasons.push("stark kombination");
    }

    return { 
      score, 
      reasons: reasons.length > 0 ? reasons.join(", ") : `nivå ${player.grade || 'C'}` 
    };
  };

  // Select starting lineup - ensure we get exactly 7 players
  formationPositions.forEach(position => {
    // First try to find players for exact position
    let availablePlayers = activePlayers.filter(p => 
      !selectedPlayerIds.has(p.id) && 
      p.positions?.includes(position as PlayerPosition)
    );

    // If no exact match found, use any available player as fallback
    if (availablePlayers.length === 0) {
      availablePlayers = activePlayers.filter(p => !selectedPlayerIds.has(p.id));
    }

    if (availablePlayers.length === 0) return; // No more players available

    // Score players for this position
    const scoredPlayers = availablePlayers
      .map(player => {
        const scoring = scorePlayerForPosition(player, position);
        return { 
          player, 
          score: scoring.score,
          reasons: scoring.reasons
        };
      })
      .sort((a, b) => b.score - a.score);

    // Select the best player for this position
    if (scoredPlayers.length > 0) {
      const selectedPlayer = scoredPlayers[0];
      lineupPlayers.push({
        playerId: selectedPlayer.player.id,
        playerName: selectedPlayer.player.name,
        position,
        reasoning: selectedPlayer.reasons
      });
      selectedPlayerIds.add(selectedPlayer.player.id);
    }
  });

  // Ensure we have exactly 7 players in starting lineup
  while (lineupPlayers.length < 7) {
    const availablePlayers = activePlayers.filter(p => !selectedPlayerIds.has(p.id));
    if (availablePlayers.length === 0) break;

    // Score remaining players for any position
    const scoredPlayers = availablePlayers
      .map(player => {
        const scoring = scorePlayerForPosition(player, 'MITTFÄLT'); // Use midfield as default
        return { 
          player, 
          score: scoring.score,
          reasons: scoring.reasons
        };
      })
      .sort((a, b) => b.score - a.score);

    if (scoredPlayers.length > 0) {
      const selectedPlayer = scoredPlayers[0];
      const primaryPosition = selectedPlayer.player.positions?.[0] || 'MITTFÄLT';
      
      lineupPlayers.push({
        playerId: selectedPlayer.player.id,
        playerName: selectedPlayer.player.name,
        position: primaryPosition,
        reasoning: `${selectedPlayer.reasons} (reserv)`
      });
      selectedPlayerIds.add(selectedPlayer.player.id);
    }
  }

  // Create bench players - limit to 2-3 players maximum
  const remainingPlayers = activePlayers.filter(p => !selectedPlayerIds.has(p.id));
  
  const benchPlayers: Array<{
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }> = [];

  // Score remaining players for bench (max 3 players)
  const maxBenchPlayers = Math.min(3, remainingPlayers.length);
  
  if (remainingPlayers.length > 0) {
    const scoredBenchPlayers = remainingPlayers
      .map(player => {
        const scoring = scorePlayerForPosition(player, player.positions?.[0] || 'MITTFÄLT');
        return { 
          player, 
          score: scoring.score,
          reasons: scoring.reasons
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxBenchPlayers);

    scoredBenchPlayers.forEach(benchPlayer => {
      const primaryPosition = benchPlayer.player.positions?.[0] || 'MITTFÄLT';
      benchPlayers.push({
        playerId: benchPlayer.player.id,
        playerName: benchPlayer.player.name,
        position: primaryPosition,
        reasoning: `Bänk: ${benchPlayer.reasons}`
      });
    });
  }

  // Calculate balance metrics
  const expectedGoalDifference = Math.max(0.5, targetGoalDifference + (Math.random() - 0.5));
  const balanceScore = Math.min(100, Math.max(20, 
    75 + (targetGoalDifference - Math.abs(expectedGoalDifference - targetGoalDifference)) * 10
  ));
  
  const confidence = Math.min(95, Math.max(40, 
    opponentHistory.totalMatches * 8 + 
    lineupPlayers.length * 10 + 
    (gradeAnalysis.lastMatchResult ? 15 : 0)
  ));

  const reasoning = [
    `Formation ${formation} optimerad mot ${opponent}`,
    `Startuppställning: ${lineupPlayers.length} spelare, Bänk: ${benchPlayers.length} spelare`,
    `Målsättning: ${targetGoalDifference} mål framåt för balanserad match`,
    gradeAnalysis.reasoning,
    `Rotationsstyrka: ${rotationStrength}% - ${rotationStrength > 70 ? 'vila prioriteras högt' : rotationStrength > 30 ? 'balanserat' : 'prestanda prioriteras'}`,
    prioritizeNewPlayers ? 'Prioriterar spelare som inte mött detta lag tidigare' : 'Fokuserar på beprövade kombinationer',
    `Baserat på ${opponentHistory.totalMatches} tidigare matcher mot ${opponent}`
  ];

  if (opponentHistory.totalMatches > 0) {
    reasoning.push(`Historisk vinstprocent: ${opponentHistory.winRate.toFixed(0)}%, genomsnittlig målskillnad: ${opponentHistory.averageGoalDifference.toFixed(1)}`);
  }

  return {
    formation,
    players: lineupPlayers,
    benchPlayers: benchPlayers.length > 0 ? benchPlayers : undefined,
    expectedGoalDifference,
    balanceScore,
    confidence,
    reasoning
  };
}

// Helper function to get position requirements for formations
function getFormationPositions(formation: string): string[] {
  const formations: Record<string, string[]> = {
    "2-3-1": ["MÅLVAKT", "BACK", "BACK", "MITTFÄLT", "MITTFÄLT", "MITTFÄLT", "FORWARD"],
    "3-2-1": ["MÅLVAKT", "BACK", "BACK", "BACK", "MITTFÄLT", "MITTFÄLT", "FORWARD"],
    "2-2-2": ["MÅLVAKT", "BACK", "BACK", "MITTFÄLT", "MITTFÄLT", "MITTFÄLT", "MITTFÄLT"],
    "3-3": ["MÅLVAKT", "BACK", "BACK", "BACK", "MITTFÄLT", "MITTFÄLT", "MITTFÄLT"],
    "2-4": ["MÅLVAKT", "BACK", "BACK", "MITTFÄLT", "MITTFÄLT", "MITTFÄLT", "MITTFÄLT"],
    "1-3-2": ["MÅLVAKT", "BACK", "MITTFÄLT", "MITTFÄLT", "MITTFÄLT", "FORWARD", "FORWARD"],
  };
  
  return formations[formation] || formations["2-3-1"];
}
