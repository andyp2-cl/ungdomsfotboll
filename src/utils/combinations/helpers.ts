
import { Player, Activity, PlayerPosition } from "@/types/player";
import { calculateWinStatus } from "@/utils/winCalculation";

// Helper function to convert grade to numeric value
export function gradeToNumeric(grade: string): number {
  switch (grade?.toUpperCase()) {
    case 'A': return 4;
    case 'B': return 3;
    case 'C': return 2;
    case 'D': return 1;
    default: return 2; // Default to C
  }
}

// Helper function to convert numeric value to grade
export function numericToGrade(value: number): string {
  if (value >= 3.5) return 'A';
  if (value >= 2.5) return 'B';
  if (value >= 1.5) return 'C';
  return 'D';
}

// Get grade points for optimization (higher is better)
export function getGradePoints(grade: string): number {
  switch (grade?.toUpperCase()) {
    case 'A': return 15;
    case 'B': return 10;
    case 'C': return 5;
    case 'D': return 0;
    default: return 5; // Default to C level
  }
}

// Calculate position synergy between two positions (updated with standardized position names)
export function calculatePositionSynergy(pos1: string, pos2: string): number {
  const synergyMap: Record<string, Record<string, number>> = {
    'MV': {
      'BACK': 1.3,
      'MF': 1.1,
      'ANF': 1.0,
    },
    'BACK': {
      'MV': 1.3,
      'BACK': 1.2,
      'MF': 1.4,
      'ANF': 1.1,
    },
    'MF': {
      'MV': 1.1,
      'BACK': 1.4,
      'MF': 1.2,
      'ANF': 1.3,
    },
    'ANF': {
      'MV': 1.0,
      'BACK': 1.1,
      'MF': 1.3,
      'ANF': 1.1,
    },
  };

  return synergyMap[pos1]?.[pos2] || 1.0;
}

// Helper function to determine if Hässleholms IF was the home team
export function isHomeMatch(activity: Activity): boolean {
  // Common pattern: "Team A - Team B" where Team A is the home team
  const nameParts = activity.name.split(' - ');
  
  // Check if Hässleholms IF is mentioned in the first part (home)
  if (nameParts.length === 2) {
    return nameParts[0].toLowerCase().includes('hässleholms if');
  }
  
  // For names without the standard format, check if it starts with Hässleholms IF
  return activity.name.toLowerCase().startsWith('hässleholms if');
}

// Helper function to calculate goal difference from Hässleholms IF's perspective
export function calculateGoalDifference(activity: Activity): number {
  if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
    const isHome = isHomeMatch(activity);
    
    if (isHome) {
      // If Hässleholms IF is home team, positive difference means we scored more
      return activity.homeScore - activity.awayScore;
    } else {
      // If Hässleholms IF is away team, positive difference means we scored more
      return activity.awayScore - activity.homeScore;
    }
  }
  return 0;
}

// Helper function to get opponent name from activity
export function getOpponentName(activity: Activity): string | undefined {
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

// Helper function to get similar positions for fallback
export function getSimilarPositions(position: string): PlayerPosition[] {
  const similarityMap: Record<string, PlayerPosition[]> = {
    'MV': [], // Goalkeepers are unique
    'BACK': ['MF'], // Defenders can play midfield
    'MF': ['BACK', 'ANF'], // Midfielders are versatile
    'ANF': ['MF'], // Forwards can play midfield
  };
  
  return similarityMap[position] || [];
}

// Helper function to get position requirements for formations (updated with standardized position names)
export function getFormationPositions(formation: string): string[] {
  const formations: Record<string, string[]> = {
    "2-3-1": ["MV", "BACK", "BACK", "MF", "MF", "MF", "ANF"],
    "3-2-1": ["MV", "BACK", "BACK", "BACK", "MF", "MF", "ANF"],
    "2-2-2": ["MV", "BACK", "BACK", "MF", "MF", "MF", "MF"],
    "3-3": ["MV", "BACK", "BACK", "BACK", "MF", "MF", "MF"],
    "2-4": ["MV", "BACK", "BACK", "MF", "MF", "MF", "MF"],
    "1-3-2": ["MV", "BACK", "MF", "MF", "MF", "ANF", "ANF"],
  };
  
  return formations[formation] || formations["2-3-1"];
}
