
import { supabase } from './client';
import { Player } from '@/types/player';

// Function to fetch players from Supabase
export const fetchPlayers = async (): Promise<Player[]> => {
  try {
    console.log('Fetching players from Supabase...');
    
    const { data, error } = await supabase
      .from('players')
      .select('*');
    
    if (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
    
    // Debug: List all player names from database to help diagnose issues
    if (data) {
      console.log(`Fetched ${data.length} players from database`);
      
      // Convert names to lowercase for case-insensitive search
      const playerNames = data.map(p => p.name?.toLowerCase() || 'unknown');
      console.log('Player names (lowercase):', playerNames.join(', '));
      
      // Check for specific players in raw data
      const hasAlvin = data.some(p => p.name && p.name.toLowerCase().includes('alvin'));
      console.log('Database contains player named Alvin:', hasAlvin);
      
      if (!hasAlvin) {
        console.warn('WARNING: No players with "Alvin" in their name found in database!');
      }

      // Debug development data
      const playersWithDev = data.filter(p => p.development).length;
      console.log(`Found ${playersWithDev} players with development data`);
      if (data.length > 0 && data[0].development) {
        console.log('Sample development data:', data[0].development);
      }
    } else {
      console.warn('No players found in database!');
    }
    
    // Transform the database format to our application format with more robust error handling
    const players = (data || []).map(player => {
      // Set a default position array if none exists
      let positions;
      if (player.position) {
        positions = Array.isArray(player.position) ? player.position : [player.position as any];
      }
      
      // Parse development data with better error handling
      let developmentData;
      try {
        if (player.development) {
          developmentData = JSON.parse(player.development);
          console.log(`Successfully parsed development data for player ${player.name}`);
        } else {
          console.log(`No development data found for player ${player.name}`);
        }
      } catch (err) {
        console.error(`Error parsing development data for player ${player.name}:`, err);
        developmentData = undefined;
      }
      
      // Default development values
      const defaultDevelopment = {
        technical: 1,
        gameUnderstanding: 1,
        passing: 1,
        offensive: 1,
        defensive: 1,
        mentality: 1
      };
      
      return {
        id: player.id,
        name: player.name,
        grade: player.grade as any,
        positions: positions,
        jerseyNumber: player.jersey_number || undefined,
        image: player.image || undefined,
        activities: [], // We'll fetch activities separately
        development: developmentData || defaultDevelopment
      };
    });
    
    // Debug: Verify the transformation kept all players
    console.log(`Transformed ${players.length} players from database format`);
    
    // Check for specific players after transformation
    const hasAlvinAfterTransform = players.some(p => p.name && p.name.toLowerCase().includes('alvin'));
    console.log('Transformed data contains player named Alvin:', hasAlvinAfterTransform);
    
    if (players.length > 0) {
      const samplePlayerNames = players.slice(0, 5).map(p => p.name);
      console.log('Sample of transformed players:', samplePlayerNames.join(', '));
      console.log('Sample player development data:', players[0].development);
    }
    
    return players;
  } catch (error) {
    console.error('Error in fetchPlayers:', error);
    return [];
  }
};
