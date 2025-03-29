
import { supabase } from './client';
import { Activity } from '@/types/player';

// Function to fetch activities from Supabase
export const fetchActivities = async (): Promise<Activity[]> => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
    
    // Transform the database format to our application format
    const activities = (data || []).map(activity => ({
      id: activity.id,
      name: activity.name,
      date: activity.date,
      type: activity.type as any,
      time: activity.time || undefined,
      location: activity.location_name ? {
        name: activity.location_name,
        description: activity.location_description || undefined,
        gpsLink: activity.location_gps_link || undefined
      } : undefined,
      kioskAssignedPlayerId: activity.kiosk_assigned_player_id || undefined,
      scraped: activity.scraped || false,
      participants: [],
      cupId: activity.cup_id || undefined,
      matches: [] // We'll populate this for cup activities
    }));
    
    // Fetch participant relationships
    const { data: playerActivitiesData, error: relationshipError } = await supabase
      .from('player_activities')
      .select('*');
      
    if (relationshipError) {
      console.error('Error fetching player activities:', relationshipError);
    } else {
      // Populate participants for each activity
      activities.forEach(activity => {
        const activityPlayerRelations = playerActivitiesData?.filter(pa => pa.activity_id === activity.id) || [];
        activity.participants = activityPlayerRelations.map(relation => relation.player_id);
      });
    }
    
    // IMPROVED: Find cup matches by looking for activities with a cupId that matches a cup's id
    // Add additional logging to help diagnose the issue
    console.log("All activities before processing cup matches:", activities.map(a => ({id: a.id, name: a.name, type: a.type, cupId: a.cupId})));
    
    // First, find all cup activities
    const cupActivities = activities.filter(activity => activity.type === 'cup');
    console.log("Found cup activities:", cupActivities.map(a => a.id));
    
    // Then for each cup, find its matches
    cupActivities.forEach(cupActivity => {
      // Find all matches that have this cup as parent
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
    
    return activities;
  } catch (error) {
    console.error('Error in fetchActivities:', error);
    return [];
  }
};
