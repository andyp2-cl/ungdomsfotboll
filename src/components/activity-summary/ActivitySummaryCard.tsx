import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Activity, Player } from "@/types/player";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";

interface ActivitySummaryCardProps {
  activities: Activity[];
  players: Player[];
  className?: string;
}

export function ActivitySummaryCard({ activities, players, className = "" }: ActivitySummaryCardProps) {
  const uniqueTeammatesCount = calculateUniqueTeammates(players[0]?.id || "", activities);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Antal medspelare
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{uniqueTeammatesCount}</div>
        <p className="text-sm text-muted-foreground">Unika medspelare totalt</p>
      </CardContent>
    </Card>
  );
} 