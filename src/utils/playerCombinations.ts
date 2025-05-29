import { Player, Activity } from "@/types/player";

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
}

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

// Analysera alla tvåspelar-kombinationer
export const analyzePairCombinations = (players: Player[], activities: Activity[]): PlayerCombination[] => {
  const combinations: PlayerCombination[] = [];
  const matchActivities = activities.filter(a => a.type === 'match');
  
  // Generera alla möjliga par
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const player1 = players[i];
      const player2 = players[j];
      
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
  
  players.forEach(player => {
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

// New interface for lineup suggestions
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

// Suggest optimal lineup based on formation and historical data
export const suggestOptimalLineup = (
  players: Player[], 
  activities: Activity[], 
  formation: string = "2-3-1"
): LineupSuggestion => {
  const combinations = analyzePairCombinations(players, activities);
  const matrix = createCombinationMatrix(players, combinations);
  
  // Define position requirements for different formations
  const formationRequirements: Record<string, string[]> = {
    "2-3-1": ["MV", "BACK", "BACK", "MF", "MF", "MF", "ANF"],
    "3-2-1": ["MV", "BACK", "BACK", "BACK", "MF", "MF", "ANF"],
    "2-2-2": ["MV", "BACK", "BACK", "MF", "MF", "ANF", "ANF"]
  };
  
  const requiredPositions = formationRequirements[formation] || formationRequirements["2-3-1"];
  
  // Get available players for each position
  const playersByPosition: Record<string, Player[]> = {};
  requiredPositions.forEach(pos => {
    playersByPosition[pos] = players.filter(p => 
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
      // Fallback: use any available player
      const fallbackPlayer = players.find(p => !usedPlayerIds.has(p.id) && !p.positions?.includes('TRÄNARE'));
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
      let reasoning = [];
      
      // Individual performance (basic scoring)
      const playerActivities = activities.filter(a => 
        a.type === 'match' && a.participants?.includes(player.id)
      );
      
      if (playerActivities.length > 0) {
        const wins = playerActivities.filter(a => a.isWin === true).length;
        const winRate = (wins / playerActivities.length) * 100;
        score += winRate * 0.3; // 30% weight for individual win rate
        reasoning.push(`${winRate.toFixed(0)}% vinster`);
      }
      
      // Combination potential with already selected players
      let combinationBonus = 0;
      selectedPlayers.forEach(selected => {
        const combination = matrix[player.id]?.[selected.playerId];
        if (combination && combination.matchesTogether >= 2) {
          combinationBonus += combination.efficiency * 10; // Boost for good combinations
          reasoning.push(`Bra synergi med ${selected.playerName}`);
        }
      });
      
      score += combinationBonus;
      
      // Position expertise bonus
      if (player.positions?.[0] === position) {
        score += 20; // Bonus for primary position
        reasoning.push("Primär position");
      }
      
      // Grade bonus
      const gradeBonus = { 'A': 15, 'B': 10, 'C': 5, 'D': 0 };
      score += gradeBonus[player.grade as keyof typeof gradeBonus] || 0;
      
      return {
        player,
        score,
        reasoning: reasoning.join(", ") || "Grundvärdering"
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
    `Baserat på ${pairCount} kända spelarkombinationer`
  ];
  
  if (pairCount < 5) {
    reasoning.push("⚠️ Begränsad data - förslag baserat på tillgänglig information");
  }
  
  return {
    formation,
    players: selectedPlayers,
    totalEfficiency: avgEfficiency,
    expectedWinRate: avgWinRate,
    confidence: Math.min(100, (pairCount / 10) * 100), // Confidence based on data availability
    reasoning
  };
};

// New interfaces for opponent analysis
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
  expectedGoalDifference: number;
  balanceScore: number; // 0-100, where 100 is perfect balance
  confidence: number;
  opponentAnalysis: OpponentAnalysis;
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Extract opponent names from activity names
export const getOpponents = (activities: Activity[]): string[] => {
  console.log('getOpponents called with activities:', activities.length);
  const opponents = new Set<string>();
  
  activities
    .filter(a => a.type === 'match' && a.name)
    .forEach(activity => {
      console.log('Checking activity name:', activity.name);
      // Extract opponent from activity name like "Match mot FK Finja"
      const matchPattern = /^Match mot (.+)$/i;
      const match = activity.name.match(matchPattern);
      if (match && match[1]) {
        const opponent = match[1].trim();
        console.log('Found opponent:', opponent);
        opponents.add(opponent);
      }
    });
  
  const result = Array.from(opponents).sort();
  console.log('Final opponents list:', result);
  return result;
};

// Extract opponent name from activity name
const extractOpponentFromActivity = (activity: Activity): string | null => {
  if (!activity.name) return null;
  
  const matchPattern = /^Match mot (.+)$/i;
  const match = activity.name.match(matchPattern);
  return match && match[1] ? match[1].trim() : null;
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
      // Check if we're playing at home or away based on location
      const locationName = match.location?.name || '';
      const isHome = locationName.toLowerCase().includes('hemma') || 
                     locationName.toLowerCase().includes('home') ||
                     !locationName; // Default to home if no location specified
      
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

// Suggest lineup optimized for balanced/close matches
export const suggestBalancedLineup = (
  players: Player[],
  activities: Activity[],
  opponentName: string,
  formation: string = "2-3-1",
  targetGoalDifference: number = 1 // Target narrow win
): BalancedLineupSuggestion => {
  const opponentAnalysis = analyzeOpponentHistory(activities, opponentName);
  const combinations = analyzePairCombinations(players, activities);
  const matrix = createCombinationMatrix(players, combinations);
  
  // Define position requirements
  const formationRequirements: Record<string, string[]> = {
    "2-3-1": ["MV", "BACK", "BACK", "MF", "MF", "MF", "ANF"],
    "3-2-1": ["MV", "BACK", "BACK", "BACK", "MF", "MF", "ANF"],
    "2-2-2": ["MV", "BACK", "BACK", "MF", "MF", "ANF", "ANF"]
  };
  
  const requiredPositions = formationRequirements[formation] || formationRequirements["2-3-1"];
  
  // Get players by position
  const playersByPosition: Record<string, Player[]> = {};
  requiredPositions.forEach(pos => {
    playersByPosition[pos] = players.filter(p => 
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
  
  // Balance-focused player selection
  requiredPositions.forEach(position => {
    const availablePlayers = playersByPosition[position]?.filter(p => !usedPlayerIds.has(p.id)) || [];
    
    if (availablePlayers.length === 0) {
      // Fallback player
      const fallbackPlayer = players.find(p => !usedPlayerIds.has(p.id) && !p.positions?.includes('TRÄNARE'));
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
    
    // Score players for balanced performance against this opponent
    const scoredPlayers = availablePlayers.map(player => {
      let balanceScore = 0;
      let reasoning = [];
      
      // Check historical performance against this opponent
      const playerOpponentMatches = activities.filter(a => 
        a.type === 'match' && 
        extractOpponentFromActivity(a) === opponentName && 
        a.participants?.includes(player.id)
      );
      
      if (playerOpponentMatches.length > 0) {
        // Calculate this player's impact in matches against this opponent
        let playerGoalDiffs: number[] = [];
        
        playerOpponentMatches.forEach(match => {
          if (match.homeScore !== undefined && match.awayScore !== undefined) {
            const locationName = match.location?.name || '';
            const isHome = locationName.toLowerCase().includes('hemma') || 
                           locationName.toLowerCase().includes('home') ||
                           !locationName;
            const ourScore = isHome ? match.homeScore : match.awayScore;
            const theirScore = isHome ? match.awayScore : match.homeScore;
            playerGoalDiffs.push(ourScore - theirScore);
          }
        });
        
        if (playerGoalDiffs.length > 0) {
          const avgDiff = playerGoalDiffs.reduce((sum, diff) => sum + diff, 0) / playerGoalDiffs.length;
          
          // Reward players who create balanced results (close to target)
          const balanceDeviation = Math.abs(avgDiff - targetGoalDifference);
          balanceScore += Math.max(0, 20 - (balanceDeviation * 5));
          
          reasoning.push(`Skapar jämna matcher mot ${opponentName}`);
        }
      }
      
      // Avoid extremely high performers who might cause blowouts
      const gradeModifier = { 'A': 5, 'B': 15, 'C': 10, 'D': 0 }; // B-players preferred for balance
      balanceScore += gradeModifier[player.grade as keyof typeof gradeModifier] || 0;
      
      // Combination synergy with already selected players (but weighted for balance)
      selectedPlayers.forEach(selected => {
        const combination = matrix[player.id]?.[selected.playerId];
        if (combination && combination.matchesTogether >= 2) {
          // Prefer moderate efficiency for balance
          const efficiencyBalance = Math.max(0, 10 - Math.abs(combination.efficiency - 1.2) * 10);
          balanceScore += efficiencyBalance;
        }
      });
      
      // Position expertise
      if (player.positions?.[0] === position) {
        balanceScore += 10;
        reasoning.push("Primär position");
      }
      
      return {
        player,
        balanceScore,
        reasoning: reasoning.join(", ") || "Balanserad spelare"
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
    }
  });
  
  // Calculate expected goal difference and balance score
  const expectedGoalDifference = opponentAnalysis.totalMatches > 0 
    ? Math.max(0.5, Math.min(2.5, opponentAnalysis.averageGoalDifference + 0.5)) // Slight improvement but capped
    : 1;
    
  const balanceScore = Math.max(0, 100 - (Math.abs(expectedGoalDifference - targetGoalDifference) * 30));
  
  // Determine risk level based on variance
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (opponentAnalysis.goalDifferenceRange.variance < 1) riskLevel = 'low';
  else if (opponentAnalysis.goalDifferenceRange.variance > 3) riskLevel = 'high';
  
  // Generate reasoning
  const reasoning = [
    `Optimerad för jämn vinst (${targetGoalDifference} mål) mot ${opponentName}`,
    `Historisk genomsnittlig målskillnad: ${opponentAnalysis.averageGoalDifference.toFixed(1)}`,
    `Förväntad målskillnad: ${expectedGoalDifference.toFixed(1)}`,
    `Balanspoäng: ${balanceScore.toFixed(0)}/100`,
    `Risknivå: ${riskLevel} (baserat på historisk variation)`
  ];
  
  if (opponentAnalysis.totalMatches < 3) {
    reasoning.push("⚠️ Begränsad historik - förslag baserat på allmän data");
  }
  
  return {
    formation,
    players: selectedPlayers,
    expectedGoalDifference,
    balanceScore,
    confidence: Math.min(100, (opponentAnalysis.totalMatches / 5) * 100),
    opponentAnalysis,
    reasoning,
    riskLevel
  };
};
