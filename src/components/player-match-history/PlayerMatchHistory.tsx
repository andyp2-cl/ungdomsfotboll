
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerMatchTabs } from './PlayerMatchTabs';

interface PlayerMatchHistoryProps {
  player: Player;
  activities: Activity[];
  onActivitySelect: (activity: Activity) => void;
  allPlayers?: Player[];
}

export function PlayerMatchHistory({ 
  player, 
  activities, 
  onActivitySelect, 
  allPlayers = [] 
}: PlayerMatchHistoryProps) {
  // Filter activities where this player participated
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Spelarhistorik</CardTitle>
      </CardHeader>
      <CardContent>
        <PlayerMatchTabs 
          player={player} 
          playerActivities={playerActivities}
          onActivitySelect={onActivitySelect}
          allPlayers={allPlayers}
          allActivities={activities}
        />
      </CardContent>
    </Card>
  );
}
