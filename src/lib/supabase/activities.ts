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

// Create a new cup activity
export const createCupActivity = async (name: string, date: string): Promise<Activity | null> => {
  try {
    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('activities')
      .insert({
        id,
        name,
        date,
        type: 'cup',
        cup_id: id, // Set cup_id to the same ID
        player_stats: {
          goals: {},
          assists: {},
          cup_matches: []
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating cup activity:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned after creating cup activity');
      return null;
    }
    
    return formatActivityFromDatabase(data);
  } catch (error) {
    console.error('Error in createCupActivity:', error);
    return null;
  }
};

// Link matches to a cup
export const linkMatchesToCup = async (cupId: string, matchIds: string[]): Promise<boolean> => {
  try {
    // First, get the cup activity
    const { data: cupData, error: cupError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', cupId)
      .single();
      
    if (cupError || !cupData) {
      console.error('Error fetching cup activity:', cupError);
      return false;
    }
    
    // Update each match to reference the cup
    for (const matchId of matchIds) {
      const { error: matchError } = await supabase
        .from('activities')
        .update({ cup_id: cupId })
        .eq('id', matchId);
        
      if (matchError) {
        console.error(`Error updating match ${matchId}:`, matchError);
        return false;
      }
    }
    
    // Update the cup's player_stats to include the matches
    const playerStats = cupData.player_stats as { goals: Record<string, number>; assists: Record<string, number>; cup_matches: string[] } || { goals: {}, assists: {}, cup_matches: [] };
    const cupMatches = new Set([...(playerStats.cup_matches || []), ...matchIds]);
    
    const { error: updateError } = await supabase
      .from('activities')
      .update({ 
        player_stats: {
          goals: playerStats.goals || {},
          assists: playerStats.assists || {},
          cup_matches: Array.from(cupMatches)
        }
      })
      .eq('id', cupId);
      
    if (updateError) {
      console.error('Error updating cup matches:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in linkMatchesToCup:', error);
    return false;
  }
};

// Restore Cuper and its activities
export const restoreCuper = async (): Promise<boolean> => {
  try {
    // Create the Cuper cup activity
    const cupActivity = await createCupActivity('Cuper 2024', new Date().toISOString().split('T')[0]);
    
    if (!cupActivity) {
      console.error('Failed to create Cuper cup activity');
      return false;
    }
    
    console.log('Created Cuper cup activity:', cupActivity);
    
    // Get all matches that should be part of Cuper
    const { data: matches, error: matchesError } = await supabase
      .from('activities')
      .select('*')
      .eq('type', 'match')
      .order('date', { ascending: true });
      
    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return false;
    }
    
    if (!matches || matches.length === 0) {
      console.log('No matches found to link to Cuper');
      return true;
    }
    
    // Link all matches to Cuper
    const matchIds = matches.map(match => match.id);
    const success = await linkMatchesToCup(cupActivity.id, matchIds);
    
    if (!success) {
      console.error('Failed to link matches to Cuper');
      return false;
    }
    
    console.log(`Successfully linked ${matchIds.length} matches to Cuper`);
    return true;
  } catch (error) {
    console.error('Error in restoreCuper:', error);
    return false;
  }
};
