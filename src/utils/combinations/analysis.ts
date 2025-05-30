
import { Player, Activity, PlayerPosition } from "@/types/player";
import { PlayerCombination, CombinationMatrix } from "./types";
import { calculatePositionSynergy } from "./helpers";

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
          const pos1 = player1.positions?.[0] || 'MF';
          const pos2 = player2.positions?.[0] || 'MF';
          
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
    
    const pos1 = player1.positions?.[0] || 'MF';
    const pos2 = player2.positions?.[0] || 'MF';
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
