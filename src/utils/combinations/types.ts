
import { Player, Activity, PlayerPosition } from "@/types/player";

// Extended Activity interface for our utility functions (without conflicting participants override)
export interface ExtendedActivity extends Activity {
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
