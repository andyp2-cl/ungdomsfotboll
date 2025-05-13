import { supabase } from './client';
import { Player } from '@/types/player';
import { v4 as uuidv4 } from 'uuid';
import { formatPlayerForDatabase, formatDatabasePlayer } from "@/utils/database/formatters/player";

// Function to fetch players from Supabase
export const fetchPlayers = async (): Promise<Player[]> => {
  try {
    console.log('Fetching players from Supabase...');
    
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error('Error fetching players:', playersError);
      throw playersError;
    }
    
    console.log("Raw player data from database:", playersData);
    
    if (!playersData || playersData.length === 0) {
      console.warn('No players found in database!');
      return [];
    }
    
    // Transform raw database players to our application format
    const players = playersData.map(player => {
      return formatDatabasePlayer(player);
    });
    
    console.log(`Transformed ${players.length} players from database format`);
    
    // Debug: Check development data after transform
    if (players.length > 0) {
      console.log('Sample player development data after transform:', 
        JSON.stringify(players[0].development));
    }
    
    // Then, get player-activity relationships and populate the activities array
    const { data: playerActivitiesData, error: relationshipError } = await supabase
      .from('player_activities')
      .select('*');
    
    if (relationshipError) {
      console.error("Error fetching player activities:", relationshipError);
    } else if (playerActivitiesData) {
      // Populate activities for each player
      players.forEach(player => {
        const playerActivityRelations = playerActivitiesData.filter(pa => pa.player_id === player.id);
        player.activities = playerActivityRelations.map(relation => relation.activity_id);
      });
    }
    
    return players;
  } catch (error) {
    console.error('Error in fetchPlayers:', error);
    return [];
  }
};
