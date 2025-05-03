
import { Activity } from "@/types/player";
import { processActivitiesForRestore } from "../utils";
import { ProcessedActivities } from "./types";
import { toast } from "sonner";

/**
 * Process and validate activities before restoration
 */
export const processActivitiesBeforeRestore = (activities: any[]): {
  processedActivities: Activity[];
  matchActivities: Activity[];
  hasValidActivities: boolean;
} => {
  try {
    // Count match activities in backup for debugging
    const matchCount = activities.filter(a => a.type === 'match').length;
    console.log(`Attempting to restore ${activities.length} activities, including ${matchCount} matches`);
    
    // Process activities to ensure all required fields are properly set
    let processedActivities: Activity[] = [];
    try {
      processedActivities = processActivitiesForRestore(activities);
      console.log("Processed activities for restore:", processedActivities.length);
      
      // Check specifically for matches after processing
      const processedMatchCount = processedActivities.filter(a => a.type === 'match').length;
      console.log(`After processing: ${processedMatchCount} matches ready for restore`);
      
      // Log a sample match to verify data structure
      if (processedMatchCount > 0) {
        const sampleMatch = processedActivities.find(a => a.type === 'match');
        console.log("Sample processed match:", sampleMatch);
      }
      
      if (processedActivities.length === 0) {
        console.error("No activities were processed successfully");
        return { 
          processedActivities: [], 
          matchActivities: [], 
          hasValidActivities: false 
        };
      }
    } catch (error) {
      console.error("Error processing activities for restore:", error);
      return { 
        processedActivities: [], 
        matchActivities: [], 
        hasValidActivities: false 
      };
    }
    
    // First validate if activities have the correct format
    const validateActivities = processedActivities.every(activity => {
      const requiredFields = ['id', 'name', 'date', 'type'];
      const isValid = requiredFields.every(field => activity[field as keyof Activity] !== undefined);
      if (!isValid) {
        console.error("Invalid activity missing required fields:", activity);
      }
      return isValid;
    });
    
    if (!validateActivities) {
      console.error("Some activities are missing required fields");
      return { 
        processedActivities: [], 
        matchActivities: [], 
        hasValidActivities: false 
      };
    }
    
    // Special attention to match activities
    const matchActivities = processedActivities.filter(a => a.type === 'match');
    console.log(`Preparing to restore ${matchActivities.length} match activities specifically`);
    
    return {
      processedActivities,
      matchActivities,
      hasValidActivities: true
    };
  } catch (error) {
    console.error("Error in processActivitiesBeforeRestore:", error);
    return { 
      processedActivities: [], 
      matchActivities: [], 
      hasValidActivities: false 
    };
  }
};

/**
 * Cache match activities for redundancy
 */
export const cacheMatchActivities = (matchActivities: Activity[]): boolean => {
  if (matchActivities.length === 0) return false;
  
  try {
    // Save to cache immediately for redundancy
    localStorage.setItem('cachedMatchActivities', JSON.stringify(matchActivities));
    toast.info(`Lagrat ${matchActivities.length} matcher i lokal cache för redundans`);
    return true;
  } catch (error) {
    console.error("Error caching match activities:", error);
    return false;
  }
};
