
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ShieldCheck, Goal, BarChart } from "lucide-react";

interface MatchStatsCardProps {
  matchStats: {
    total: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    cleanSheets: number;
  };
}

export function MatchStatsCard({ matchStats }: MatchStatsCardProps) {
  // Calculate win percentage
  const winPercentage = matchStats.total > 0 
    ? Math.round((matchStats.wins / matchStats.total) * 100)
    : 0;
    
  // Calculate average goals per match
  const avgGoalsFor = matchStats.total > 0
    ? (matchStats.goalsScored / matchStats.total).toFixed(1)
    : "0";
    
  const avgGoalsAgainst = matchStats.total > 0
    ? (matchStats.goalsConceded / matchStats.total).toFixed(1)
    : "0";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 border-b bg-slate-50">
        <CardTitle className="text-lg flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-amber-500" />
          Matchstatistik
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex mb-4 justify-center">
          <div className="text-center px-4">
            <div className="text-3xl font-bold text-primary">{matchStats.total}</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Matcher</div>
          </div>
          
          <div className="border-l"></div>
          
          <div className="text-center px-4">
            <div className="text-3xl font-bold text-green-600">{winPercentage}%</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vinst %</div>
          </div>
          
          <div className="border-l"></div>
          
          <div className="text-center px-4">
            <div className="text-3xl font-bold text-blue-600">{matchStats.cleanSheets}</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nollor</div>
          </div>
        </div>
      
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-2 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-center justify-center mb-1 text-green-700">
              <Trophy className="h-4 w-4 mr-1" />
              <span className="font-medium">Vinster</span>
            </div>
            <div className="text-2xl font-bold text-center text-green-700">{matchStats.wins}</div>
          </div>
          
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex items-center justify-center mb-1 text-amber-700">
              <ShieldCheck className="h-4 w-4 mr-1" />
              <span className="font-medium">Oavgjorda</span>
            </div>
            <div className="text-2xl font-bold text-center text-amber-700">{matchStats.draws}</div>
          </div>
          
          <div className="p-2 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-center justify-center mb-1 text-red-700">
              <BarChart className="h-4 w-4 mr-1" />
              <span className="font-medium">Förluster</span>
            </div>
            <div className="text-2xl font-bold text-center text-red-700">{matchStats.losses}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-center mb-1 text-blue-600">
              <Goal className="h-4 w-4 mr-1" />
              <span className="font-medium text-sm">Mål för</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">{matchStats.goalsScored}</span>
              <span className="text-xs text-muted-foreground ml-2">({avgGoalsFor}/match)</span>
            </div>
          </div>
          
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-center mb-1 text-rose-600">
              <Goal className="h-4 w-4 mr-1" />
              <span className="font-medium text-sm">Mål mot</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-rose-600">{matchStats.goalsConceded}</span>
              <span className="text-xs text-muted-foreground ml-2">({avgGoalsAgainst}/match)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
