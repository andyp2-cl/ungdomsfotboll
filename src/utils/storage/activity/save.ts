
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "./types";
import { formatActivityForDatabase } from "@/utils/database/formatters";
import { updateActivityParticipants } from "./participants";
import { updateCupMatches } from "./cupMatches";

// Save activities to Supabase
export const saveActivities = async (activities: Activity[]): Promise<void> => {
  console.log("Saving activities to Supabase:", activities.length);
  
  try {
    for (const activity of activities) {
      const formattedActivity = formatActivityForDatabase(activity);
      
      // Check if activity already exists to determine if this is an update or create
      const { data: existingActivity } = await supabase
        .from('activities')
        .select('id')
        .eq('id', activity.id)
        .single();
      
      const isNewActivity = !existingActivity;
      
      // Upsert the activity
      const { error: upsertError } = await supabase
        .from('activities')
        .upsert(formattedActivity, { onConflict: 'id' });
        
      if (upsertError) throw upsertError;
      
      console.log(`${isNewActivity ? 'Created' : 'Updated'} activity: ${activity.name} (${activity.id})`);
      
      // Log the change
      await logDatabaseChange(
        isNewActivity ? 'create' : 'update',
        'activity',
        activity.id,
        `${isNewActivity ? 'Created' : 'Updated'} activity: ${activity.name} on ${activity.date}`
      );
      
      // Handle player-activity relationships
      await updateActivityParticipants(activity);
      
      // For cup activities, handle cup-match relationships
      if (activity.type === 'cup') {
        console.log(`Processing cup-match relationships for cup ${activity.name}`);
        await updateCupMatches(activity, activities);
      }
    }
  } catch (error) {
    console.error("Error saving activities to Supabase:", error);
    throw error;
  }
};
