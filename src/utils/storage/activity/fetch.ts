
import { supabase } from "@/lib/supabase";
import { Activity } from "@/types/player";
import { formatActivityFromDatabase } from "@/utils/database/formatters/activity";

// Get activities from Supabase
export const getStoredActivities = async (): Promise<Activity[]> => {
  try {
    // First, get all activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*');
      
    if (activitiesError) throw activitiesError;
    
    // Ensure we have data before proceeding
    if (!activitiesData) {
      console.log("No activities data found in database");
      return [];
    }
    
    // Format all activities properly with correct typing
    const activities: Activity[] = activitiesData.map(formatActivityFromDatabase);
    
    console.log(`Fetched ${activities.length} activities from database`);
    
    // Log all activities with cup ID for debugging
    const activitiesWithCupId = activities.filter(a => a.cupId);
    console.log(`Found ${activitiesWithCupId.length} activities with cupId:`, 
      activitiesWithCupId.map(a => ({ id: a.id, name: a.name, cupId: a.cupId })));
    
    // Then, get player-activity relationships and populate the participants array
    const { data: playerActivitiesData, error: relationshipError } = await supabase
      .from('player_activities')
      .select('*');
      
    if (relationshipError) throw relationshipError;
    
    // Populate participants for each activity
    activities.forEach(activity => {
      const activityPlayerRelations = playerActivitiesData?.filter(pa => pa.activity_id === activity.id) || [];
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
      let cupMatches: Activity[] = [];
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
        
        // Make sure each match in implicitMatches has its cupId set correctly
        implicitMatches.forEach(match => {
          if (match.cupId !== cupActivity.id) {
            match.cupId = cupActivity.id;
            console.log(`Fixed cupId for match ${match.id}`);
          }
        });
        
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
    
    // Strategy 3: Also ensure all matches with cupName properly reference their parent cup
    const matchesWithCupName = activities.filter(a => a.cupName && a.type === 'match');
    console.log(`Found ${matchesWithCupName.length} matches with cupName references`);
    
    matchesWithCupName.forEach(matchActivity => {
      // Find cup activities with the same name
      const relatedCups = activities.filter(a => 
        a.type === 'cup' && a.name === matchActivity.cupName
      );
      
      if (relatedCups.length > 0) {
        // Link to the first cup with matching name
        const parentCup = relatedCups[0];
        if (!matchActivity.cupId) {
          matchActivity.cupId = parentCup.id;
          console.log(`Linked match ${matchActivity.name} to cup ${parentCup.name} via cupName`);
        }
        
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
    
    // Final debugging: log cups and their matches
    cupActivities.forEach(cup => {
      console.log(`Cup ${cup.name} (${cup.id}) final matches array:`, cup.matches);
      const actualMatchActivities = cup.matches
        ? activities.filter(a => cup.matches?.includes(a.id))
        : [];
      console.log(`Found ${actualMatchActivities.length} actual match activities for cup ${cup.name}`);
    });
    
    console.log("Retrieved and linked activities from Supabase:", activities.length);
    return activities;
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};
