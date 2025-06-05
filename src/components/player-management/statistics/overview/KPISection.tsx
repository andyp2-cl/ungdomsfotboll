
import React from "react";
import { Player, Activity } from "@/types/player";
import { Users, Calendar, TrendingUp, Trophy, Target, Award } from "lucide-react";
import { KPICard } from "./KPICard";

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
  
  // Calculate total goals scored by team
  const totalGoals = matchActivities.reduce((sum, match) => sum + (match.homeScore || 0), 0);
  
  // Calculate win rate
  const wins = matchActivities.filter(match => match.isWin === true).length;
  const winRate = matchActivities.length > 0 ? Math.round((wins / matchActivities.length) * 100) : 0;
  
  // Calculate average attendance
  const totalParticipations = players
    .filter(p => !p.positions?.includes("TRÄNARE"))
    .reduce((sum, player) => {
      const participations = activities.filter(activity => 
        activity.participants?.includes(player.id)
      ).length;
      return sum + participations;
    }, 0);
  
  const averageAttendance = totalPlayers > 0 && totalActivities > 0 
    ? Math.round((totalParticipations / (totalPlayers * totalActivities)) * 100)
    : 0;

  // Find most active grade
  const gradeActivity = ['A', 'B', 'C', 'D'].map(grade => {
    const gradePlayers = players.filter(p => p.grade === grade && !p.positions?.includes("TRÄNARE"));
    const gradeParticipations = gradePlayers.reduce((sum, player) => {
      return sum + activities.filter(activity => 
        activity.participants?.includes(player.id)
      ).length;
    }, 0);
    
    const average = gradePlayers.length > 0 ? gradeParticipations / gradePlayers.length : 0;
    return { grade, average };
  });
  
  const mostActiveGrade = gradeActivity.reduce((max, current) => 
    current.average > max.average ? current : max
  );

  // Calculate goals per match
  const goalsPerMatch = matchActivities.length > 0 
    ? (totalGoals / matchActivities.length).toFixed(1)
    : "0.0";

  const gridCols = isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-6";

  return (
    <div className={`grid ${gridCols} gap-4 mb-6`}>
      <KPICard
        title="Totalt antal spelare"
        value={totalPlayers}
        icon={Users}
        description="Aktiva spelare"
        className="hover:shadow-md transition-shadow"
      />
      <KPICard
        title="Antal matcher"
        value={matchActivities.length}
        icon={Calendar}
        description="Genomförda matcher"
        className="hover:shadow-md transition-shadow"
      />
      <KPICard
        title="Vinstprocent"
        value={`${winRate}%`}
        icon={Trophy}
        description={`${wins} vinster av ${matchActivities.length}`}
        className="hover:shadow-md transition-shadow"
      />
      <KPICard
        title="Mål gjorda"
        value={totalGoals}
        icon={Target}
        description={`${goalsPerMatch} per match`}
        className="hover:shadow-md transition-shadow"
      />
      <KPICard
        title="Genomsnittlig närvaro"
        value={`${averageAttendance}%`}
        icon={TrendingUp}
        description="Av alla aktiviteter"
        className="hover:shadow-md transition-shadow"
      />
      <KPICard
        title="Mest aktiva nivå"
        value={mostActiveGrade.grade}
        icon={Award}
        description={`${Math.round(mostActiveGrade.average * 10) / 10} aktiviteter/spelare`}
        className="hover:shadow-md transition-shadow"
      />
    </div>
  );
}
