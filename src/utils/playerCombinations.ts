import { Player, Activity } from "@/types/player";
import { calculateDetailedPlayerActivityFrequency, generatePlayerSelectionReasoning, PlayerActivityStats } from "./playerActivityAnalysis";

// Beräkna positionssynergi mellan två spelare
const calculatePositionSynergy = (player1: Player, player2: Player): number => {
  const pos1 = player1.positions?.[0];
  const pos2 = player2.positions?.[0];
  
  if (!pos1 || !pos2) return 1.0;
  
  // Definiera synergi-poäng för olika positionskombinationer
  const synergyMap: Record<string, Record<string, number>> = {
    'MV': { 'BACK': 1.2, 'MF': 1.0, 'ANF': 0.8 },
    'BACK': { 'MV': 1.2, 'BACK': 1.1, 'MF': 1.3, 'ANF': 1.0 },
    'MF': { 'MV': 1.0, 'BACK': 1.3, 'MF': 1.2, 'ANF': 1.4 },
    'ANF': { 'MV': 0.8, 'BACK': 1.0, 'MF': 1.4, 'ANF': 1.1 }
  };
  
  return synergyMap[pos1]?.[pos2] || 1.0;
};

// Beräkna betygsynergi mellan två spelare
const calculateGradeSynergy = (player1: Player, player2: Player): number => {
  const grade1 = player1.grade;
  const grade2 = player2.grade;
  
  if (!grade1 || !grade2) return 1.0;
  
  // A-spelare fungerar bra med alla, B med B och C, etc.
  const gradeValues: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  const diff = Math.abs(gradeValues[grade1] - gradeValues[grade2]);
  
  // Mindre skillnad = bättre synergi
  return Math.max(0.7, 1.2 - (diff * 0.2));
};

// Helper function to determine if Hässleholms IF is playing at home based on activity name
const isHassleholmsPlayingHome = (activity: Activity): boolean => {
  if (!activity.name) return true; // Default to home if no name
  
  const dashPattern = /^(.+?)\s*-\s*(.+?)$/;
  const match = activity.name.match(dashPattern);
  
  if (match && match[1] && match[2]) {
    const team1 = match[1].trim();
    
    // Check if the first team is a Hässleholms IF variation
    const hassleholmsVariations = [
      'Hässleholms IF',
      'Hässleholms IF Vit',
      'Hässleholms IF Svart',
      'Hässleholms IF vit',
      'Hässleholms IF svart'
    ];
    
    return hassleholmsVariations.some(variation => 
      team1.toLowerCase().includes(variation.toLowerCase())
    );
  }
  
  return true; // Default to home if can't parse
};

// Helper function to filter out inactive players
const filterActivePlayers = (players: Player[]): Player[] => {
  return players.filter(player => {
    // If isActive is undefined, default to true (for backward compatibility)
    const isActive = player.isActive !== undefined ? player.isActive : true;
    return isActive;
  });
};

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
  combinationEfficiency: number;
  positionSynergy: number;
  averagePerformance: number;
}

export interface CombinationMatrix {
  [playerId: string]: {
    [otherPlayerId: string]: {
      efficiency: number;
      matchesTogether: number;
      winRate: number;
    };
  };
};

// Analysera alla tvåspelar-kombinationer
export const analyzePairCombinations = (players: Player[], activities: Activity[]): PlayerCombination[] => {
  // Filter out inactive players from analysis
  const activePlayers = filterActivePlayers(players);
  console.log(`Analyzing combinations with ${activePlayers.length} active players (${players.length - activePlayers.length} inactive players excluded)`);
  
  const combinations: PlayerCombination[] = [];
  const matchActivities = activities.filter(a => a.type === 'match');
  
  // Generera alla möjliga par från aktiva spelare
  for (let i = 0; i < activePlayers.length; i++) {
    for (let j = i + 1; j < activePlayers.length; j++) {
      const player1 = activePlayers[i];
      const player2 = activePlayers[j];
      
      // Skippa tränare
      if (player1.positions?.includes('TRÄNARE') || player2.positions?.includes('TRÄNARE')) {
        continue;
      }
      
      // Hitta matcher där båda spelarna deltog
      const sharedMatches = matchActivities.filter(activity => 
        activity.participants?.includes(player1.id) && 
        activity.participants?.includes(player2.id)
      );
      
      if (sharedMatches.length < 2) continue; // Kräv minst 2 matcher tillsammans
      
      let wins = 0;
      let draws = 0;
      let losses = 0;
      let totalGoals = 0;
      let totalAssists = 0;
      
      sharedMatches.forEach(match => {
        // Räkna resultat
        if (match.isWin === true) wins++;
        else if (match.isWin === false) losses++;
        else if (match.homeScore !== undefined && match.awayScore !== undefined && 
                 match.homeScore === match.awayScore) draws++;
        
        // Räkna mål och assists för båda spelarna
        if (match.player_stats?.goals) {
          totalGoals += (match.player_stats.goals[player1.id] || 0);
          totalGoals += (match.player_stats.goals[player2.id] || 0);
        }
        if (match.player_stats?.assists) {
          totalAssists += (match.player_stats.assists[player1.id] || 0);
          totalAssists += (match.player_stats.assists[player2.id] || 0);
        }
      });
      
      const winRate = sharedMatches.length > 0 ? (wins / sharedMatches.length) * 100 : 0;
      const positionSynergy = calculatePositionSynergy(player1, player2);
      const gradeSynergy = calculateGradeSynergy(player1, player2);
      
      // Beräkna kombinationseffektivitet
      const goalAssistBonus = (totalGoals + totalAssists) / sharedMatches.length;
      const combinationEfficiency = (winRate / 100) * positionSynergy * gradeSynergy * (1 + goalAssistBonus * 0.1);
      
      combinations.push({
        playerIds: [player1.id, player2.id],
        playerNames: [player1.name, player2.name],
        matchesTogether: sharedMatches.length,
        wins,
        draws,
        losses,
        winRate: Math.round(winRate),
        totalGoals,
        totalAssists,
        combinationEfficiency: Math.round(combinationEfficiency * 100) / 100,
        positionSynergy: Math.round(positionSynergy * 100) / 100,
        averagePerformance: Math.round(((totalGoals + totalAssists) / sharedMatches.length) * 100) / 100
      });
    }
  }
  
  return combinations.sort((a, b) => b.combinationEfficiency - a.combinationEfficiency);
};

