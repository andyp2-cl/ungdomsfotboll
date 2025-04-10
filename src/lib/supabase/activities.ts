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
      // Log the raw is_win value to debug
      console.log(`Activity ${item.id} (${item.name}) has is_win:`, item.is_win);
      
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
        matches: Array.isArray(item.matches) ? item.matches : [], // Ensure matches is always an array
        result: undefined, // Initialize with undefined
        homeScore: item.home_score,
        awayScore: item.away_score,
        // Properly handle is_win with strict type checking
        isWin: item.is_win === true ? true : item.is_win === false ? false : undefined
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
            },
            isWin: activity.isWin // Use the activity-level isWin value
          };
        } catch (e) {
          console.error("Error parsing player_stats JSON:", e);
          activity.player_stats = {
            goals: {},
            assists: {},
            scores: {
              home: item.home_score,
              away: item.away_score
            },
            isWin: activity.isWin
          };
        }
      } else {
        activity.player_stats = {
          goals: {},
          assists: {},
          scores: {
            home: item.home_score,
            away: item.away_score
          },
          isWin: activity.isWin
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
    
    // Process cup-match relationships
    console.log("Processing cup-match relationships");
    
    // First, identify all cups and matches
    const cupActivities = activities.filter(activity => activity.type === 'cup');
    const matchActivities = activities.filter(activity => activity.type === 'match');
    
    // For each cup, check its matches array and verify with the cup_id in match activities
    cupActivities.forEach(cupActivity => {
      // Get matches that have this cup as parent via cup_id
      const matchesWithCupId = matchActivities.filter(
        match => match.cupId === cupActivity.id
      );
      
      // Initialize matches array if needed
      if (!cupActivity.matches) {
        cupActivity.matches = [];
      }
      
      // Add any matches that have this cup as parent via cup_id but aren't in the matches array
      matchesWithCupId.forEach(match => {
        if (!cupActivity.matches?.includes(match.id)) {
          console.log(`Adding match ${match.id} to cup ${cupActivity.id} matches array`);
          cupActivity.matches?.push(match.id);
        }
      });
      
      console.log(`Cup ${cupActivity.name} has ${cupActivity.matches.length} matches after processing`);
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
