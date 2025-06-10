
import { Activity } from "@/types/player";

export function getWeeklyMatchCount(playerId: string, activities: Activity[]): number {
  const now = new Date();
  
  // Calculate start of week (Monday)
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
  startOfWeek.setDate(now.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate end of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Add 6 days to get to Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  console.log(`WeeklyMatchUtils: Checking for player ${playerId}`);
  console.log(`WeeklyMatchUtils: Week range (Monday-Sunday): ${startOfWeek.toISOString()} to ${endOfWeek.toISOString()}`);
  console.log(`WeeklyMatchUtils: Total activities to check: ${activities.length}`);

  // Count ALL matches for this player in the current week (both past and future)
  const weeklyMatches = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    const isMatch = activity.type === 'match';
    const hasPlayer = activity.participants?.includes(playerId);
    const isInWeek = activityDate >= startOfWeek && activityDate <= endOfWeek;
    
    console.log(`WeeklyMatchUtils: Activity ${activity.name} (${activity.date})`);
    console.log(`  - isMatch: ${isMatch}`);
    console.log(`  - hasPlayer: ${hasPlayer}`);
    console.log(`  - isInWeek: ${isInWeek}`);
    console.log(`  - activityDate: ${activityDate.toISOString()}`);
    
    const matches = isMatch && hasPlayer && isInWeek;
    console.log(`  - matches criteria: ${matches}`);
    
    return matches;
  });

  console.log(`WeeklyMatchUtils: Found ${weeklyMatches.length} weekly matches for player ${playerId}`);
  weeklyMatches.forEach(match => {
    console.log(`  - ${match.name} on ${match.date}`);
  });

  return weeklyMatches.length;
}
