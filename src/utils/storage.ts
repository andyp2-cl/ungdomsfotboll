import { Player, Activity } from "@/types/player";
import { mockPlayers } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

const ACTIVE_TAB_STORAGE_KEY = "football-app-active-tab";

// Format a database player to our application Player type
const formatDatabasePlayer = (dbPlayer: any): Player => {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    grade: dbPlayer.grade,
    positions: dbPlayer.position ? dbPlayer.position.split(' ') : [],
    jerseyNumber: dbPlayer.jersey_number || undefined,
    image: dbPlayer.image || undefined,
    activities: [] // We'll populate this separately
  };
};

// Format a database activity to our application Activity type
const formatDatabaseActivity = (dbActivity: any): Activity => {
  const activity: Activity = {
    id: dbActivity.id,
    name: dbActivity.name,
    date: dbActivity.date,
    type: dbActivity.type as any,
    participants: [] // We'll populate this separately
  };

  if (dbActivity.time) activity.time = dbActivity.time;
  if (dbActivity.scraped) activity.scraped = dbActivity.scraped;
  if (dbActivity.kiosk_assigned_player_id) activity.kioskAssignedPlayerId = dbActivity.kiosk_assigned_player_id;
  
  if (dbActivity.location_name) {
    activity.location = {
      name: dbActivity.location_name,
      description: dbActivity.location_description || undefined,
      gpsLink: dbActivity.location_gps_link || undefined
    };
  }

  return activity;
};

// Format our application Player type to database format
const formatPlayerForDatabase = (player: Player) => {
  return {
    id: player.id,
    name: player.name,
    grade: player.grade,
    position: player.positions ? player.positions.join(' ') : null,
    jersey_number: player.jerseyNumber || null,
    image: player.image || null
  };
};

// Format our application Activity type to database format
const formatActivityForDatabase = (activity: Activity) => {
  const dbActivity: any = {
    id: activity.id,
    name: activity.name,
    date: activity.date,
    type: activity.type,
    time: activity.time || null,
    scraped: activity.scraped || null,
    kiosk_assigned_player_id: activity.kioskAssignedPlayerId || null
  };

  if (activity.location) {
    dbActivity.location_name = activity.location.name;
    dbActivity.location_description = activity.location.description || null;
    dbActivity.location_gps_link = activity.location.gpsLink || null;
  } else {
    dbActivity.location_name = null;
    dbActivity.location_description = null;
    dbActivity.location_gps_link = null;
  }

  return dbActivity;
};

// Get players from Supabase or use mockdata as fallback
export const getStoredPlayers = async (): Promise<Player[]> => {
  try {
    // First, get all players
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');

    if (playersError) {
      console.error("Error fetching players:", playersError);
      throw playersError;
    }
    
    const players = playersData.map(formatDatabasePlayer);
    
    // Then, get player-activity relationships and populate the activities array
    const { data: playerActivitiesData, error: relationshipError } = await supabase
      .from('player_activities')
      .select('*');
    
    if (relationshipError) {
      console.error("Error fetching player activities:", relationshipError);
      throw relationshipError;
    }
    
    // Populate activities for each player
    players.forEach(player => {
      const playerActivityRelations = playerActivitiesData.filter(pa => pa.player_id === player.id);
      player.activities = playerActivityRelations.map(relation => relation.activity_id);
    });
    
    if (players.length > 0) {
      console.log("Retrieved players from Supabase:", players.length);
      return players;
    }
    
    // If no players in database, use mockdata and save it
    console.log("No players found in Supabase. Using mock players data as fallback");
    await savePlayers(mockPlayers);
    return mockPlayers;
  } catch (error) {
    console.error("Error fetching players:", error);
    return mockPlayers;
  }
};

