
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Player } from "@/types/player";

interface PlayerParticipationTableProps {
  players: Player[];
  activities: Activity[];
  className?: string;
}

export function PlayerParticipationTable({ players, activities, className = "md:col-span-2" }: PlayerParticipationTableProps) {
  // Calculate participation per player
  const playerParticipation = React.useMemo(() => {
    return players
      .filter(player => !player.positions?.includes("TRÄNARE"))
      .map(player => {
        const participatedActivities = activities.filter(activity => 
          activity.participants?.includes(player.id)
        );
        
        const matchesParticipated = participatedActivities.filter(a => 
          a.type === 'match'
        ).length;
        
        const cupsParticipated = participatedActivities.filter(a => 
          a.type === 'cup'
        ).length;
        
        return {
          playerId: player.id,
          name: player.name,
          grade: player.grade,
          totalActivities: participatedActivities.length,
          matches: matchesParticipated,
          cups: cupsParticipated,
          participationRate: activities.length > 0
            ? Math.round((participatedActivities.length / activities.length) * 100)
            : 0
        };
      })
      .sort((a, b) => b.totalActivities - a.totalActivities);
  }, [activities, players]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Topplista deltagande</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <div className="grid grid-cols-5 font-semibold p-3 border-b">
            <div>Namn</div>
            <div className="text-center">Nivå</div>
            <div className="text-center">Aktiviteter</div>
            <div className="text-center">Matcher</div>
            <div className="text-center">Cuper</div>
          </div>
          <div className="divide-y">
            {playerParticipation.slice(0, 20).map(player => (
              <div key={player.playerId} className="grid grid-cols-5 p-3">
                <div>{player.name}</div>
                <div className="text-center">{player.grade}</div>
                <div className="text-center font-semibold">{player.totalActivities}</div>
                <div className="text-center">{player.matches}</div>
                <div className="text-center">{player.cups}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
