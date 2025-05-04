
import React from 'react';
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateMatchStatistics } from "./utils/calculateMatchStats";

interface MatchStatsCardProps {
  activities: Activity[];
}

export function MatchStatsCard({ activities }: MatchStatsCardProps) {
  // Filter to only match activities and ensure we have valid data
  const matchActivities = activities.filter(a => a.type === 'match');
  
  console.log(`MatchStatsCard received ${matchActivities.length} match activities`);
  
  // Calculate match statistics
  const stats = calculateMatchStatistics(matchActivities);
  
  console.log("Calculated match statistics:", stats);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Matchstatistik</CardTitle>
      </CardHeader>
      <CardContent>
        {matchActivities.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            Ingen matchdata tillgänglig
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-md p-3 text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Matcher</div>
            </div>
            <div className="border rounded-md p-3 text-center bg-green-50">
              <div className="text-3xl font-bold text-green-600">{stats.wins}</div>
              <div className="text-sm text-muted-foreground">Vinster</div>
            </div>
            <div className="border rounded-md p-3 text-center bg-gray-50">
              <div className="text-3xl font-bold text-gray-600">{stats.draws}</div>
              <div className="text-sm text-muted-foreground">Oavgjorda</div>
            </div>
            <div className="border rounded-md p-3 text-center bg-red-50">
              <div className="text-3xl font-bold text-red-600">{stats.losses}</div>
              <div className="text-sm text-muted-foreground">Förluster</div>
            </div>
            <div className="border rounded-md p-3 text-center col-span-2 md:col-span-2">
              <div className="text-xl font-bold text-green-600">{stats.goalsFor}</div>
              <div className="text-sm text-muted-foreground">Gjorda mål</div>
            </div>
            <div className="border rounded-md p-3 text-center col-span-2 md:col-span-2">
              <div className="text-xl font-bold text-red-600">{stats.goalsAgainst}</div>
              <div className="text-sm text-muted-foreground">Insläppta mål</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
