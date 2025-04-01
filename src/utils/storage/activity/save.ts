
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "./types";
import { formatActivityForDatabase } from "@/utils/database/formatters";
import { updateActivityParticipants } from "./participants";
import { updateCupMatches } from "./cupMatches";

// Hjälpfunktion för att säkerställa att player_stats är ett normaliserat objekt
function normalizePlayerStats(playerStats: any) {
  if (!playerStats) {
    return { goals: {}, assists: {} };
  }
  
  if (typeof playerStats === 'string') {
    try {
      const parsed = JSON.parse(playerStats);
      if (typeof parsed === 'string') {
        try {
          const doubleParsed = JSON.parse(parsed);
          return {
            ...doubleParsed,
            goals: doubleParsed.goals || {},
            assists: doubleParsed.assists || {}
          };
        } catch (e) {
          console.error("Error parsing double-stringified player_stats:", e);
          return { goals: {}, assists: {} };
        }
      }
      return {
        ...parsed,
        goals: parsed.goals || {},
        assists: parsed.assists || {}
      };
    } catch (e) {
      console.error("Error parsing player_stats string:", e);
      return { goals: {}, assists: {} };
    }
  }
  
  // Om det redan är ett objekt, säkerställ att det har nödvändiga egenskaper
  return {
    ...playerStats,
    goals: playerStats.goals || {},
    assists: playerStats.assists || {}
  };
}

// Save activities to Supabase
export const saveActivities = async (activities: Activity[]): Promise<void> => {
  console.log("Saving activities to Supabase:", activities.length);
  
  try {
    for (const activity of activities) {
      // Normalisera player_stats innan formatering för databasen
      const normalizedActivity = {
        ...activity,
        player_stats: normalizePlayerStats(activity.player_stats)
      };
      
      const formattedActivity = formatActivityForDatabase(normalizedActivity);
      
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
      await updateActivityParticipants(normalizedActivity);
      
      // For cup activities, handle cup-match relationships
      if (activity.type === 'cup') {
        console.log(`Processing cup-match relationships for cup ${activity.name}`);
        await updateCupMatches(normalizedActivity, activities);
      }
    }
  } catch (error) {
    console.error("Error saving activities to Supabase:", error);
    throw error;
  }
};
