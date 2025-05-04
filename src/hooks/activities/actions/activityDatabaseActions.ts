
import { Activity } from "@/types/player";
import { supabase } from "@/lib/supabase/client";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { toast as toastLibrary } from "sonner";

/**
 * Updates an activity in the database
 */
export const updateActivityInDatabase = async (activity: Activity): Promise<boolean> => {
  try {
    console.log(`Updating activity ${activity.id} in database`);
    
    // Format the activity for database
    const formattedActivity = formatActivityForDatabase(activity);
    
    // Update the activity in the database
    const { data, error } = await supabase
      .from('activities')
      .update(formattedActivity)
      .eq('id', activity.id)
      .select();
    
    if (error) {
      console.error("Error updating activity in database:", error);
      toastLibrary.error("Kunde inte uppdatera aktiviteten i databasen");
      return false;
    }
    
    // Log the change
    try {
      await logDatabaseChange(
        'update',
        'activity',
        activity.id,
        `Activity updated: ${activity.name}`
      );
    } catch (logError) {
      console.warn("Error logging database change:", logError);
      // Continue even if logging fails
    }
    
    console.log("Successfully updated activity in database:", data);
    return true;
  } catch (error) {
    console.error("Unexpected error updating activity in database:", error);
    return false;
  }
};

/**
 * Deletes an activity from the database
 */
export const deleteActivityFromDatabase = async (activityId: string): Promise<boolean> => {
  try {
    console.log(`Deleting activity ${activityId} from database`);
    
    // First delete player-activity relations
    const { error: relationsError } = await supabase
      .from('player_activities')
      .delete()
      .eq('activity_id', activityId);
    
    if (relationsError) {
      console.error("Error deleting player-activity relations:", relationsError);
      // Continue anyway, might still be able to delete the activity
    }
    
    // Delete the activity
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);
    
    if (error) {
      console.error("Error deleting activity from database:", error);
      toastLibrary.error("Kunde inte ta bort aktiviteten från databasen");
      return false;
    }
    
    // Log the change
    try {
      await logDatabaseChange(
        'delete',
        'activity',
        activityId,
        `Activity deleted`
      );
    } catch (logError) {
      console.warn("Error logging database change:", logError);
      // Continue even if logging fails
    }
    
    console.log(`Successfully deleted activity ${activityId} from database`);
    return true;
  } catch (error) {
    console.error("Unexpected error deleting activity from database:", error);
    return false;
  }
};
