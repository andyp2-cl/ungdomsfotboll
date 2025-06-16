import React from "react";
import { Player, Activity } from "@/types/player";
import { Users, Calendar, TrendingUp, Trophy, Target, Award } from "lucide-react";
import { KPICard } from "./KPICard";
import { isHomeMatch } from "@/utils/playerCombinations";

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
    const isHome = isHomeMatch(match);
    return sum + (isHome ? (match.homeScore || 0) : (match.awayScore || 0));
  }, 0);
  
  // Calculate win rate
  const wins = playedMatches.filter(match => match.isWin === true).length;
  const winRate = playedMatches.length > 0 ? Math.round((wins / playedMatches.length) * 100) : 0;
  
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
  const goalsPerMatch = playedMatches.length > 0 
    ? (totalGoals / playedMatches.length).toFixed(1)
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
        value={playedMatches.length}
        icon={Calendar}
        description="Genomförda matcher"
        className="hover:shadow-md transition-shadow"
      />
      <KPICard
        title="Vinstprocent"
        value={`${winRate}%`}
        icon={Trophy}
        description={`${wins} vinster av ${playedMatches.length}`}
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
