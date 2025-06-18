import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Activity } from "@/types/player";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";

interface UniqueTeammatesCardProps {
  playerId: string;
  activities: Activity[];
  className?: string;
}

export function UniqueTeammatesCard({ playerId, activities, className = "" }: UniqueTeammatesCardProps) {
  const uniqueTeammatesCount = calculateUniqueTeammates(playerId, activities);
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Unika Medspelare</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{uniqueTeammatesCount}</div>
        <p className="text-xs text-muted-foreground">
          olika spelare i matcher
        </p>
      </CardContent>
    </Card>
  );
} 