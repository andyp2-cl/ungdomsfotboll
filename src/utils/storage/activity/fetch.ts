
import { supabase } from "@/lib/supabase";
import { Activity } from "@/types/player";
import { formatActivityFromDatabase } from "@/utils/database/formatters";

// Get activities from Supabase
export const getStoredActivities = async (): Promise<Activity[]> => {
  try {
    // First, get all activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*');
      
    if (activitiesError) throw activitiesError;
    
    const activities = activitiesData.map(formatActivityFromDatabase);
    
    console.log(`Fetched ${activities.length} activities from database`);
    
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
    console.log("All activities with cup IDs before linking cups and matches:", 
      activities.filter(a => a.cupId).length);
    
    // For cup activities, find matches that have this cup as parent via multiple strategies
    const cupActivities = activities.filter(a => a.type === 'cup');
    console.log("Cup activities found:", cupActivities.length);
    
    // First pass: ensure all cup activities have a matches array
    cupActivities.forEach(cupActivity => {
      if (!cupActivity.matches) {
        cupActivity.matches = [];
      }
    });
    
    // Second pass: Process cup-match relationships
    cupActivities.forEach(cupActivity => {
      // Strategy 1: Look for matches explicitly defined in the cup's matches array
      let cupMatches = [];
      if (cupActivity.matches && cupActivity.matches.length > 0) {
        const explicitMatches = activities.filter(a => 
          cupActivity.matches?.includes(a.id)
        );
        cupMatches = [...explicitMatches];
        console.log(`Cup ${cupActivity.name} has ${explicitMatches.length} explicit matches`);
      }
      
      // Strategy 2: Look for matches that reference this cup via cupId
      const implicitMatches = activities.filter(a => 
        a.cupId === cupActivity.id && a.type === 'match'
      );
      
      if (implicitMatches.length > 0) {
        console.log(`Cup ${cupActivity.name} has ${implicitMatches.length} implicit matches via cupId`);
        // Add any implicit matches that weren't already found via the matches array
        const missingMatches = implicitMatches.filter(m => 
          !cupMatches.some(cm => cm.id === m.id)
        );
        
        if (missingMatches.length > 0) {
          console.log(`Adding ${missingMatches.length} missing matches to cup ${cupActivity.name}`);
          cupMatches = [...cupMatches, ...missingMatches];
        }
      }
      
      // Ensure we don't have duplicate matches
      const uniqueMatchIds = [...new Set(cupMatches.map(m => m.id))];
      
      // Update the cup's matches array with all found matches
      cupActivity.matches = uniqueMatchIds;
      
      console.log(`Cup ${cupActivity.name} (${cupActivity.id}) has ${uniqueMatchIds.length} total matches after linking`);
    });
    
    // Strategy 3: Also ensure all matches with cupId properly reference their parent cup
    const matchesWithCupId = activities.filter(a => a.cupId && a.type === 'match');
    console.log(`Found ${matchesWithCupId.length} matches with cupId references`);
    
    matchesWithCupId.forEach(matchActivity => {
      const parentCup = activities.find(a => a.id === matchActivity.cupId);
      if (parentCup && parentCup.type === 'cup') {
        // Make sure this match is in the parent cup's matches array
        if (!parentCup.matches) {
          parentCup.matches = [];
        }
        
        if (!parentCup.matches.includes(matchActivity.id)) {
          console.log(`Adding match ${matchActivity.id} to cup ${parentCup.id}'s matches array`);
          parentCup.matches.push(matchActivity.id);
        }
      }
    });
    
    console.log("Retrieved and linked activities from Supabase:", activities.length);
    return activities;
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};
