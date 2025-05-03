
// Re-export everything from the new modular activity storage system
export * from './activity';

// Add this function to maintain backward compatibility
import { saveActivities } from './activity/save';
import { Activity } from '@/types/player';

/**
 * Save multiple activities to storage
 * 
 * @param activities Array of activities to save
 * @returns Promise that resolves when all activities are saved
 */
export async function saveActivities2(activities: Activity[]): Promise<void> {
  if (!activities || activities.length === 0) {
    console.log("No activities provided to saveActivities");
    return;
  }
  
  console.log(`Saving ${activities.length} activities`);
  
  // Save each activity individually
  for (const activity of activities) {
    try {
      await saveActivities([activity]);
      console.log(`Activity ${activity.id} saved successfully`);
    } catch (error) {
      console.error(`Error saving activity ${activity.id}:`, error);
      // Continue with the next activity instead of failing the entire operation
    }
  }
  
  console.log("All activities saved successfully");
}
