
import { Player, Activity } from "@/types/player";
import { OpponentLevelAnalysis } from "./types";
import { calculateWinStatus } from "@/utils/winCalculation";
import { getOpponentName, calculateGoalDifference, gradeToNumeric, numericToGrade } from "./helpers";

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

// Analyze opponent match history - UPDATED to use isWin field correctly
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

  let wins = 0;
  let draws = 0;
  let losses = 0;

  // Count wins, draws, and losses using the isWin field or fallback to calculation
  opponentMatches.forEach(match => {
    const winStatus = calculateWinStatus(match);
    
    if (winStatus === true) {
      wins++;
    } else if (winStatus === false) {
      losses++;
    } else {
      draws++; // undefined means draw
    }
  });
  
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
    .map(match => {
      const winStatus = calculateWinStatus(match);
      let result: string;
      
      if (winStatus === true) {
        result = 'WIN';
      } else if (winStatus === false) {
        result = 'LOSS';
      } else {
        result = 'DRAW';
      }
      
      return {
        date: match.date,
        result,
        goalDifference: calculateGoalDifference(match),
      };
    });

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

// New function: Analyze opponent grade history for smart level strategy - UPDATED to use isWin field
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
        const winStatus = calculateWinStatus(match);
        
        lastMatchResult = {
          ourGrade: recentGrades.reduce((sum, grade) => sum + grade, 0) / recentGrades.length,
          goalDifference: calculateGoalDifference(match),
          wasWin: winStatus === true
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
