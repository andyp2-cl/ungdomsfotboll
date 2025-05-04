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
    
    // Process cups and matches relationship
    // For each cup, set its name on related matches
    // and for each match, find its corresponding cup name
    const cups = activities.filter(activity => activity.type === 'cup');
    const matches = activities.filter(activity => activity.type === 'match');
    
    // Set cupName for matches based on cup ID
    matches.forEach(match => {
      if (match.cupId) {
        const relatedCup = cups.find(cup => cup.id === match.cupId);
        if (relatedCup) {
          match.cupName = relatedCup.name;
          console.log(`Set cupName=${relatedCup.name} for match ${match.id}`);
        }
      }
    });
    
    // Group related cup activities
    const matchesByCup = new Map<string, Activity[]>();
    
    // First, organize matches by cup ID
    matches.forEach(activity => {
      if (activity.cupId) {
        if (!matchesByCup.has(activity.cupId)) {
          matchesByCup.set(activity.cupId, []);
        }
        matchesByCup.get(activity.cupId)?.push(activity);
      }
    });
    
    console.log(`Found matches for ${matchesByCup.size} different cups`);
    
    return activities;
  } catch (error) {
    console.error('Error in fetchActivities:', error);
    return [];
  }
};

// Get all cup names from activities - consider both cup types
export const getAllCupNames = (activities: Activity[]): string[] => {
  const cupNames = new Set<string>();
  
  activities.forEach(activity => {
    // Include names from cup type activities
    if (activity.type === 'cup' && activity.name) {
      cupNames.add(activity.name);
    }
  });
  
  console.log("Found cup names:", Array.from(cupNames));
  return Array.from(cupNames);
};

// Find matches by cup name
export const findMatchesByCupName = (activities: Activity[], cupName: string): Activity[] => {
  if (!cupName) return [];
  
  return activities.filter(activity => {
    if (activity.type !== 'match') return false;
    
    // Check if this match references a cup with this name
    // This cupName might be assigned in memory rather than from DB
    if (activity.cupName === cupName) return true;
    
    // Or check if the match references a cup ID that belongs to a cup with this name
    if (activity.cupId) {
      const relatedCup = activities.find(cup => 
        cup.type === 'cup' && cup.id === activity.cupId && cup.name === cupName
      );
      return !!relatedCup;
    }
    
    return false;
  });
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
