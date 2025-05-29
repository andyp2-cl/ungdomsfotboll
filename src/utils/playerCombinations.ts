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
