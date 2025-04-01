
import { Activity } from "@/types/player";
import { supabase } from "@/lib/supabase";
import { formatActivityFromDatabase } from "../../database/formatters";

// Get activities from Supabase
export const getStoredActivities = async (): Promise<Activity[]> => {
  try {
    // First, get all activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*');
      
    if (activitiesError) throw activitiesError;
    
    const activities = activitiesData.map(formatActivityFromDatabase);
    
    // Then, get player-activity relationships and populate the participants array
    const { data: playerActivitiesData, error: relationshipError } = await supabase
      .from('player_activities')
      .select('*');
      
    if (relationshipError) throw relationshipError;
    
    // Populate participants for each activity
    activities.forEach(activity => {
      const activityPlayerRelations = playerActivitiesData.filter(pa => pa.activity_id === activity.id);
      activity.participants = activityPlayerRelations.map(relation => relation.player_id);
    });
    
    // Log all activities with their cup IDs before processing
    console.log("All activities with cup IDs before matching:", 
      activities.map(a => ({id: a.id, name: a.name, type: a.type, cupId: a.cupId})));
    
    // For cup activities, find matches that have this cup as parent
    const cupActivities = activities.filter(a => a.type === 'cup');
    console.log("Cup activities:", cupActivities.map(a => a.id));
    
    cupActivities.forEach(cupActivity => {
      // Find all matches that reference this cup ID
      const matchesForCup = activities.filter(
        possibleMatch => possibleMatch.cupId === cupActivity.id
      );
      
      console.log(`Looking for matches with cupId=${cupActivity.id} (${cupActivity.name}), found:`, 
        matchesForCup.map(m => ({id: m.id, name: m.name, cupId: m.cupId})));
      
      if (matchesForCup.length > 0) {
        cupActivity.matches = matchesForCup.map(match => match.id);
        console.log(`Set ${matchesForCup.length} matches for cup ${cupActivity.name}:`, cupActivity.matches);
      }
    });
    
    console.log("Retrieved activities from Supabase:", activities.length);
    return activities;
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};
