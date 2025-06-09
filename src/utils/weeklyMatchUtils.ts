
import { Activity } from "@/types/player";

export function getWeeklyMatchCount(playerId: string, activities: Activity[]): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);

  console.log(`WeeklyMatchUtils: Checking for player ${playerId}`);
  console.log(`WeeklyMatchUtils: Week range: ${startOfWeek.toISOString()} to ${endOfWeek.toISOString()}`);
  console.log(`WeeklyMatchUtils: Total activities to check: ${activities.length}`);

  // Count upcoming matches for this player in the current week
  const weeklyMatches = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    const isMatch = activity.type === 'match';
    const hasPlayer = activity.participants?.includes(playerId);
    const isUpcoming = activityDate >= now;
    const isInWeek = activityDate >= startOfWeek && activityDate <= endOfWeek;
    
    console.log(`WeeklyMatchUtils: Activity ${activity.name} (${activity.date})`);
    console.log(`  - isMatch: ${isMatch}`);
    console.log(`  - hasPlayer: ${hasPlayer}`);
    console.log(`  - isUpcoming: ${isUpcoming}`);
    console.log(`  - isInWeek: ${isInWeek}`);
    console.log(`  - activityDate: ${activityDate.toISOString()}`);
    
    const matches = isMatch && hasPlayer && isUpcoming && isInWeek;
    console.log(`  - matches criteria: ${matches}`);
    
    return matches;
  });

  console.log(`WeeklyMatchUtils: Found ${weeklyMatches.length} weekly matches for player ${playerId}`);
  weeklyMatches.forEach(match => {
    console.log(`  - ${match.name} on ${match.date}`);
  });

  return weeklyMatches.length;
}
