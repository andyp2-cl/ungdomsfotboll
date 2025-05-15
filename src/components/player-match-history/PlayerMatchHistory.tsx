
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerMatchTabs } from './PlayerMatchTabs';

interface PlayerMatchHistoryProps {
  player: Player;
  activities: Activity[];
  onActivitySelect: (activity: Activity) => void;
}

export function PlayerMatchHistory({ player, activities, onActivitySelect }: PlayerMatchHistoryProps) {
  // Find activities that this player participated in and sort by date (newest first)
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Spelarhistorik</CardTitle>
      </CardHeader>
      <CardContent>
        <PlayerMatchTabs 
          player={player} 
          playerActivities={playerActivities} 
          onActivitySelect={onActivitySelect} 
        />
      </CardContent>
    </Card>
  );
}
