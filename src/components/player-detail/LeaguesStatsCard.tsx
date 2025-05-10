
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LeaguesStatsCardProps {
  player: Player;
  activities: Activity[];
  className?: string;
}

export function LeaguesStatsCard({ player, activities, className }: LeaguesStatsCardProps) {
  const getLeagueMatches = (leagueId: string) => {
    return activities.filter(activity => 
      activity.participants?.includes(player.id) && 
      activity.type === "match" &&
      (activity.leagueId === leagueId || activity.league_id === leagueId)
    ).length;
  };

  // Get unique league IDs for this player
  const leagueIds = activities
    .filter(activity => 
      activity.participants?.includes(player.id) && 
      activity.type === "match" && 
      (activity.leagueId || activity.league_id)
    )
    .map(activity => activity.leagueId || activity.league_id)
    .filter((value, index, self) => value && self.indexOf(value) === index);

  return (
    <Card className={cn(className)}>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Ligor</CardTitle>
      </CardHeader>
      <CardContent>
        {leagueIds.length > 0 ? (
          <div className="space-y-2">
            {leagueIds.map((leagueId, index) => (
              <div key={leagueId || index} className="flex justify-between">
                <span className="text-muted-foreground">Liga {index + 1}:</span>
                <span className="font-medium">{getLeagueMatches(leagueId!)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            Inga ligamatcher registrerade
          </div>
        )}
      </CardContent>
    </Card>
  );
}
