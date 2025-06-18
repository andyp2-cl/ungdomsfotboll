import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getGradeColor } from '@/utils/gradeUtils';
import { Activity, Player } from "@/types/player";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";

interface GradeData {
  grade: string;
  players: number;
}

interface PlayerSummaryCardProps {
  data: GradeData[];
  players: Player[];
  activities: Activity[];
}

export function PlayerSummaryCard({ data, players, activities }: PlayerSummaryCardProps) {
  // Sort data by grade
  const sortedData = [...data].sort((a, b) => a.grade.localeCompare(b.grade));
  
  // Calculate average number of teammates
  const totalTeammates = players
    .filter(player => !player.positions?.includes("TRÄNARE"))
    .reduce((sum, player) => {
      return sum + calculateUniqueTeammates(player.id, activities);
    }, 0);
  
  const averageTeammates = players.length > 0 
    ? Math.round(totalTeammates / players.length) 
    : 0;
  
  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-5 w-5" />
          Spelarsammanfattning
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Genomsnittligt antal medspelare</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
            <span className="text-3xl font-bold">{averageTeammates}</span>
            <span className="text-sm text-muted-foreground">Snitt antal medspelare</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
