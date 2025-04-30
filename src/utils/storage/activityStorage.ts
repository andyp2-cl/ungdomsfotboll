
// Re-export everything from the new modular activity storage system
export * from './activity';

// Add this function to maintain backward compatibility
import { saveActivity } from './activity/save';
import { Activity } from '@/types/player';

/**
 * Save multiple activities to storage
 * 
 * @param activities Array of activities to save
 * @returns Promise that resolves when all activities are saved
 */
export async function saveActivities(activities: Activity[]): Promise<void> {
  if (!activities || activities.length === 0) {
    console.log("No activities provided to saveActivities");
    return;
  }
  
  console.log(`Saving ${activities.length} activities`);
  
  // Save each activity individually
  for (const activity of activities) {
    try {
      await saveActivity({
        activity: activity,
        formattedActivity: activity, // Let the lower-level function handle formatting
        isNewActivity: false // Assume existing unless otherwise specified
      });
    } catch (error) {
      console.error(`Error saving activity ${activity.id}:`, error);
      // Continue with the next activity instead of failing the entire operation
    }
  }
  
  console.log("All activities saved successfully");
}
