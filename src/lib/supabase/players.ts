
import { supabase } from './client';
import { Player } from '@/types/player';

// Function to fetch players from Supabase
export const fetchPlayers = async (): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*');
    
    if (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
    
    // Debug: List all player names from database to help diagnose issues
    if (data) {
      console.log(`Fetched ${data.length} players from database:`);
      console.log('Player names:', data.map(p => p.name).join(', '));
      
      // Specifically check for Alvin
      const hasAlvin = data.some(p => p.name?.toLowerCase().includes('alvin'));
      console.log('Supabase query results contain Alvin:', hasAlvin);
      
      if (!hasAlvin) {
        console.warn('WARNING: Alvin not found in database results!');
      }
    } else {
      console.warn('No players found in database!');
    }
    
    // Transform the database format to our application format
    const players = (data || []).map(player => ({
      id: player.id,
      name: player.name,
      grade: player.grade as any,
      positions: player.position ? [player.position as any] : undefined,
      jerseyNumber: player.jersey_number || undefined,
      image: player.image || undefined,
      activities: [] // We'll fetch activities separately
    }));
    
    // Debug: Check for specific players after transformation
    const hasAlvinAfterTransform = players.some(p => p.name?.toLowerCase().includes('alvin'));
    console.log('Transformed players contains Alvin:', hasAlvinAfterTransform);
    
    return players;
  } catch (error) {
    console.error('Error in fetchPlayers:', error);
    return [];
  }
};