// Skapa en kompatibilitetsmatris för alla spelare
export const createCombinationMatrix = (players: Player[], combinations: PlayerCombination[]): CombinationMatrix => {
  const matrix: CombinationMatrix = {};
  
  // Only include active players in the matrix
  const activePlayers = filterActivePlayers(players);
  
  activePlayers.forEach(player => {
    if (!player.positions?.includes('TRÄNARE')) {
      matrix[player.id] = {};
    }
  });
  
  combinations.forEach(combo => {
    const [player1Id, player2Id] = combo.playerIds;
    
    if (matrix[player1Id] && matrix[player2Id]) {
      matrix[player1Id][player2Id] = {
        efficiency: combo.combinationEfficiency,
        matchesTogether: combo.matchesTogether,
        winRate: combo.winRate
      };
      
      matrix[player2Id][player1Id] = {
        efficiency: combo.combinationEfficiency,
        matchesTogether: combo.matchesTogether,
        winRate: combo.winRate
      };
    }
  });
  
  return matrix;
};

// Hitta bästa kombinationer för en specifik spelare
export const getBestPartnersForPlayer = (playerId: string, combinations: PlayerCombination[]): PlayerCombination[] => {
  return combinations
    .filter(combo => combo.playerIds.includes(playerId))
    .slice(0, 5); // Top 5 partners
};

// Analysera positionsspecifika kombinationer
export const analyzePositionCombinations = (combinations: PlayerCombination[], players: Player[]) => {
  const positionStats: Record<string, {
    averageEfficiency: number;
    bestCombination: PlayerCombination | null;
    count: number;
  }> = {};
  
  combinations.forEach(combo => {
    const [player1, player2] = combo.playerIds.map(id => players.find(p => p.id === id));
    if (!player1 || !player2) return;
    
    const pos1 = player1.positions?.[0];
    const pos2 = player2.positions?.[0];
    if (!pos1 || !pos2) return;
    
    const positionKey = [pos1, pos2].sort().join('-');
    
    if (!positionStats[positionKey]) {
      positionStats[positionKey] = {
        averageEfficiency: 0,
        bestCombination: null,
        count: 0
      };
    }
    
    positionStats[positionKey].averageEfficiency = 
      (positionStats[positionKey].averageEfficiency * positionStats[positionKey].count + combo.combinationEfficiency) /
      (positionStats[positionKey].count + 1);
    
    if (!positionStats[positionKey].bestCombination || 
        combo.combinationEfficiency > positionStats[positionKey].bestCombination.combinationEfficiency) {
      positionStats[positionKey].bestCombination = combo;
    }
    
    positionStats[positionKey].count++;
  });
  
  return positionStats;
};

export interface LineupSuggestion {
  formation: string;
  players: {
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }[];
  totalEfficiency: number;
  expectedWinRate: number;
  confidence: number;
  reasoning: string[];
}

const addRandomVariation = (score: number, variationStrength: number = 0.2): number => {
  // Add random variation of ±20% by default
  const randomFactor = 1 + (Math.random() - 0.5) * 2 * variationStrength;
  return score * randomFactor;
};

