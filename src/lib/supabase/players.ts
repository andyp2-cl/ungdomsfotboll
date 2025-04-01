
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
    
    // Debug: Check for specific players in DB query results
    const hasAlvin = data?.some(p => p.name?.includes('Alvin'));
    console.log('Supabase query results contain Alvin:', hasAlvin);
    
    if (data?.length > 0 && data.length < 50) {
      console.log('All players in DB:', data.map(p => p.name).join(', '));
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
    const hasAlvinAfterTransform = players.some(p => p.name?.includes('Alvin'));
    console.log('Transformed players contains Alvin:', hasAlvinAfterTransform);
    
    return players;
  } catch (error) {
    console.error('Error in fetchPlayers:', error);
    return [];
  }
};
