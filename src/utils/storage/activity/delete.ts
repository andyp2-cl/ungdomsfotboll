
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";

// Function to permanently delete all historical activities
export const deleteAllHistoricalActivities = async (): Promise<void> => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all activities
    const { data: activitiesData, error: fetchError } = await supabase
      .from('activities')
      .select('*');
      
    if (fetchError) throw fetchError;
    
    // Filter out historical activities (yesterday and earlier)
    const historicalActivities = activitiesData.filter(activity => {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate < today;
    });
    
    if (historicalActivities.length === 0) {
      console.log("No historical activities found to delete");
      return;
    }
    
    // Get IDs of historical activities
    const historicalActivityIds = historicalActivities.map(a => a.id);
    console.log(`Found ${historicalActivityIds.length} historical activities to delete`);
    
    // Delete player-activity relationships first
    const { error: relationsError } = await supabase
      .from('player_activities')
      .delete()
      .in('activity_id', historicalActivityIds);
      
    if (relationsError) {
      console.error("Error deleting player-activity relationships:", relationsError);
      throw relationsError;
    }
    
    console.log(`Deleted player-activity relationships for ${historicalActivityIds.length} activities`);
    
    // Now delete the activities themselves
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .in('id', historicalActivityIds);
      
    if (deleteError) {
      console.error("Error deleting historical activities:", deleteError);
      throw deleteError;
    }
    
    console.log(`Successfully deleted ${historicalActivityIds.length} historical activities`);
    
    // Log the action
    await logDatabaseChange(
      'delete',
      'activity',
      'historical-bulk',
      `Permanently deleted ${historicalActivityIds.length} historical activities as a one-time operation`
    );
    
  } catch (error) {
    console.error("Error in deleteAllHistoricalActivities:", error);
    throw error;
  }
};
