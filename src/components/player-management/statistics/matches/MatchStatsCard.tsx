import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { Activity } from "@/types/player";

interface MatchStatsCardProps {
  activities: Activity[];
  className?: string;
}

export function MatchStatsCard({ activities, className = "" }: MatchStatsCardProps) {
  // Calculate match statistics from activities
  const matchStats = useMemo(() => {
    const stats = {
      total: activities.length,
      wins: activities.filter(a => a.isWin === true).length,
      draws: activities.filter(a => a.homeScore === a.awayScore).length,
      losses: activities.filter(a => a.isWin === false && a.homeScore !== a.awayScore).length,
      goalsScored: 0,
      goalsConceded: 0,
      cleanSheets: 0
    };
    
    // Calculate goals scored, conceded, and clean sheets based on home/away team
    activities.forEach(activity => {
      const isHome = activity.homeTeam?.toLowerCase().includes('hässleholms if');
      const homeScore = activity.homeScore || 0;
      const awayScore = activity.awayScore || 0;
      
      if (isHome) {
        // Hässleholms IF is playing at home
        stats.goalsScored += homeScore;
        stats.goalsConceded += awayScore;
        if (awayScore === 0) {
          stats.cleanSheets++;
        }
      } else {
        // Hässleholms IF is playing away
        stats.goalsScored += awayScore;
        stats.goalsConceded += homeScore;
        if (homeScore === 0) {
          stats.cleanSheets++;
        }
      }
    });
    
    // Calculate additional stats
    const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
    const avgGoalsFor = stats.total > 0 ? (stats.goalsScored / stats.total).toFixed(1) : "0.0";
    const avgGoalsAgainst = stats.total > 0 ? (stats.goalsConceded / stats.total).toFixed(1) : "0.0";
    const goalDifference = stats.goalsScored - stats.goalsConceded;
    
    return { ...stats, winRate, avgGoalsFor, avgGoalsAgainst, goalDifference };
  }, [activities]);

  return (
    <Card className={`${className} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-amber-500" />
          Matchstatistik
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-blue-700">Matcher</dt>
                <dd className="text-xl font-bold text-blue-800">{matchStats.total}</dd>
              </div>
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-green-700">Vinstprocent</dt>
                <dd className="text-xl font-bold text-green-800">{matchStats.winRate}%</dd>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-orange-700">Mål gjorda</dt>
                <dd className="text-xl font-bold text-orange-800">{matchStats.goalsScored}</dd>
                <dd className="text-xs text-orange-600">Ø {matchStats.avgGoalsFor}/match</dd>
              </div>
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-red-700">Mål insläppta</dt>
                <dd className="text-xl font-bold text-red-800">{matchStats.goalsConceded}</dd>
                <dd className="text-xs text-red-600">Ø {matchStats.avgGoalsAgainst}/match</dd>
              </div>
              <ShieldCheck className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Goal difference summary */}
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Målskillnad</span>
            <span className={`text-lg font-bold ${
              matchStats.goalDifference > 0 ? 'text-green-600' : 
              matchStats.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {matchStats.goalDifference > 0 ? '+' : ''}{matchStats.goalDifference}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {matchStats.goalsScored} gjorda - {matchStats.goalsConceded} insläppta
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
