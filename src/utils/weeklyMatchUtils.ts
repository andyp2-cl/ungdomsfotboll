
import { Activity } from "@/types/player";

export function getWeeklyMatchCount(playerId: string, activities: Activity[]): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);

  // Count upcoming matches for this player in the current week
  const weeklyMatches = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return (
      activity.type === 'match' &&
      activity.participants?.includes(playerId) &&
      activityDate >= now && // Only upcoming matches
      activityDate >= startOfWeek &&
      activityDate <= endOfWeek
    );
  });

  return weeklyMatches.length;
}
