
import React from 'react';
import { Player, Activity } from "@/types/player";
import { MatchStatisticsOverview } from './components/MatchStatisticsOverview';
import { TopGoalScorers } from './components/TopGoalScorers';
import { LeagueStatistics } from './components/LeagueStatistics';

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (player: Player) => void;
}

export function OverviewTabContent({ players, activities, onPlayerSelect }: OverviewTabContentProps) {
  // Filter match activities
  const matches = activities.filter(activity => String(activity.type) === "match");
  
  // Handle player click
  const handlePlayerClick = (playerId: string) => {
    if (onPlayerSelect) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        onPlayerSelect(player);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Match Statistics */}
      <MatchStatisticsOverview 
        activities={matches} 
        className="md:col-span-2" 
      />

      {/* Top Goal Scorers */}
      <TopGoalScorers 
        matches={matches} 
        players={players} 
        onPlayerClick={handlePlayerClick} 
      />

      {/* Leagues statistics */}
      <LeagueStatistics 
        activities={activities}
        players={players} 
        onPlayerClick={handlePlayerClick} 
      />
    </div>
  );
}
