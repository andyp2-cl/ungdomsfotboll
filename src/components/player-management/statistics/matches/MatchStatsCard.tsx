
import React from "react";
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateMatchStats } from "./utils/calculateMatchStats";

interface MatchStatsCardProps {
  activities: Activity[];
  className?: string;
}

export function MatchStatsCard({ activities, className = "" }: MatchStatsCardProps) {
  // Only consider match type activities
  const matches = activities.filter(activity => activity.type === "match");
  
  // Calculate the match statistics
  const {
    totalMatches,
    wins,
    draws,
    losses,
    goalsScored,
    goalsConceded,
    cleanSheets
  } = calculateMatchStats(matches);
  
  // Calculate percentages
  const winPercentage = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const drawPercentage = totalMatches > 0 ? Math.round((draws / totalMatches) * 100) : 0;
  const lossPercentage = totalMatches > 0 ? Math.round((losses / totalMatches) * 100) : 0;
  const cleanSheetPercentage = totalMatches > 0 ? Math.round((cleanSheets / totalMatches) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Matchstatistik</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Matcher</p>
            <p className="text-2xl font-bold">{totalMatches}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-green-600">Vinster</p>
            <p className="text-2xl font-bold">{wins} <span className="text-sm text-muted-foreground">({winPercentage}%)</span></p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-600">Oavgjorda</p>
            <p className="text-2xl font-bold">{draws} <span className="text-sm text-muted-foreground">({drawPercentage}%)</span></p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-600">Förluster</p>
            <p className="text-2xl font-bold">{losses} <span className="text-sm text-muted-foreground">({lossPercentage}%)</span></p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Gjorda mål</p>
            <p className="text-2xl font-bold">{goalsScored}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Insläppta mål</p>
            <p className="text-2xl font-bold">{goalsConceded}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Hållna nollor</p>
            <p className="text-2xl font-bold">{cleanSheets} <span className="text-sm text-muted-foreground">({cleanSheetPercentage}%)</span></p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Mål per match</p>
            <p className="text-2xl font-bold">{totalMatches > 0 ? (goalsScored / totalMatches).toFixed(1) : "0"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
