import { supabase } from './client';
import { Activity } from '@/types/player';
import { formatActivityFromDatabase } from '@/utils/database/formatters/activity';

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
      return formatActivityFromDatabase(item);
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
    
    // Group related cup activities
    const matchesByCup = new Map<string, Activity[]>();
    
    // First, organize matches by cup name
    activities.forEach(activity => {
      if (activity.type === 'match' && activity.cupName) {
        if (!matchesByCup.has(activity.cupName)) {
          matchesByCup.set(activity.cupName, []);
        }
        matchesByCup.get(activity.cupName)?.push(activity);
      }
    });
    
    console.log(`Found matches for ${matchesByCup.size} different cups`);
    
    return activities;
  } catch (error) {
    console.error('Error in fetchActivities:', error);
    return [];
  }
};

// Get all cup names from activities - consider both cup types and match types with cupName
export const getAllCupNames = (activities: Activity[]): string[] => {
  const cupNames = new Set<string>();
  
  activities.forEach(activity => {
    // Include names from cup type activities
    if (activity.type === 'cup' && activity.name) {
      cupNames.add(activity.name);
    }
    
    // Also include names from match type activities that reference a cup
    if (activity.cupName) {
      cupNames.add(activity.cupName);
    }
  });
  
  console.log("Found cup names:", Array.from(cupNames));
  return Array.from(cupNames);
};

// Find matches by cup name
export const findMatchesByCupName = (activities: Activity[], cupName: string): Activity[] => {
  if (!cupName) return [];
  
  return activities.filter(activity => 
    activity.type === 'match' && activity.cupName === cupName
  );
};

// Existing function
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
