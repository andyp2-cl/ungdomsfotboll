import { Activity } from "@/types/player";
import { supabase, logDatabaseChange } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { formatDatabaseActivity, formatActivityForDatabase } from "../database/formatters";

// Get activities from Supabase
export const getStoredActivities = async (): Promise<Activity[]> => {
  try {
    // First, get all activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*');
      
    if (activitiesError) throw activitiesError;
    
    const activities = activitiesData.map(formatDatabaseActivity);
    
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
    
    // IMPROVED: Log all activities with their cup IDs before processing
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

// Handle participant relationships for an activity
export const updateActivityParticipants = async (activity: Activity): Promise<void> => {
  try {
    // Get current relationships for this activity regardless of participant array
    const { data: existingRelations, error: fetchError } = await supabase
      .from('player_activities')
      .select('*')
      .eq('activity_id', activity.id);
        
    if (fetchError) throw fetchError;
    
    // If participants array is empty or undefined, we want to remove all relations
    if (!activity.participants || activity.participants.length === 0) {
      // If there are any existing relations, delete them all
      if (existingRelations && existingRelations.length > 0) {
        console.log(`Clearing all participants (${existingRelations.length}) from activity ${activity.name}`);
        
        // Log the participant removal for each player first
        for (const relation of existingRelations) {
          // Get player name if available
          let playerName = "Player";
          try {
            const { data: playerData } = await supabase
              .from('players')
              .select('name')
              .eq('id', relation.player_id)
              .single();
            
            if (playerData) {
              playerName = playerData.name;
            }
          } catch (e) {
            console.error("Error fetching player name:", e);
          }
          
          await logDatabaseChange(
            'delete',
            'player_activity',
            `${relation.player_id}-${activity.id}`,
            `Removed player "${playerName}" from activity "${activity.name}"`
          );
        }
        
        // Now delete the actual relations
        const { error: deleteError } = await supabase
          .from('player_activities')
          .delete()
          .eq('activity_id', activity.id);
          
        if (deleteError) throw deleteError;
        
        // Log that all participants were cleared
        await logDatabaseChange(
          'update',
          'activity',
          activity.id,
          `Cleared all participants (${existingRelations.length}) from activity "${activity.name}"`
        );
      }
    } else {
      // Normal handling for activities with participants
      // Delete relationships that are no longer valid
      const existingPlayerIds = existingRelations.map(rel => rel.player_id);
      const playerIdsToRemove = existingPlayerIds.filter(
        playerId => !activity.participants?.includes(playerId)
      );
      
      if (playerIdsToRemove.length > 0) {
        // Log each player removal individually
        for (const playerId of playerIdsToRemove) {
          // Get player name if available
          let playerName = "Player";
          try {
            const { data: playerData } = await supabase
              .from('players')
              .select('name')
              .eq('id', playerId)
              .single();
            
            if (playerData) {
              playerName = playerData.name;
            }
          } catch (e) {
            console.error("Error fetching player name:", e);
          }
          
          await logDatabaseChange(
            'delete',
            'player_activity',
            `${playerId}-${activity.id}`,
            `Removed player "${playerName}" from activity "${activity.name}"`
          );
        }
        
        const { error: deleteError } = await supabase
          .from('player_activities')
          .delete()
          .eq('activity_id', activity.id)
          .in('player_id', playerIdsToRemove);
          
        if (deleteError) throw deleteError;
      }
      
      // Add new relationships
      const newPlayerIds = activity.participants.filter(
        playerId => !existingPlayerIds.includes(playerId)
      );
      
      if (newPlayerIds.length > 0) {
        const newRelations = newPlayerIds.map(playerId => ({
          id: uuidv4(),
          player_id: playerId,
          activity_id: activity.id
        }));
        
        const { error: insertError } = await supabase
          .from('player_activities')
          .insert(newRelations);
          
        if (insertError) throw insertError;
        
        // Log the added relations
        for (const playerId of newPlayerIds) {
          // Get player name if available
          let playerName = "Player";
          try {
            const { data: playerData } = await supabase
              .from('players')
              .select('name')
              .eq('id', playerId)
              .single();
            
            if (playerData) {
              playerName = playerData.name;
            }
          } catch (e) {
            console.error("Error fetching player name:", e);
          }
          
          await logDatabaseChange(
            'create',
            'player_activity',
            `${playerId}-${activity.id}`,
            `Added player "${playerName}" to activity "${activity.name}"`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error updating activity participants:", error);
    throw error;
  }
};

// IMPROVED: Update match cup associations for cup activities with better logging
export const updateCupMatches = async (activity: Activity, activities: Activity[]): Promise<void> => {
  try {
    // For new cup activities, also add a reference to their matches
    if (activity.type === 'cup' && activity.matches && activity.matches.length > 0) {
      console.log(`Cup ${activity.name} has ${activity.matches.length} matches, ensuring they have the correct cupId`);
      
      // Get the match activities
      const matchActivities = activities.filter(a => activity.matches?.includes(a.id));
      console.log(`Found ${matchActivities.length} match activities for cup ${activity.name}:`, 
        matchActivities.map(m => ({id: m.id, name: m.name})));
      
      // Update each match with the cup ID
      for (const matchActivity of matchActivities) {
        console.log(`Updating match ${matchActivity.name} with cupId ${activity.id}`);
        
        // Update the match in the database with the cupId
        const { error: updateError } = await supabase
          .from('activities')
          .update({ cup_id: activity.id })
          .eq('id', matchActivity.id);
          
        if (updateError) {
          console.error(`Error updating cupId for match ${matchActivity.name}:`, updateError);
        } else {
          console.log(`Successfully updated cupId for match ${matchActivity.name}`);
          
          // Log the cup association
          await logDatabaseChange(
            'update',
            'activity',
            matchActivity.id,
            `Associated match "${matchActivity.name}" with cup "${activity.name}"`
          );
        }
      }
      
      // Additional logging for cup-match relationships
      await logDatabaseChange(
        'update',
        'activity',
        activity.id,
        `Associated ${activity.matches.length} matches with cup "${activity.name}"`
      );
    }
  } catch (error) {
    console.error("Error updating cup matches:", error);
  }
};

// Save activities to Supabase
export const saveActivities = async (activities: Activity[]): Promise<void> => {
  console.log("Saving activities to Supabase:", activities.length);
  
  try {
    for (const activity of activities) {
      const formattedActivity = formatActivityForDatabase(activity);
      
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
      await updateActivityParticipants(activity);
      
      // For cup activities, handle cup-match relationships
      if (activity.type === 'cup') {
        console.log(`Processing cup-match relationships for cup ${activity.name}`);
        await updateCupMatches(activity, activities);
      }
    }
  } catch (error) {
    console.error("Error saving activities to Supabase:", error);
    throw error;
  }
};

// New function to permanently delete all historical activities
export const deleteAllHistoricalActivities = async (): Promise<void> => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all activities
    const { data: activitiesData, error: fetchError } = await supabase
      .from('activities')
      .select('*');
      
    if (fetchError) throw fetchError;
    
    // Filter out historical activities (yesterday and earlier)
    const historicalActivities = activitiesData.filter(activity => {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate < today;
    });
    
    if (historicalActivities.length === 0) {
      console.log("No historical activities found to delete");
      return;
    }
    
    // Get IDs of historical activities
    const historicalActivityIds = historicalActivities.map(a => a.id);
    console.log(`Found ${historicalActivityIds.length} historical activities to delete`);
    
    // Delete player-activity relationships first
    const { error: relationsError } = await supabase
      .from('player_activities')
      .delete()
      .in('activity_id', historicalActivityIds);
      
    if (relationsError) {
      console.error("Error deleting player-activity relationships:", relationsError);
      throw relationsError;
    }
    
    console.log(`Deleted player-activity relationships for ${historicalActivityIds.length} activities`);
    
    // Now delete the activities themselves
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .in('id', historicalActivityIds);
      
    if (deleteError) {
      console.error("Error deleting historical activities:", deleteError);
      throw deleteError;
    }
    
    console.log(`Successfully deleted ${historicalActivityIds.length} historical activities`);
    
    // Log the action
    await logDatabaseChange(
      'delete',
      'activity',
      'historical-bulk',
      `Permanently deleted ${historicalActivityIds.length} historical activities as a one-time operation`
    );
    
  } catch (error) {
    console.error("Error in deleteAllHistoricalActivities:", error);
    throw error;
  }
};
