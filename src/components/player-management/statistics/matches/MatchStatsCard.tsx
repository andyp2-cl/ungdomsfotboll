
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ShieldCheck } from "lucide-react";

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
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-amber-500" />
          Matchstatistik
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-md bg-muted/50">
            <dt className="text-sm font-medium">Matcher</dt>
            <dd className="text-2xl font-bold">{matchStats.total}</dd>
          </div>
          
          <div className="p-2 rounded-md bg-green-50">
            <dt className="text-sm font-medium text-green-700">Vinster</dt>
            <dd className="text-2xl font-bold text-green-700">{matchStats.wins}</dd>
          </div>
          
          <div className="p-2 rounded-md bg-amber-50">
            <dt className="text-sm font-medium text-amber-700">Oavgjorda</dt>
            <dd className="text-2xl font-bold text-amber-700">{matchStats.draws}</dd>
          </div>
          
          <div className="p-2 rounded-md bg-red-50">
            <dt className="text-sm font-medium text-red-700">Förluster</dt>
            <dd className="text-2xl font-bold text-red-700">{matchStats.losses}</dd>
          </div>
          
          <div className="p-2 rounded-md bg-blue-50">
            <dt className="text-sm font-medium text-blue-700">Gjorda mål</dt>
            <dd className="text-2xl font-bold text-blue-700">{matchStats.goalsScored}</dd>
          </div>
          
          <div className="p-2 rounded-md bg-rose-50">
            <dt className="text-sm font-medium text-rose-700">Insläppta mål</dt>
            <dd className="text-2xl font-bold text-rose-700">{matchStats.goalsConceded}</dd>
          </div>
          
          <div className="col-span-2 p-2 rounded-md bg-emerald-50">
            <dt className="text-sm font-medium text-emerald-700 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1" />
              Nollor
            </dt>
            <dd className="text-2xl font-bold text-emerald-700">{matchStats.cleanSheets}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
