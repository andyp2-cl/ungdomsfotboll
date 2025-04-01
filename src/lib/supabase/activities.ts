
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
    const activities: Activity[] = (data || []).map(item => {
      const activity: Activity = {
        id: item.id,
        name: item.name,
        date: item.date,
        type: item.type as any,
        time: item.time || undefined,
        location: item.location_name ? {
          name: item.location_name,
          description: item.location_description || undefined,
          gpsLink: item.location_gps_link || undefined
        } : undefined,
        kioskAssignedPlayerId: item.kiosk_assigned_player_id || undefined,
        scraped: item.scraped || false,
        participants: [],
        cupId: item.cup_id || undefined,
        matches: [], // We'll populate this for cup activities
        result: undefined, // Initialize with undefined
        homeScore: item.home_score,
        awayScore: item.away_score
      };
      
      // Set result field if home_score and away_score are available
      if (item.home_score !== null && item.home_score !== undefined && 
          item.away_score !== null && item.away_score !== undefined) {
        activity.result = `${item.home_score}-${item.away_score}`;
      }
      
      // Handle player_stats properly
      if (item.player_stats) {
        try {
          const stats = typeof item.player_stats === 'string' 
            ? JSON.parse(item.player_stats) 
            : item.player_stats;
            
          activity.player_stats = {
            goals: stats.goals || {},
            assists: stats.assists || {},
            scores: {
              home: item.home_score,
              away: item.away_score
            }
          };
        } catch (e) {
          console.error("Error parsing player_stats JSON:", e);
          activity.player_stats = {
            goals: {},
            assists: {},
            scores: {
              home: item.home_score,
              away: item.away_score
            }
          };
        }
      } else {
        activity.player_stats = {
          goals: {},
          assists: {},
          scores: {
            home: item.home_score,
            away: item.away_score
          }
        };
      }
      
      return activity;
    });
    
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
    
    // Find cup matches by looking for activities with a cupId that matches a cup's id
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

// NEW FUNCTION: Permanently delete activity from Supabase
export const permanentlyDeleteActivity = async (activityId: string): Promise<boolean> => {
  try {
    // First delete all player-activity relationships
    const { error: relationshipError } = await supabase
      .from('player_activities')
      .delete()
      .eq('activity_id', activityId);
      
    if (relationshipError) {
      console.error('Error deleting player-activity relationships:', relationshipError);
      throw relationshipError;
    }
    
    // Then delete the activity itself
    const { error: activityError } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);
      
    if (activityError) {
      console.error('Error deleting activity:', activityError);
      throw activityError;
    }
    
    console.log(`Activity ${activityId} permanently deleted from database`);
    return true;
  } catch (error) {
    console.error('Error permanently deleting activity:', error);
    return false;
  }
};
