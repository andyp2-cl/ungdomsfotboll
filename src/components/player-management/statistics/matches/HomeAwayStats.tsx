
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsData {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  conceded: number;
}

interface HomeAwayStatsProps {
  homeStats: StatsData;
  awayStats: StatsData;
}

export function HomeAwayStats({ homeStats, awayStats }: HomeAwayStatsProps) {
  const StatsCard = ({ title, stats, colorClass }: { title: string; stats: StatsData; colorClass: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className={colorClass}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Matcher</span>
            <span className="font-bold">{stats.matches}</span>
          </div>
          <div className="flex justify-between">
            <span>Vinster</span>
            <span className="font-bold text-green-600">{stats.wins}</span>
          </div>
          <div className="flex justify-between">
            <span>Oavgjorda</span>
            <span className="font-bold text-yellow-600">{stats.draws}</span>
          </div>
          <div className="flex justify-between">
            <span>Förluster</span>
            <span className="font-bold text-red-600">{stats.losses}</span>
          </div>
          <div className="flex justify-between">
            <span>Mål gjorda</span>
            <span className="font-bold">{stats.goals}</span>
          </div>
          <div className="flex justify-between">
            <span>Mål insläppta</span>
            <span className="font-bold">{stats.conceded}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span>Vinstprocent</span>
            <span className={`font-bold ${colorClass}`}>
              {stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatsCard title="Hemmastatistik" stats={homeStats} colorClass="text-green-600" />
      <StatsCard title="Bortastatistik" stats={awayStats} colorClass="text-blue-600" />
    </div>
  );
}
