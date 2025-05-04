
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchStatsCard } from './matches/MatchStatsCard';
import { PlayerGoalsTable } from './players/PlayerGoalsTable';

interface PerformanceTabContentProps {
  players: Player[];
  activities: Activity[];
  playerStats: any[];
  onPlayerClick?: (playerId: string) => void;
}

export function PerformanceTabContent({ 
  players, 
  activities,
  playerStats,
  onPlayerClick 
}: PerformanceTabContentProps) {
  // Filter to only match activities
  const matchActivities = activities.filter(a => a.type === 'match');
  
  console.log(`PerformanceTabContent received ${matchActivities.length} match activities`);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <MatchStatsCard activities={matchActivities} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Målskyttar</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerGoalsTable 
              players={players}
              activities={matchActivities} 
              onPlayerClick={onPlayerClick}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