// Suggest optimal lineup based on formation and historical data
export const suggestOptimalLineup = (
  players: Player[], 
  activities: Activity[], 
  formation: string = "2-3-1"
): LineupSuggestion => {
  console.log("🎯 Starting optimal lineup suggestion generation");
  
  // Filter out inactive players from lineup suggestions
  const activePlayers = filterActivePlayers(players);
  console.log(`Using ${activePlayers.length} active players for lineup (${players.length - activePlayers.length} inactive players excluded)`);
  
  const combinations = analyzePairCombinations(activePlayers, activities);
  const matrix = createCombinationMatrix(activePlayers, combinations);
  
  // Use the new detailed player activity frequency calculation
  const playerFrequency = calculateDetailedPlayerActivityFrequency(activePlayers, activities, 5);
  
  // Define position requirements for different formations
  const formationRequirements: Record<string, string[]> = {
    "2-3-1": ["MV", "BACK", "BACK", "MF", "MF", "MF", "ANF"],
    "3-2-1": ["MV", "BACK", "BACK", "BACK", "MF", "MF", "ANF"],
    "2-2-2": ["MV", "BACK", "BACK", "MF", "MF", "ANF", "ANF"]
  };
  
  const requiredPositions = formationRequirements[formation] || formationRequirements["2-3-1"];
  
  // Get active players by position
  const playersByPosition: Record<string, Player[]> = {};
  requiredPositions.forEach(pos => {
    playersByPosition[pos] = activePlayers.filter(p => 
      p.positions?.includes(pos as any) && !p.positions?.includes('TRÄNARE')
    );
  });
  
  // Simple greedy algorithm to select best lineup
  const selectedPlayers: {
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }[] = [];
  
  const usedPlayerIds = new Set<string>();
  
  requiredPositions.forEach(position => {
    const availablePlayers = playersByPosition[position]?.filter(p => !usedPlayerIds.has(p.id)) || [];
    
    if (availablePlayers.length === 0) {
      // Fallback: use any available active player
      const fallbackPlayer = activePlayers.find(p => !usedPlayerIds.has(p.id) && !p.positions?.includes('TRÄNARE'));
      if (fallbackPlayer) {
        selectedPlayers.push({
          playerId: fallbackPlayer.id,
          playerName: fallbackPlayer.name,
          position,
          reasoning: "Ingen tillgänglig specialist - använder backup"
        });
        usedPlayerIds.add(fallbackPlayer.id);
      }
      return;
    }
    
    // Score players based on individual performance and combination potential
    const scoredPlayers = availablePlayers.map(player => {
      let score = 0;
      const stats = playerFrequency[player.id];
      
      // Use the new detailed reasoning generation
      const reasoning = generatePlayerSelectionReasoning(player, stats);
      
      // Individual performance (basic scoring)
      const playerActivities = activities.filter(a => 
        a.type === 'match' && a.participants?.includes(player.id)
      );
      
      if (playerActivities.length > 0) {
        const wins = playerActivities.filter(a => a.isWin === true).length;
        const winRate = (wins / playerActivities.length) * 100;
        score += winRate * 0.3; // 30% weight for individual win rate
      }
      
      // Rotation priority based on new stats
      if (stats) {
        // Bonus for players who haven't played recently (lower rest factor = higher bonus)
        const rotationBonus = (1 - stats.restFactor) * 25; // Up to 25 points bonus
        score += rotationBonus;
        
        console.log(`📊 ${player.name} rotation analysis:`, {
          restFactor: stats.restFactor.toFixed(2),
          rotationBonus: rotationBonus.toFixed(1),
          lastPlayed: stats.lastPlayedDate,
          recentMatches: stats.recentMatches
        });
      }
      
      // Combination potential with already selected players
      let combinationBonus = 0;
      selectedPlayers.forEach(selected => {
        const combination = matrix[player.id]?.[selected.playerId];
        if (combination && combination.matchesTogether >= 2) {
          combinationBonus += combination.efficiency * 10; // Boost for good combinations
        }
      });
      
      score += combinationBonus;
      
      // Position expertise bonus
      if (player.positions?.[0] === position) {
        score += 20; // Bonus for primary position
      }
      
      // Grade bonus
      const gradeBonus = { 'A': 15, 'B': 10, 'C': 5, 'D': 0 };
      score += gradeBonus[player.grade as keyof typeof gradeBonus] || 0;
      
      return {
        player,
        score,
        reasoning
      };
    });
    
    // Select highest scoring player
    scoredPlayers.sort((a, b) => b.score - a.score);
    const bestPlayer = scoredPlayers[0];
    
    if (bestPlayer) {
      selectedPlayers.push({
        playerId: bestPlayer.player.id,
        playerName: bestPlayer.player.name,
        position,
        reasoning: bestPlayer.reasoning
      });
      usedPlayerIds.add(bestPlayer.player.id);
      
      console.log(`✅ Selected ${bestPlayer.player.name} for ${position}:`, {
        score: bestPlayer.score.toFixed(1),
        reasoning: bestPlayer.reasoning
      });
    }
  });
  
  // Calculate overall team metrics
  let totalEfficiency = 0;
  let totalWinRate = 0;
  let pairCount = 0;
  
  for (let i = 0; i < selectedPlayers.length; i++) {
    for (let j = i + 1; j < selectedPlayers.length; j++) {
      const combination = matrix[selectedPlayers[i].playerId]?.[selectedPlayers[j].playerId];
      if (combination && combination.matchesTogether >= 2) {
        totalEfficiency += combination.efficiency;
        totalWinRate += combination.winRate;
        pairCount++;
      }
    }
  }
  
  const avgEfficiency = pairCount > 0 ? totalEfficiency / pairCount : 1.0;
  const avgWinRate = pairCount > 0 ? totalWinRate / pairCount : 50;
  
  // Generate reasoning
  const reasoning = [
    `Formation ${formation} med balanserad positionsfördelning`,
    `Genomsnittlig kombinationseffektivitet: ${avgEfficiency.toFixed(2)}`,
    `Förväntad vinstprocent: ${avgWinRate.toFixed(0)}%`,
    `Baserat på ${pairCount} kända spelarkombinationer`,
    `Använder ${activePlayers.length} aktiva spelare (${players.length - activePlayers.length} inaktiva exkluderade)`
  ];
  
  if (pairCount < 5) {
    reasoning.push("⚠️ Begränsad data - förslag baserat på tillgänglig information");
  }
  
  console.log("🎯 Optimal lineup suggestion completed", {
    selectedPlayersCount: selectedPlayers.length,
    avgEfficiency,
    avgWinRate,
    confidence: Math.min(100, (pairCount / 10) * 100)
  });
  
  return {
    formation,
    players: selectedPlayers,
    totalEfficiency: avgEfficiency,
    expectedWinRate: avgWinRate,
    confidence: Math.min(100, (pairCount / 10) * 100), // Confidence based on data availability
    reasoning
  };
};

export interface OpponentAnalysis {
  opponentName: string;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  averageGoalDifference: number;
  goalDifferenceRange: {
    min: number;
    max: number;
    variance: number;
  };
  recentForm: Array<{
    date: string;
    result: 'W' | 'D' | 'L';
    goalDifference: number;
  }>;
}

