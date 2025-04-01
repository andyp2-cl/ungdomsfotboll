
import { Activity } from "@/types/player";
import { supabase, logDatabaseChange } from "@/lib/supabase";

// Update match cup associations for cup activities
export const updateCupMatches = async (activity: Activity, activities: Activity[]): Promise<void> => {
  try {
    // For new cup activities, also add a reference to their matches
    if (activity.type === 'cup' && activity.matches && activity.matches.length > 0) {
      console.log(`Cup ${activity.name} has ${activity.matches.length} matches, ensuring they have the correct cupId`);
      
      // Get the match activities
      const matchActivities = activities.filter(a => activity.matches?.includes(a.id));
      console.log(`Found ${matchActivities.length} match activities for cup ${activity.name}:`, 
        matchActivities.map(m => ({id: m.id, name: m.name})));
      
      // Update each match with the cup ID
      for (const matchActivity of matchActivities) {
        console.log(`Updating match ${matchActivity.name} with cupId ${activity.id}`);
        
        // Update the match in the database with the cupId
        const { error: updateError } = await supabase
          .from('activities')
          .update({ cup_id: activity.id })
          .eq('id', matchActivity.id);
          
        if (updateError) {
          console.error(`Error updating cupId for match ${matchActivity.name}:`, updateError);
        } else {
          console.log(`Successfully updated cupId for match ${matchActivity.name}`);
          
          // Log the cup association
          await logDatabaseChange(
            'update',
            'activity',
            matchActivity.id,
            `Associated match "${matchActivity.name}" with cup "${activity.name}"`
          );
        }
      }
      
      // Additional logging for cup-match relationships
      await logDatabaseChange(
        'update',
        'activity',
        activity.id,
        `Associated ${activity.matches.length} matches with cup "${activity.name}"`
      );
    }
  } catch (error) {
    console.error("Error updating cup matches:", error);
  }
};
