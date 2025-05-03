
import { Activity } from "@/types/player";

/**
 * Filters activities by search term
 * @param activities List of activities to filter
 * @param searchTerm Term to search for
 * @returns Filtered activities
 */
export function filterActivitiesBySearchTerm(activities: Activity[], searchTerm: string): Activity[] {
  if (!searchTerm.trim()) {
    return activities;
  }
  
  const lowercaseSearchTerm = searchTerm.toLowerCase();
  
  return activities.filter(activity => {
    // Search in name
    if (activity.name?.toLowerCase().includes(lowercaseSearchTerm)) {
      return true;
    }
    
    // Search in location (checking if location exists and has name property)
    if (activity.location?.name && 
        activity.location.name.toLowerCase().includes(lowercaseSearchTerm)) {
      return true;
    }
    
    // Search in type
    if (activity.type?.toLowerCase().includes(lowercaseSearchTerm)) {
      return true;
    }
    
    return false;
  });
}