export interface BalancedLineupSuggestion {
  formation: string;
  players: {
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }[];
  benchPlayers: {
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }[];
  expectedGoalDifference: number;
  balanceScore: number; // 0-100, where 100 is perfect balance
  confidence: number;
  opponentAnalysis: OpponentAnalysis;
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Extract opponent names from activity names - UPDATED TO HANDLE ACTUAL FORMAT
export const getOpponents = (activities: Activity[]): string[] => {
  console.log('getOpponents called with activities:', activities.length);
  const opponents = new Set<string>();
  
  activities
    .filter(a => a.type === 'match' && a.name)
    .forEach(activity => {
      console.log('Checking activity name:', activity.name);
      
      // Handle format like "Hässleholms IF - FK Finja" or "FK Finja - Hässleholms IF"
      const dashPattern = /^(.+?)\s*-\s*(.+?)$/;
      const match = activity.name.match(dashPattern);
      
      if (match && match[1] && match[2]) {
        const team1 = match[1].trim();
        const team2 = match[2].trim();
        
        console.log('Found teams:', team1, 'vs', team2);
        
        // Check which team is NOT Hässleholms IF (or variations)
        const hassleholmsVariations = [
          'Hässleholms IF',
          'Hässleholms IF Vit', 
          'Hässleholms IF Svart',
          'Hässleholms IF vit',
          'Hässleholms IF svart'
        ];
        
        const isTeam1Hassleholms = hassleholmsVariations.some(variation => 
          team1.toLowerCase().includes(variation.toLowerCase())
        );
        const isTeam2Hassleholms = hassleholmsVariations.some(variation => 
          team2.toLowerCase().includes(variation.toLowerCase())
        );
        
        if (isTeam1Hassleholms && !isTeam2Hassleholms) {
          console.log('Found opponent:', team2);
          opponents.add(team2);
        } else if (isTeam2Hassleholms && !isTeam1Hassleholms) {
          console.log('Found opponent:', team1);
          opponents.add(team1);
        } else if (!isTeam1Hassleholms && !isTeam2Hassleholms) {
          // Neither team contains Hässleholms IF, add both as potential opponents
          console.log('Found potential opponents:', team1, 'and', team2);
          opponents.add(team1);
          opponents.add(team2);
        }
      }
    });
  
  const result = Array.from(opponents).sort();
  console.log('Final opponents list:', result);
  return result;
};

// Extract opponent name from activity name - UPDATED TO HANDLE ACTUAL FORMAT
const extractOpponentFromActivity = (activity: Activity): string | null => {
  if (!activity.name) return null;
  
  // Handle format like "Hässleholms IF - FK Finja" or "FK Finja - Hässleholms IF"
  const dashPattern = /^(.+?)\s*-\s*(.+?)$/;
  const match = activity.name.match(dashPattern);
  
  if (match && match[1] && match[2]) {
    const team1 = match[1].trim();
    const team2 = match[2].trim();
    
    // Check which team is NOT Hässleholms IF (or variations)
    const hassleholmsVariations = [
      'Hässleholms IF',
      'Hässleholms IF Vit', 
      'Hässleholms IF Svart',
      'Hässleholms IF vit',
      'Hässleholms IF svart'
    ];
    
    const isTeam1Hassleholms = hassleholmsVariations.some(variation => 
      team1.toLowerCase().includes(variation.toLowerCase())
    );
    const isTeam2Hassleholms = hassleholmsVariations.some(variation => 
      team2.toLowerCase().includes(variation.toLowerCase())
    );
    
    if (isTeam1Hassleholms && !isTeam2Hassleholms) {
      return team2;
    } else if (isTeam2Hassleholms && !isTeam1Hassleholms) {
      return team1;
    }
  }
  
  return null;
};

// Analyze historical performance against specific opponent
export const analyzeOpponentHistory = (
  activities: Activity[], 
  opponentName: string
): OpponentAnalysis => {
  const opponentMatches = activities.filter(
    a => a.type === 'match' && extractOpponentFromActivity(a) === opponentName
  );
  
  if (opponentMatches.length === 0) {
    return {
      opponentName,
      totalMatches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      winRate: 0,
      averageGoalsFor: 0,
      averageGoalsAgainst: 0,
      averageGoalDifference: 0,
      goalDifferenceRange: { min: 0, max: 0, variance: 0 },
      recentForm: []
    };
  }
  
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let totalGoalsFor = 0;
  let totalGoalsAgainst = 0;
  const goalDifferences: number[] = [];
  const recentForm: Array<{ date: string; result: 'W' | 'D' | 'L'; goalDifference: number }> = [];
  
  opponentMatches.forEach(match => {
    if (match.homeScore !== undefined && match.awayScore !== undefined) {
      // Determine if Hässleholms IF is playing at home based on activity name
      const isHome = isHassleholmsPlayingHome(match);
      
      const ourScore = isHome ? match.homeScore : match.awayScore;
      const theirScore = isHome ? match.awayScore : match.homeScore;
      const goalDiff = ourScore - theirScore;
      
      totalGoalsFor += ourScore;
      totalGoalsAgainst += theirScore;
      goalDifferences.push(goalDiff);
      
      let result: 'W' | 'D' | 'L';
      if (goalDiff > 0) {
        wins++;
        result = 'W';
      } else if (goalDiff < 0) {
        losses++;
        result = 'L';
      } else {
        draws++;
        result = 'D';
      }
      
      recentForm.push({
        date: match.date,
        result,
        goalDifference: goalDiff
      });
    }
  });
  
  // Sort recent form by date (most recent first)
  recentForm.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate variance in goal differences
  const avgGoalDiff = goalDifferences.length > 0 
    ? goalDifferences.reduce((sum, diff) => sum + diff, 0) / goalDifferences.length 
    : 0;
    
  const variance = goalDifferences.length > 0
    ? goalDifferences.reduce((sum, diff) => sum + Math.pow(diff - avgGoalDiff, 2), 0) / goalDifferences.length
    : 0;
  
  return {
    opponentName,
    totalMatches: opponentMatches.length,
    wins,
    draws,
    losses,
    winRate: opponentMatches.length > 0 ? (wins / opponentMatches.length) * 100 : 0,
    averageGoalsFor: opponentMatches.length > 0 ? totalGoalsFor / opponentMatches.length : 0,
    averageGoalsAgainst: opponentMatches.length > 0 ? totalGoalsAgainst / opponentMatches.length : 0,
    averageGoalDifference: avgGoalDiff,
    goalDifferenceRange: {
      min: goalDifferences.length > 0 ? Math.min(...goalDifferences) : 0,
      max: goalDifferences.length > 0 ? Math.max(...goalDifferences) : 0,
      variance: Math.round(variance * 100) / 100
    },
    recentForm: recentForm.slice(0, 5) // Last 5 matches
  };
};

// DRASTICALLY ENHANCED: Suggest lineup optimized for balanced/close matches with ULTRA-STRENGTHENED rotation
export const suggestBalancedLineup = (
  players: Player[],
  activities: Activity[],
  opponentName: string,
  formation: string = "2-3-1",
  targetGoalDifference: number = 1, // Target narrow win
  prioritizeNewPlayers: boolean = false
): BalancedLineupSuggestion => {
  console.log("🎯 Starting balanced lineup suggestion generation with ULTRA-STRENGTHENED rotation logic", {
    opponentName,
    formation,
    targetGoalDifference,
    prioritizeNewPlayers
  });
  
  // Filter out inactive players from balanced lineup suggestions
  const activePlayers = filterActivePlayers(players);
  console.log(`Using ${activePlayers.length} active players for balanced lineup (${players.length - activePlayers.length} inactive players excluded)`);
  
  const opponentAnalysis = analyzeOpponentHistory(activities, opponentName);
  const combinations = analyzePairCombinations(activePlayers, activities);
  const matrix = createCombinationMatrix(activePlayers, combinations);
  
  // Use the new detailed player activity frequency calculation
  const playerFrequency = calculateDetailedPlayerActivityFrequency(activePlayers, activities, 5);
  
  // Define position requirements
  const formationRequirements: Record<string, string[]> = {
    "2-3-1": ["MV", "BACK", "BACK", "MF", "MF", "MF", "ANF"],
    "3-2-1": ["MV", "BACK", "BACK", "BACK", "MF", "MF", "ANF"],
    "2-2-2": ["MV", "BACK", "BACK", "MF", "MF", "ANF", "ANF"]
  };
  
  const requiredPositions = formationRequirements[formation] || formationRequirements["2-3-1"];
  
  // Get active players by position
  const playersByPosition: Record<string, Player[]> = {};
  requiredPositions.forEach(pos => {
    playersByPosition[pos] = activePlayers.filter(p => 
      p.positions?.includes(pos as any) && !p.positions?.includes('TRÄNARE')
    );
  });
  
  const selectedPlayers: {
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }[] = [];
  
  const usedPlayerIds = new Set<string>();
  
  // ULTRA-STRENGTHENED rotation filter and selection
  requiredPositions.forEach(position => {
    let availablePlayers = playersByPosition[position]?.filter(p => !usedPlayerIds.has(p.id)) || [];
    
    // ULTRA-HARD ROTATION FILTER: Exclude players who played 3+ of last 5 matches OR played within last 2 days
    const ultraHardRotationFilteredPlayers = availablePlayers.filter(player => {
      const stats = playerFrequency[player.id];
      if (!stats) return true; // Include if no stats available
      
      // Filter 1: Exclude if played 3 or more of the recent matches (lowered from 4)
      const tooManyRecentMatches = stats.recentMatches >= 3;
      
      // Filter 2: Exclude if played within last 2 days (FIXED date calculation)
      let playedTooRecently = false;
      if (stats.lastPlayedDate) {
        const lastPlayedDate = new Date(stats.lastPlayedDate);
        const now = new Date();
        const daysSinceLastPlayed = Math.floor((now.getTime() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24));
        playedTooRecently = daysSinceLastPlayed <= 2;
        
        console.log(`📅 CORRECTED date calculation for ${player.name}:`, {
          lastPlayedDate: stats.lastPlayedDate,
          daysSinceLastPlayed,
          playedTooRecently
        });
      }
      
      const shouldExclude = tooManyRecentMatches || playedTooRecently;
      if (shouldExclude) {
        console.log(`🚫 ULTRA-HARD ROTATION FILTER: Excluding ${player.name}`, {
          recentMatches: stats.recentMatches,
          tooManyRecentMatches,
          playedTooRecently,
          lastPlayed: stats.lastPlayedDate
        });
      }
      return !shouldExclude;
    });
    
    // Use ultra hard filtered players if we have enough, otherwise use all available
    if (ultraHardRotationFilteredPlayers.length > 0) {
      availablePlayers = ultraHardRotationFilteredPlayers;
      console.log(`✅ Using ${availablePlayers.length} ultra-rotation-filtered players for ${position}`);
    } else {
      console.log(`⚠️ Not enough ultra-rotation-filtered players for ${position}, using all ${availablePlayers.length} available`);
    }
    
    if (availablePlayers.length === 0) {
      // Fallback player
      const fallbackPlayer = activePlayers.find(p => !usedPlayerIds.has(p.id) && !p.positions?.includes('TRÄNARE'));
      if (fallbackPlayer) {
        selectedPlayers.push({
          playerId: fallbackPlayer.id,
          playerName: fallbackPlayer.name,
          position,
          reasoning: "Backup - ingen specialist tillgänglig"
        });
        usedPlayerIds.add(fallbackPlayer.id);
      }
      return;
    }
    
    // Score players with ULTRA-STRENGTHENED rotation logic
    const scoredPlayers = availablePlayers.map(player => {
      let balanceScore = 0;
      const stats = playerFrequency[player.id];
      
      // Check historical performance against this opponent
      const playerOpponentMatches = activities.filter(a => 
        a.type === 'match' && 
        extractOpponentFromActivity(a) === opponentName && 
        a.participants?.includes(player.id)
      );
      
      // ENHANCED: New player prioritization logic with goal difference consideration
      if (prioritizeNewPlayers) {
        if (playerOpponentMatches.length === 0) {
          // Bonus for new players, adjusted by target goal difference
          const newPlayerBonus = targetGoalDifference <= 1 ? 15 : 8; // Higher bonus for closer games
          balanceScore += newPlayerBonus;
        } else if (playerOpponentMatches.length <= 2) {
          balanceScore += 5;
        }
      }
      
      // ENHANCED: Target goal difference logic - favor players based on their historical performance against this opponent
      if (playerOpponentMatches.length > 0) {
        let playerGoalDiffs: number[] = [];
        
        playerOpponentMatches.forEach(match => {
          if (match.homeScore !== undefined && match.awayScore !== undefined) {
            const isHome = isHassleholmsPlayingHome(match);
            const ourScore = isHome ? match.homeScore : match.awayScore;
            const theirScore = isHome ? match.awayScore : match.homeScore;
            playerGoalDiffs.push(ourScore - theirScore);
          }
        });
        
        if (playerGoalDiffs.length > 0) {
          const avgDiff = playerGoalDiffs.reduce((sum, diff) => sum + diff, 0) / playerGoalDiffs.length;
          
          // ENHANCED: Better goal difference matching logic
          const diffFromTarget = Math.abs(avgDiff - targetGoalDifference);
          const goalDifferenceBonus = Math.max(0, 10 - (diffFromTarget * 3)); // Up to 10 points bonus
          balanceScore += goalDifferenceBonus;
          
          console.log(`🎯 Goal difference analysis for ${player.name}:`, {
            avgHistoricalDiff: avgDiff.toFixed(1),
            targetDiff: targetGoalDifference,
            diffFromTarget: diffFromTarget.toFixed(1),
            bonus: goalDifferenceBonus.toFixed(1)
          });
        }
      }
      
      // ULTRA-STRENGTHENED rotation logic using new detailed stats
      if (stats) {
        // ULTRA-MASSIVE penalty for recent play: Scale from +60 points (completely rested) to -120 points (played very recently)
        // This is now the ABSOLUTELY DOMINANT factor in selection
        const rotationScore = (1 - stats.restFactor) * 120 - 60; // Range: +60 to -120
        balanceScore += rotationScore;
        
        console.log(`🔄 ${player.name} ULTRA-STRENGTHENED rotation analysis:`, {
          restFactor: stats.restFactor.toFixed(2),
          rotationScore: rotationScore.toFixed(1),
          lastPlayed: stats.lastPlayedDate,
          recentMatches: stats.recentMatches,
          currentBalanceScore: balanceScore.toFixed(1)
        });
        
        // ENHANCED: Additional massive penalty for players who played very recently (corrected calculation)
        if (stats.lastPlayedDate) {
          const lastPlayedDate = new Date(stats.lastPlayedDate);
          const now = new Date();
          const daysSinceLastPlayed = Math.floor((now.getTime() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastPlayed <= 0) {
            balanceScore -= 100; // Massive penalty for playing today
            console.log(`❌ ULTRA RECENT PLAY PENALTY: ${player.name} played today - penalty: -100`);
          } else if (daysSinceLastPlayed <= 1) {
            balanceScore -= 80; // Massive penalty for playing yesterday
            console.log(`❌ ULTRA RECENT PLAY PENALTY: ${player.name} played ${daysSinceLastPlayed} day ago - penalty: -80`);
          } else if (daysSinceLastPlayed <= 2) {
            balanceScore -= 50; // Large penalty for playing within 2 days
            console.log(`⚠️ RECENT PLAY PENALTY: ${player.name} played ${daysSinceLastPlayed} days ago - penalty: -50`);
          } else if (daysSinceLastPlayed <= 4) {
            balanceScore -= 20; // Medium penalty for playing within 4 days
            console.log(`⚠️ RECENT PLAY PENALTY: ${player.name} played ${daysSinceLastPlayed} days ago - penalty: -20`);
          }
        }
      }
      
      // DRASTICALLY REDUCED grade modifiers to let rotation dominate completely
      const gradeModifier = { 'A': 2, 'B': 3, 'C': 2, 'D': 1 }; // Minimal impact
      balanceScore += gradeModifier[player.grade as keyof typeof gradeModifier] || 0;
      
      // DRASTICALLY REDUCED combination synergy to let rotation dominate completely
      selectedPlayers.forEach(selected => {
        const combination = matrix[player.id]?.[selected.playerId];
        if (combination && combination.matchesTogether >= 2) {
          // Tiny efficiency balance bonus
          const efficiencyBalance = Math.max(0, 1 - Math.abs(combination.efficiency - 1.2) * 1); // Minimal impact
          balanceScore += efficiencyBalance;
        }
      });
      
      // Position expertise - minimal importance
      if (player.positions?.[0] === position) {
        balanceScore += 2; // Minimal bonus
      }
      
      // Generate reasoning using new detailed stats
      const reasoning = generatePlayerSelectionReasoning(player, stats, prioritizeNewPlayers);
      
      // NO randomization to make rotation completely predictable
      const finalScore = balanceScore;
      
      return {
        player,
        balanceScore: finalScore,
        reasoning,
        rotationInfo: stats ? {
          restFactor: stats.restFactor,
          recentMatches: stats.recentMatches,
          lastPlayed: stats.lastPlayedDate
        } : null
      };
    });
    
    // Select highest balance-scoring player
    scoredPlayers.sort((a, b) => b.balanceScore - a.balanceScore);
    const bestPlayer = scoredPlayers[0];
    
    if (bestPlayer) {
      selectedPlayers.push({
        playerId: bestPlayer.player.id,
        playerName: bestPlayer.player.name,
        position,
        reasoning: bestPlayer.reasoning
      });
      usedPlayerIds.add(bestPlayer.player.id);
      
      console.log(`✅ Selected ${bestPlayer.player.name} for balanced ${position}:`, {
        balanceScore: bestPlayer.balanceScore.toFixed(1),
        rotationInfo: bestPlayer.rotationInfo,
        reasoning: bestPlayer.reasoning
      });
      
      // Log critical warning if a recently played player was selected despite ultra-strengthened rotation logic
      if (bestPlayer.rotationInfo && bestPlayer.rotationInfo.recentMatches >= 2) {
        console.error(`🚨 CRITICAL WARNING: Selected recently played player ${bestPlayer.player.name} (${bestPlayer.rotationInfo.recentMatches} recent matches) - ROTATION LOGIC MAY BE FAILING`);
      }
    }
  });

  // Select bench players with ULTRA-STRENGTHENED rotation and variation
  const benchPlayers: {
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }[] = [];

  // Get available active players for bench (no goalkeepers, not already selected)
  let availableBenchPlayers = activePlayers.filter(p => 
    !usedPlayerIds.has(p.id) && 
    !p.positions?.includes('TRÄNARE') &&
    !p.positions?.includes('MV') // No goalkeepers on bench
  );

  // ULTRA-HARD ROTATION FILTER for bench players too
  const ultraHardRotationFilteredBench = availableBenchPlayers.filter(player => {
    const stats = playerFrequency[player.id];
    if (!stats) return true;
    
    const tooManyMatches = stats.recentMatches >= 3;
    let playedTooRecently = false;
    
    if (stats.lastPlayedDate) {
      const lastPlayedDate = new Date(stats.lastPlayedDate);
      const now = new Date();
      const daysSinceLastPlayed = Math.floor((now.getTime() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24));
      playedTooRecently = daysSinceLastPlayed <= 2;
    }
    
    const shouldExclude = tooManyMatches || playedTooRecently;
    if (shouldExclude) {
      console.log(`🚫 ULTRA-HARD ROTATION FILTER (BENCH): Excluding ${player.name}`);
    }
    return !shouldExclude;
  });

  // Use ultra hard filtered players if available
  if (ultraHardRotationFilteredBench.length > 0) {
    availableBenchPlayers = ultraHardRotationFilteredBench;
    console.log(`✅ Using ${availableBenchPlayers.length} ultra-rotation-filtered bench players`);
  }

  // Score bench players with ULTRA-STRENGTHENED rotation logic
  const scoredBenchPlayers = availableBenchPlayers.map(player => {
    let benchScore = 0;
    const stats = playerFrequency[player.id];

    // Check historical performance against this opponent
    const playerOpponentMatches = activities.filter(a => 
      a.type === 'match' && 
      extractOpponentFromActivity(a) === opponentName && 
      a.participants?.includes(player.id)
    );

    // New player prioritization logic for bench
    if (prioritizeNewPlayers) {
      if (playerOpponentMatches.length === 0) {
        const newPlayerBonus = targetGoalDifference <= 1 ? 12 : 6;
        benchScore += newPlayerBonus;
      }
    }

    // ULTRA-STRENGTHENED rotation logic for bench using new detailed stats
    if (stats) {
      // Same ultra massive rotation logic as starters
      const rotationScore = (1 - stats.restFactor) * 100 - 50; // Range: +50 to -100
      benchScore += rotationScore;
      
      // Additional recent play penalty for bench (corrected calculation)
      if (stats.lastPlayedDate) {
        const lastPlayedDate = new Date(stats.lastPlayedDate);
        const now = new Date();
        const daysSinceLastPlayed = Math.floor((now.getTime() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastPlayed <= 0) {
          benchScore -= 80; // Massive penalty for playing today
        } else if (daysSinceLastPlayed <= 1) {
          benchScore -= 60; // Massive penalty for recent play
        } else if (daysSinceLastPlayed <= 2) {
          benchScore -= 30; // Large penalty
        }
      }
    }

    // Minimal other factors
    const positionCount = player.positions?.filter(pos => pos !== 'TRÄNARE').length || 1;
    if (positionCount > 1) {
      benchScore += 2; // Minimal versatility bonus
    }

    const gradeBonus = { 'A': 1, 'B': 2, 'C': 1, 'D': 1 }; // Minimal values
    benchScore += gradeBonus[player.grade as keyof typeof gradeBonus] || 0;

    // Minimal combination potential with selected players
    let combinationBonus = 0;
    selectedPlayers.forEach(selected => {
      const combination = matrix[player.id]?.[selected.playerId];
      if (combination && combination.matchesTogether >= 2) {
        combinationBonus += combination.efficiency * 0.5; // Minimal impact
      }
    });
    benchScore += combinationBonus;

    // Generate reasoning using new detailed stats
    const reasoning = generatePlayerSelectionReasoning(player, stats, prioritizeNewPlayers);

    return {
      player,
      benchScore,
      reasoning
    };
  });

  // Select top 2 bench players
  scoredBenchPlayers.sort((a, b) => b.benchScore - a.benchScore);
  for (let i = 0; i < Math.min(2, scoredBenchPlayers.length); i++) {
    const benchPlayer = scoredBenchPlayers[i];
    benchPlayers.push({
      playerId: benchPlayer.player.id,
      playerName: benchPlayer.player.name,
      position: benchPlayer.player.positions?.[0] || "OKÄND",
      reasoning: benchPlayer.reasoning
    });
  }
  
  // Calculate expected goal difference and balance score
  const expectedGoalDifference = opponentAnalysis.totalMatches > 0 
    ? Math.max(0.5, Math.min(2.5, opponentAnalysis.averageGoalDifference + 0.5)) // Slight improvement but capped
    : targetGoalDifference; // Use target if no history
    
  const balanceScore = Math.max(0, 100 - (Math.abs(expectedGoalDifference - targetGoalDifference) * 30));
  
  // Determine risk level based on variance
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (opponentAnalysis.goalDifferenceRange.variance < 1) riskLevel = 'low';
  else if (opponentAnalysis.goalDifferenceRange.variance > 3) riskLevel = 'high';
  
  // Generate reasoning with ULTRA-ENHANCED rotation info and inactive player info
  const reasoning = [
    `🔄 ULTRA-FÖRSTÄRKT ROTATION: Spelare som spelat nyligen får drastiskt sänkt prioritet (-120 poäng)`,
    `🚫 Spelare med 3+ matcher eller inom 2 dagar exkluderades helt`,
    `🎯 Optimerad för målskillnad ${targetGoalDifference} mål mot ${opponentName}`,
    `📊 Historisk genomsnittlig målskillnad: ${opponentAnalysis.averageGoalDifference.toFixed(1)}`,
    `📈 Förväntad målskillnad: ${expectedGoalDifference.toFixed(1)}`,
    `⚖️ Balanspoäng: ${balanceScore.toFixed(0)}/100`,
    `⚠️ Risknivå: ${riskLevel} (baserat på historisk variation)`,
    `👥 Inkluderar ${benchPlayers.length} bänkspelare (ej målvakter)`,
    `✅ Använder ${activePlayers.length} aktiva spelare (${players.length - activePlayers.length} inaktiva exkluderade)`
  ];
  
  // Count rotated players (those with low recent activity)
  const rotatedPlayersCount = selectedPlayers.filter(p => {
    const freq = playerFrequency[p.playerId];
    return freq && freq.recentMatches <= 1;
  }).length;
  
  if (rotatedPlayersCount > 0) {
    reasoning.push(`✅ ${rotatedPlayersCount} spelare får chans efter vila (ultra-förstärkt rotationslogik)`);
  }
  
  // Count players who played very recently - this should be ZERO now
  const recentPlayersCount = selectedPlayers.filter(p => {
    const freq = playerFrequency[p.playerId];
    return freq && freq.recentMatches >= 3;
  }).length;
  
  if (recentPlayersCount > 0) {
    reasoning.push(`🚨 KRITISK VARNING: ${recentPlayersCount} spelare spelade nyligen trots ultra-förstärkt rotation - SYSTEMFEL`);
  }
  
  // Count players excluded by ultra hard rotation filter
  const excludedByRotationCount = activePlayers.filter(p => {
    const stats = playerFrequency[p.id];
    if (!stats || p.positions?.includes('TRÄNARE')) return false;
    
    const tooManyMatches = stats.recentMatches >= 3;
    let playedTooRecently = false;
    
    if (stats.lastPlayedDate) {
      const lastPlayedDate = new Date(stats.lastPlayedDate);
      const now = new Date();
      const daysSinceLastPlayed = Math.floor((now.getTime() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24));
      playedTooRecently = daysSinceLastPlayed <= 2;
    }
    
    return tooManyMatches || playedTooRecently;
  }).length;
  
  if (excludedByRotationCount > 0) {
    reasoning.push(`🚫 ${excludedByRotationCount} spelare exkluderade av ultra-hård rotationsfilter (3+ matcher eller ≤2 dagar)`);
  }
  
  if (prioritizeNewPlayers) {
    const newPlayersCount = selectedPlayers.filter(p => 
      activities.filter(a => 
        a.type === 'match' && 
        extractOpponentFromActivity(a) === opponentName && 
        a.participants?.includes(p.playerId)
      ).length === 0
    ).length;

    const newBenchCount = benchPlayers.filter(p => 
      activities.filter(a => 
        a.type === 'match' && 
        extractOpponentFromActivity(a) === opponentName && 
        a.participants?.includes(p.playerId)
      ).length === 0
    ).length;
    
    reasoning.push(`✨ ${newPlayersCount + newBenchCount} spelare får chans mot nytt lag`);
  }
  
  if (opponentAnalysis.totalMatches < 3) {
    reasoning.push("⚠️ Begränsad historik - förslag baserat på allmän data");
  }
  
  console.log("🎯 ULTRA-STRENGTHENED balanced lineup suggestion completed", {
    selectedPlayersCount: selectedPlayers.length,
    benchPlayersCount: benchPlayers.length,
    expectedGoalDifference,
    balanceScore,
    confidence: Math.min(100, (opponentAnalysis.totalMatches / 5) * 100),
    excludedByRotation: excludedByRotationCount,
    recentPlayersStillSelected: recentPlayersCount
  });
  
  return {
    formation,
    players: selectedPlayers,
    benchPlayers,
    expectedGoalDifference,
    balanceScore,
    confidence: Math.min(100, (opponentAnalysis.totalMatches / 5) * 100),
    opponentAnalysis,
    reasoning,
    riskLevel
  };
};
