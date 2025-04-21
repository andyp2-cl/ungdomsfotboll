
import { Activity } from "@/types/player";

/**
 * Find cup matches by cup name
 */
export const findCupMatchesByCupName = (
  activities: Activity[],
  cupName: string
): Activity[] => {
  if (!cupName) return [];
  
  const matches = activities.filter(
    (activity) => 
      activity.type === 'match' && 
      activity.cupName === cupName
  );
  
  return matches;
};

/**
 * Find cup matches by cup ID
 */
export const findCupMatchesByCupId = (
  activities: Activity[],
  cupId: string
): Activity[] => {
  if (!cupId) return [];
  
  const matches = activities.filter(
    (activity) => 
      activity.type === 'match' && 
      activity.cupId === cupId
  );
  
  return matches;
};

/**
 * Find all cup matches related to a cup
 */
export const findAllCupMatches = (
  activities: Activity[],
  cupActivity: Activity
): Activity[] => {
  if (!cupActivity) return [];
  
  // Find by ID
  const matchesById = findCupMatchesByCupId(activities, cupActivity.id);
  
  // Find by name
  const matchesByName = findCupMatchesByCupName(activities, cupActivity.name);
  
  // Combine and deduplicate
  const allMatches = [...matchesById];
  
  matchesByName.forEach(match => {
    if (!allMatches.some(m => m.id === match.id)) {
      allMatches.push(match);
    }
  });
  
  return allMatches;
};
