
import { useState, useEffect } from 'react';
import { Player, Activity } from '@/types/player';
import { TeamSelectionData, MatchConflict, PlayerTrainingOverview } from '@/types/training';
import { calculatePlayerTrainingOverview } from '@/lib/supabase/trainingStats';
import { isActivityInPast } from '@/utils/activity/dateUtils';

export function useTeamSelection(players: Player[], activities: Activity[]) {
  const [teamSelectionData, setTeamSelectionData] = useState<TeamSelectionData>({
    upcomingMatches: [],
    playerStats: [],
    conflicts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeamSelectionData = async () => {
      setIsLoading(true);
      
      try {
        // Filtrera kommande matcher
        const upcomingMatches = activities.filter(activity => 
          activity.type === 'match' && !isActivityInPast(activity.date, activity.time)
        );
        
        // Beräkna spelarstatistik
        const playerStats = await calculatePlayerTrainingOverview(players, activities);
        
        // Identifiera konflikter
        const conflicts = detectMatchConflicts(upcomingMatches, players);
        
        setTeamSelectionData({
          upcomingMatches,
          playerStats,
          conflicts
        });
      } catch (error) {
        console.error('Error loading team selection data:', error);
      }
      
      setIsLoading(false);
    };

    if (players.length > 0 && activities.length > 0) {
      loadTeamSelectionData();
    }
  }, [players, activities]);

  const detectMatchConflicts = (matches: Activity[], players: Player[]): MatchConflict[] => {
    const conflicts: MatchConflict[] = [];
    
    // Gruppera matcher per dag
    const matchesByDate: Record<string, Activity[]> = {};
    matches.forEach(match => {
      const date = match.date;
      if (!matchesByDate[date]) {
        matchesByDate[date] = [];
      }
      matchesByDate[date].push(match);
    });
    
    // Hitta spelare som har flera matcher samma dag
    Object.entries(matchesByDate).forEach(([date, dayMatches]) => {
      if (dayMatches.length > 1) {
        players.forEach(player => {
          const playerMatches = dayMatches.filter(match => 
            match.participants?.includes(player.id)
          );
          
          if (playerMatches.length > 1) {
            conflicts.push({
              playerId: player.id,
              playerName: player.name,
              conflictingMatches: playerMatches,
              reason: 'same_day'
            });
          }
        });
      }
    });
    
    return conflicts;
  };

  const suggestOptimalLineup = (match: Activity): Player[] => {
    const matchDate = new Date(match.date);
    const relevantPlayerStats = teamSelectionData.playerStats.filter(stat => {
      const player = players.find(p => p.id === stat.playerId);
      return player && player.isActive !== false;
    });
    
    // Sortera spelare baserat på träning/match-ratio och prestanda
    const sortedPlayers = relevantPlayerStats
      .sort((a, b) => {
        // Prioritera spelare med hög träning/match-ratio
        const ratioWeight = (b.trainingMatchRatio - a.trainingMatchRatio) * 2;
        // Lägg till prestanda som sekundär faktor
        const performanceWeight = (b.averagePerformance || 0) - (a.averagePerformance || 0);
        return ratioWeight + performanceWeight;
      })
      .slice(0, 11) // Ta de 11 bästa spelarna
      .map(stat => players.find(p => p.id === stat.playerId)!)
      .filter(Boolean);
    
    return sortedPlayers;
  };

  return {
    teamSelectionData,
    isLoading,
    suggestOptimalLineup,
    detectMatchConflicts
  };
}
