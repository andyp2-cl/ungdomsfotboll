
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
    
    // Transform the database format to our application format
    return (data || []).map(player => ({
      id: player.id,
      name: player.name,
      grade: player.grade as any,
      positions: player.position ? [player.position as any] : undefined,
      jerseyNumber: player.jersey_number || undefined,
      image: player.image || undefined,
      activities: [] // We'll fetch activities separately
    }));
  } catch (error) {
    console.error('Error in fetchPlayers:', error);
    return [];
  }
};
