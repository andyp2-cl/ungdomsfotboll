import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Trophy, Target, Award } from "lucide-react";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";

interface KPISectionProps {
  players: Player[];
  activities: Activity[];
  isMobile?: boolean;
}

export function KPISection({ players, activities, isMobile = false }: KPISectionProps) {
  // Calculate KPI values
  const totalPlayers = players.filter(p => !p.positions?.includes("TRÄNARE")).length;
  const totalActivities = activities.length;
  const matchActivities = activities.filter(a => a.type === "match");
  
  // Only include played matches (date in the past)
  const playedMatches = activities.filter(a => {
    if (a.type !== "match") return false;
    const activityDate = new Date(a.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activityDate < today;
  });

  // Calculate total goals scored by team (home/away logic)
  const totalGoals = playedMatches.reduce((sum, match) => {
    const isHome = match.homeTeam?.toLowerCase().includes('hässleholms if');
    return sum + (isHome ? (match.homeScore || 0) : (match.awayScore || 0));
  }, 0);
  
  // Calculate win rate
  const wins = playedMatches.filter(match => match.isWin === true).length;
  const winRate = playedMatches.length > 0 ? Math.round((wins / playedMatches.length) * 100) : 0;
  
  // Calculate average teammates
  const totalTeammates = players
    .filter(player => !player.positions?.includes("TRÄNARE"))
    .reduce((sum, player) => {
      return sum + calculateUniqueTeammates(player.id, activities);
    }, 0);
  
  const averageTeammates = players.length > 0 
    ? Math.round(totalTeammates / players.length) 
    : 0;

  const kpiData = [
    {
      label: "Totalt antal spelare",
      value: totalPlayers,
      icon: Users,
      subtext: "Aktiva spelare"
    },
    {
      label: "Antal matcher",
      value: playedMatches.length,
      icon: Calendar,
      subtext: "Genomförda matcher"
    },
    {
      label: "Vinstprocent",
      value: `${winRate}%`,
      icon: Trophy,
      subtext: `${wins} vinster av ${playedMatches.length}`
    },
    {
      label: "Mål gjorda",
      value: totalGoals,
      icon: Target,
      subtext: `${(totalGoals / playedMatches.length).toFixed(1)} per match`
    },
    {
      label: "Snitt antal medspelare",
      value: averageTeammates,
      icon: Award,
      subtext: "Unika medspelare per spelare"
    }
  ];

  const gridCols = isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {kpiData.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">
                {kpi.label}
              </div>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">
              {kpi.subtext}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
