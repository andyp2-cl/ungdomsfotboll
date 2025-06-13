import { Activity, Player } from "@/types/player";

// Check if player is playing on the same day as the given match
export function isPlayerPlayingSameDay(playerId: string, matchDate: string, activities: Activity[]): boolean {
  const targetDate = new Date(matchDate).toDateString();
  
  return activities.some(activity => {
    if (activity.type !== 'match' || !activity.participants?.includes(playerId)) {
      return false;
    }
    
    const activityDate = new Date(activity.date).toDateString();
    return activityDate === targetDate;
  });
}

// Check if player already has 2 matches this week
export function isPlayerPlayingTwoMatchesThisWeek(playerId: string, activities: Activity[], referenceDate: string): boolean {
  const refDate = new Date(referenceDate);
  
  // Calculate start of week (Monday)
  const startOfWeek = new Date(refDate);
  const dayOfWeek = refDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
  startOfWeek.setDate(refDate.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate end of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Add 6 days to get to Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  const weeklyMatches = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    const isMatch = activity.type === 'match';
    const hasPlayer = activity.participants?.includes(playerId);
    const isInWeek = activityDate >= startOfWeek && activityDate <= endOfWeek;
    
    return isMatch && hasPlayer && isInWeek;
  });

  return weeklyMatches.length >= 2;
}

// Check if player is available for selection
export function isPlayerAvailableForMatch(playerId: string, matchDate: string, activities: Activity[]): boolean {
  const playingSameDay = isPlayerPlayingSameDay(playerId, matchDate, activities);
  const playingTwoMatchesThisWeek = isPlayerPlayingTwoMatchesThisWeek(playerId, activities, matchDate);
  
  return !playingSameDay && !playingTwoMatchesThisWeek;
}

// Get this week's match count for a player
export function getThisWeekMatchCount(playerId: string, activities: Activity[], referenceDate?: string): number {
  const refDate = referenceDate ? new Date(referenceDate) : new Date();
  
  // Calculate start of week (Monday)
  const startOfWeek = new Date(refDate);
  const dayOfWeek = refDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
  startOfWeek.setDate(refDate.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate end of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Add 6 days to get to Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  const weeklyMatches = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    const isMatch = activity.type === 'match';
    const hasPlayer = activity.participants?.includes(playerId);
    const isInWeek = activityDate >= startOfWeek && activityDate <= endOfWeek;
    
    return isMatch && hasPlayer && isInWeek;
  });

  return weeklyMatches.length;
}

// Sort players by grade (A > B > C > D) and then by training ratio (higher is better)
export function sortPlayersByGradeAndRatio(players: Player[], trainingStats: any[]): Player[] {
  const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
  
  return [...players].sort((a, b) => {
    // Primary sort: Grade (A first, then B, C, D)
    const aGradeOrder = gradeOrder[a.grade as keyof typeof gradeOrder] || 999;
    const bGradeOrder = gradeOrder[b.grade as keyof typeof gradeOrder] || 999;
    
    if (aGradeOrder !== bGradeOrder) {
      return aGradeOrder - bGradeOrder;
    }
    
    // Secondary sort: Training ratio (higher is better)
    const aStats = trainingStats.find(s => s.playerName === a.name);
    const bStats = trainingStats.find(s => s.playerName === b.name);
    
    const aRatio = aStats?.trainingMatchRatio || 0;
    const bRatio = bStats?.trainingMatchRatio || 0;
    
    return bRatio - aRatio; // Changed to sort in descending order (higher first)
  });
}
