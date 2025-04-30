
import React from 'react';
import { Player, Activity } from "@/types/player";
import { MatchStatisticsOverview } from './components/MatchStatisticsOverview';
import { LeagueStatistics } from './components/LeagueStatistics';
import { LeaguePieCharts } from './components/LeaguePieCharts';

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (player: Player) => void;
}

export function OverviewTabContent({ players, activities, onPlayerSelect }: OverviewTabContentProps) {
  // Filter match activities - exclude future matches for statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day
  
  // All matches (including future ones)
  const allMatches = activities.filter(activity => String(activity.type) === "match");
  
  // Historical matches only (for statistics)
  const historicalMatches = allMatches.filter(match => {
    const matchDate = new Date(match.date);
    return matchDate <= today;
  });

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Overall Match Statistics */}
      <MatchStatisticsOverview 
        activities={historicalMatches} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* League Pie Charts */}
        <LeaguePieCharts
          activities={activities}
          players={players}
          onPlayerClick={playerId => {
            if (onPlayerSelect) {
              const player = players.find(p => p.id === playerId);
              if (player) {
                onPlayerSelect(player);
              }
            }
          }}
        />

        {/* Leagues statistics */}
        <LeagueStatistics 
          activities={activities}
          players={players} 
          onPlayerClick={playerId => {
            if (onPlayerSelect) {
              const player = players.find(p => p.id === playerId);
              if (player) {
                onPlayerSelect(player);
              }
            }
          }} 
        />
      </div>
    </div>
  );
}
