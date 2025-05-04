
import React, { useMemo } from 'react';
import { Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Award, ShieldCheck, Clock, Calendar, Percent } from "lucide-react";
import { calculateMatchStats } from "@/components/player-management/statistics/matches/utils/calculateMatchStats";

interface MatchStatisticsOverviewProps {
  activities: Activity[];
  className?: string;
}

export function MatchStatisticsOverview({ activities, className = "" }: MatchStatisticsOverviewProps) {
  // Filter to ensure we only process match activities
  const matches = useMemo(() => activities.filter(activity => activity.type === "match"), [activities]);
  
  console.log(`MatchStatisticsOverview: Found ${matches.length} matches out of ${activities.length} activities`);
  
  // Calculate overall match statistics
  const matchStats = useMemo(() => calculateMatchStats(matches), [matches]);
  
  console.log("MatchStatisticsOverview: Calculated stats:", matchStats);
  
  // If no match data, show placeholder
  if (matches.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Matchstatistik
          </CardTitle>
          <CardDescription>Översikt över lagets totala matchresultat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center">
              Ingen matchstatistik tillgänglig. Se till att det finns matcher med resultat i systemet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Matchstatistik
        </CardTitle>
        <CardDescription>Översikt över lagets totala matchresultat</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-700" />
              <p className="text-sm font-medium text-slate-700">Matcher</p>
            </div>
            <p className="text-2xl font-bold mt-2">{matchStats.totalMatches}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-600">Vinster</p>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-700">
              {matchStats.wins} 
              <span className="text-sm ml-1 text-green-500">
                ({matchStats.totalMatches > 0 ? Math.round((matchStats.wins / matchStats.totalMatches) * 100) : 0}%)
              </span>
            </p>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-600">Oavgjorda</p>
            </div>
            <p className="text-2xl font-bold mt-2 text-amber-700">
              {matchStats.draws} 
              <span className="text-sm ml-1 text-amber-500">
                ({matchStats.totalMatches > 0 ? Math.round((matchStats.draws / matchStats.totalMatches) * 100) : 0}%)
              </span>
            </p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-600">Förluster</p>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-700">
              {matchStats.losses} 
              <span className="text-sm ml-1 text-red-500">
                ({matchStats.totalMatches > 0 ? Math.round((matchStats.losses / matchStats.totalMatches) * 100) : 0}%)
              </span>
            </p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-slate-700">Gjorda mål</p>
            </div>
            <p className="text-2xl font-bold mt-2">{matchStats.goalsScored}</p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <p className="text-sm font-medium text-slate-700">Insläppta mål</p>
            </div>
            <p className="text-2xl font-bold mt-2">{matchStats.goalsConceded}</p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium text-slate-700">Hållna nollor</p>
            </div>
            <p className="text-2xl font-bold mt-2">
              {matchStats.cleanSheets} 
              <span className="text-sm ml-1 text-slate-500">
                ({matchStats.totalMatches > 0 ? Math.round((matchStats.cleanSheets / matchStats.totalMatches) * 100) : 0}%)
              </span>
            </p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <p className="text-sm font-medium text-slate-700">Mål per match</p>
            </div>
            <p className="text-2xl font-bold mt-2">{matchStats.totalMatches > 0 ? (matchStats.goalsScored / matchStats.totalMatches).toFixed(1) : "0"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
