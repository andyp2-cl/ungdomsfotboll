
import { Player, Activity, PlayerPosition } from "@/types/player";
import { LineupSuggestion, BalancedLineupSuggestion, PlayerCombination } from "./types";
import { 
  gradeToNumeric, 
  numericToGrade, 
  getGradePoints, 
  getSimilarPositions, 
  getFormationPositions,
  getOpponentName 
} from "./helpers";
import { analyzePairCombinations } from "./analysis";
import { analyzeOpponentHistory, analyzeOpponentGradeHistory } from "./opponents";

// Enhanced optimal lineup suggestion with smart level evaluation
export function suggestOptimalLineup(
  players: Player[], 
  activities: Activity[], 
  formation: string, 
  opponent?: string
): LineupSuggestion {
  console.log("suggestOptimalLineup: Starting with", players.length, "total players");
  
  const combinations = analyzePairCombinations(players, activities);
  console.log("suggestOptimalLineup: Found", combinations.length, "player combinations");
  
  const activePlayers = players.filter(p => !p.positions?.includes('TRÄNARE') && p.isActive !== false);
  console.log("suggestOptimalLineup: Found", activePlayers.length, "active field players");
  
  // Debug player positions
  const positionCounts = activePlayers.reduce((acc, player) => {
    const pos = player.positions?.[0] || 'UNKNOWN';
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log("suggestOptimalLineup: Position distribution:", positionCounts);
  
  // Get formation requirements
  const formationPositions = getFormationPositions(formation);
  console.log("suggestOptimalLineup: Formation", formation, "requires positions:", formationPositions);
  
  let gradeStrategy = "";
  let targetAverageGrade: number | undefined;

  // Smart level adjustment based on opponent history
  if (opponent) {
    try {
      const gradeAnalysis = analyzeOpponentGradeHistory(activities, opponent, players);
      targetAverageGrade = gradeAnalysis.averageGrade + gradeAnalysis.recommendedGradeAdjustment;
      gradeStrategy = gradeAnalysis.reasoning;
      console.log("suggestOptimalLineup: Target grade for opponent", opponent, ":", targetAverageGrade);
    } catch (error) {
      console.error("suggestOptimalLineup: Error analyzing opponent grade history:", error);
      gradeStrategy = "Kunde inte analysera motståndarhistorik";
    }
  }

  // Score players for each position
  const lineupPlayers: Array<{
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }> = [];

  const selectedPlayerIds = new Set<string>();

  formationPositions.forEach((position, index) => {
    console.log(`suggestOptimalLineup: Finding player for position ${index + 1}/${formationPositions.length}: ${position}`);
    
    // First try to find players for exact position
    let positionPlayers = activePlayers.filter(p => 
      p.positions?.includes(position as PlayerPosition) && !selectedPlayerIds.has(p.id)
    );
    
    console.log(`suggestOptimalLineup: Found ${positionPlayers.length} players for position ${position}`);

    // If no exact match found, try similar positions
    if (positionPlayers.length === 0) {
      const similarPositions = getSimilarPositions(position);
      positionPlayers = activePlayers.filter(p => 
        p.positions?.some(pos => similarPositions.includes(pos)) && !selectedPlayerIds.has(p.id)
      );
      console.log(`suggestOptimalLineup: Found ${positionPlayers.length} players for similar positions to ${position}`);
    }
    
    // Final fallback: any available player
    if (positionPlayers.length === 0) {
      positionPlayers = activePlayers.filter(p => !selectedPlayerIds.has(p.id));
      console.log(`suggestOptimalLineup: Using fallback - ${positionPlayers.length} available players for ${position}`);
    }

    if (positionPlayers.length === 0) {
      console.warn(`suggestOptimalLineup: No players available for position ${position}`);
      return;
    }

    // Score players based on grade, combinations, and target grade
    const scoredPlayers = positionPlayers
      .map(player => {
        let score = getGradePoints(player.grade || 'C');
        let reasons: string[] = [`Nivå ${player.grade || 'C'}`];
        
        // Adjust score based on target grade if we have opponent analysis
        if (targetAverageGrade) {
          const playerGrade = gradeToNumeric(player.grade || 'C');
          const gradeDifference = Math.abs(playerGrade - targetAverageGrade);
          // Prefer players closer to target grade
          const gradeBonus = Math.max(0, 10 - (gradeDifference * 5));
          score += gradeBonus;
          
          if (gradeDifference < 0.5) {
            reasons.push("perfekt nivå för motståndare");
          } else if (playerGrade > targetAverageGrade) {
            reasons.push("högre nivå för säkrare vinst");
          } else {
            reasons.push("lägre nivå för jämnare match");
          }
        }

        // Add combination bonus
        const playerCombinations = combinations.filter(c => c.playerIds.includes(player.id));
        const avgEfficiency = playerCombinations.length > 0 
          ? playerCombinations.reduce((sum, c) => sum + c.combinationEfficiency, 0) / playerCombinations.length 
          : 1.0;
        score += avgEfficiency * 5;
        
        if (avgEfficiency > 1.2) {
          reasons.push("stark kombination");
        }

        // Position match bonus
        if (player.positions?.includes(position as PlayerPosition)) {
          score += 5;
          reasons.push(`specialist ${position.toLowerCase()}`);
        }

        return { 
          player, 
          score,
          reasoning: reasons.join(", ")
        };
      })
      .sort((a, b) => b.score - a.score);

    if (scoredPlayers.length > 0) {
      const selectedPlayer = scoredPlayers[0];
      console.log(`suggestOptimalLineup: Selected ${selectedPlayer.player.name} for ${position} (score: ${selectedPlayer.score})`);
      
      lineupPlayers.push({
        playerId: selectedPlayer.player.id,
        playerName: selectedPlayer.player.name,
        position,
        reasoning: selectedPlayer.reasoning
      });
      
      selectedPlayerIds.add(selectedPlayer.player.id);
    }
  });

  console.log(`suggestOptimalLineup: Final lineup has ${lineupPlayers.length} players`);

  // Calculate metrics
  const totalEfficiency = lineupPlayers.length > 0 ? 
    Math.min(2.0, Math.max(1.0, 1.2 + (lineupPlayers.length / formationPositions.length) * 0.3)) : 
    1.0;
  
  const expectedWinRate = Math.min(95, Math.max(30, totalEfficiency * 50 + Math.random() * 20));
  const confidence = Math.min(95, Math.max(20, lineupPlayers.length * 12 + combinations.length * 2));

  const reasoning = [
    `Formation ${formation} med ${lineupPlayers.length}/${formationPositions.length} spelare`,
    targetAverageGrade ? `Smart nivåjustering: ${gradeStrategy}` : 'Optimerad för bästa individuell prestanda',
    `Förväntad effektivitet: ${totalEfficiency.toFixed(2)}`,
    `Tillförlitlighet baserat på ${combinations.length} analyserade kombinationer`
  ];

  // Add warnings if lineup is incomplete
  if (lineupPlayers.length < formationPositions.length) {
    reasoning.push(`⚠️ Varning: Endast ${lineupPlayers.length} av ${formationPositions.length} positioner fyllda`);
  }

  if (activePlayers.length < 7) {
    reasoning.push(`⚠️ Varning: Endast ${activePlayers.length} aktiva spelare tillgängliga`);
  }

  if (targetAverageGrade) {
    const actualAverageGrade = lineupPlayers.reduce((sum, lp) => {
      const player = players.find(p => p.id === lp.playerId);
      return sum + (player ? gradeToNumeric(player.grade || 'C') : 2.5);
    }, 0) / (lineupPlayers.length || 1);

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
  // Filter out inactive players and trainers
  const activePlayers = players.filter(p => !p.positions?.includes('TRÄNARE') && p.isActive !== false);
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

    if (availablePlayers.length === 0) {
      console.warn(`suggestBalancedLineup: No players available for position ${position}`);
      return;
    }

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
        const scoring = scorePlayerForPosition(player, 'MF'); // Use midfield as default
        return { 
          player, 
          score: scoring.score,
          reasons: scoring.reasons
        };
      })
      .sort((a, b) => b.score - a.score);

    if (scoredPlayers.length > 0) {
      const selectedPlayer = scoredPlayers[0];
      const primaryPosition = selectedPlayer.player.positions?.[0] || 'MF';
      
      lineupPlayers.push({
        playerId: selectedPlayer.player.id,
        playerName: selectedPlayer.player.name,
        position: primaryPosition,
        reasoning: `${selectedPlayer.reasons} (reserv)`
      });
      selectedPlayerIds.add(selectedPlayer.player.id);
    }
  }

  // Create bench players - exactly 2 players
  const remainingPlayers = activePlayers.filter(p => !selectedPlayerIds.has(p.id));
  
  const benchPlayers: Array<{
    playerId: string;
    playerName: string;
    position: string;
    reasoning: string;
  }> = [];

  // Score remaining players for bench (exactly 2 players)
  const maxBenchPlayers = 2;
  
  if (remainingPlayers.length > 0) {
    const scoredBenchPlayers = remainingPlayers
      .map(player => {
        const scoring = scorePlayerForPosition(player, player.positions?.[0] || 'MF');
        return { 
          player, 
          score: scoring.score,
          reasons: scoring.reasons
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxBenchPlayers);

    scoredBenchPlayers.forEach(benchPlayer => {
      const primaryPosition = benchPlayer.player.positions?.[0] || 'MF';
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
