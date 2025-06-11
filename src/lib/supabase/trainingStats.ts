
import { supabase } from './client';
import { TrainingStats, PlayerTrainingOverview } from '@/types/training';

export const fetchTrainingStats = async (): Promise<TrainingStats[]> => {
  try {
    const { data, error } = await supabase
      .from('training_stats')
      .select('*')
      .order('training_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching training stats:', error);
      throw error;
    }
    
    return (data || []).map(item => ({
      id: item.id,
      playerId: item.player_id,
      trainingDate: item.training_date,
      trainingType: item.training_type,
      attendance: item.attendance,
      performanceScore: item.performance_score,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Error in fetchTrainingStats:', error);
    return [];
  }
};

export const addTrainingStats = async (trainingStats: Omit<TrainingStats, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<boolean> => {
  try {
    const formattedStats = trainingStats.map(stat => ({
      player_id: stat.playerId,
      training_date: stat.trainingDate,
      training_type: stat.trainingType,
      attendance: stat.attendance,
      performance_score: stat.performanceScore,
      notes: stat.notes
    }));

    const { error } = await supabase
      .from('training_stats')
      .insert(formattedStats);
    
    if (error) {
      console.error('Error adding training stats:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in addTrainingStats:', error);
    return false;
  }
};

export const calculatePlayerTrainingOverview = async (players: any[], activities: any[]): Promise<PlayerTrainingOverview[]> => {
  const trainingStats = await fetchTrainingStats();
  
  return players.map(player => {
    // Räkna träningar för denna spelare
    const playerTrainings = trainingStats.filter(
      stat => stat.playerId === player.id && stat.attendance
    );
    
    // Räkna matcher för denna spelare
    const playerMatches = activities.filter(
      activity => activity.type === 'match' && activity.participants?.includes(player.id)
    );
    
    // Beräkna genomsnittlig prestanda
    const performanceScores = playerTrainings
      .filter(t => t.performanceScore)
      .map(t => t.performanceScore!);
    const averagePerformance = performanceScores.length > 0 
      ? performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length 
      : undefined;
    
    // Senaste träningsdatum
    const lastTraining = playerTrainings.sort((a, b) => 
      new Date(b.trainingDate).getTime() - new Date(a.trainingDate).getTime()
    )[0];
    
    return {
      playerId: player.id,
      playerName: player.name,
      totalTrainings: playerTrainings.length,
      totalMatches: playerMatches.length,
      trainingMatchRatio: playerMatches.length > 0 ? playerTrainings.length / playerMatches.length : playerTrainings.length,
      averagePerformance,
      lastTrainingDate: lastTraining?.trainingDate
    };
  });
};