// Save players to Supabase
export const savePlayers = async (players: Player[]): Promise<void> => {
  console.log("Saving players to Supabase:", players.length);
  
  try {
    // Improved error handling and logging for better debugging
    for (const player of players) {
      const formattedPlayer = formatPlayerForDatabase(player);
      
      console.log(`Upserting player: ${player.name} (ID: ${player.id})`);
      
      // Upsert the player
      const { error: upsertError } = await supabase
        .from('players')
        .upsert(formattedPlayer, { onConflict: 'id' });
        
      if (upsertError) {
        console.error(`Error upserting player ${player.name}:`, upsertError);
        throw upsertError;
      } else {
        console.log(`Successfully upserted player: ${player.name}`);
      }
      
      // Handle player-activity relationships
      if (player.activities && player.activities.length > 0) {
        // Get current relationships for this player
        const { data: existingRelations, error: fetchError } = await supabase
          .from('player_activities')
          .select('*')
          .eq('player_id', player.id);
          
        if (fetchError) {
          console.error(`Error fetching relations for player ${player.name}:`, fetchError);
          throw fetchError;
        }
        
        // Delete relationships that are no longer valid
        const existingActivityIds = existingRelations.map(rel => rel.activity_id);
        const activityIdsToRemove = existingActivityIds.filter(
          actId => !player.activities?.includes(actId)
        );
        
        if (activityIdsToRemove.length > 0) {
          console.log(`Removing ${activityIdsToRemove.length} activities for player ${player.name}`);
          
          const { error: deleteError } = await supabase
            .from('player_activities')
            .delete()
            .eq('player_id', player.id)
            .in('activity_id', activityIdsToRemove);
            
          if (deleteError) {
            console.error(`Error deleting relations for player ${player.name}:`, deleteError);
            throw deleteError;
          }
        }
        
        // Add new relationships
        const newActivityIds = player.activities.filter(
          actId => !existingActivityIds.includes(actId)
        );
        
        if (newActivityIds.length > 0) {
          console.log(`Adding ${newActivityIds.length} activities for player ${player.name}`);
          
          const newRelations = newActivityIds.map(activityId => ({
            id: uuidv4(),
            player_id: player.id,
            activity_id: activityId
          }));
          
          const { error: insertError } = await supabase
            .from('player_activities')
            .insert(newRelations);
            
          if (insertError) {
            console.error(`Error inserting relations for player ${player.name}:`, insertError);
            throw insertError;
          }
        }
      }
    }
    
    console.log("Players saved successfully to Supabase");
  } catch (error) {
    console.error("Error saving players to Supabase:", error);
    // Re-throw to allow caller to handle
    throw error;
  }
};

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
    
    console.log("Retrieved activities from Supabase:", activities.length);
    return activities;
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};

// Save activities to Supabase
export const saveActivities = async (activities: Activity[]): Promise<void> => {
  console.log("Saving activities to Supabase:", activities.length);
  
  try {
    for (const activity of activities) {
      const formattedActivity = formatActivityForDatabase(activity);
      
      // Upsert the activity
      const { error: upsertError } = await supabase
        .from('activities')
        .upsert(formattedActivity, { onConflict: 'id' });
        
      if (upsertError) throw upsertError;
      
      // Handle player-activity relationships
      if (activity.participants && activity.participants.length > 0) {
        // Get current relationships for this activity
        const { data: existingRelations, error: fetchError } = await supabase
          .from('player_activities')
          .select('*')
          .eq('activity_id', activity.id);
          
        if (fetchError) throw fetchError;
        
        // Delete relationships that are no longer valid
        const existingPlayerIds = existingRelations.map(rel => rel.player_id);
        const playerIdsToRemove = existingPlayerIds.filter(
          playerId => !activity.participants?.includes(playerId)
        );
        
        if (playerIdsToRemove.length > 0) {
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
        }
      }
    }
  } catch (error) {
    console.error("Error saving activities to Supabase:", error);
  }
};

// For the active tab, we'll still use localStorage since this is just UI state
// and doesn't need to be shared across devices
export const saveActiveTab = (tab: string): void => {
  console.log("Saving active tab to localStorage:", tab);
  try {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
  } catch (error) {
    console.error(`Error saving active tab:`, error);
  }
};

export const getActiveTab = (): string => {
  try {
    const tab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    return tab || "players"; // Default to "players" if no stored tab
  } catch (error) {
    console.error(`Error getting active tab:`, error);
    return "players";
  }
};
