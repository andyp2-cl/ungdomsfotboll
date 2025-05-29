
import React from "react";
import { Player, Activity } from "@/types/player";
import { Users, Calendar, TrendingUp, Trophy } from "lucide-react";
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

  const gridCols = isMobile ? "grid-cols-2" : "grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-4 mb-6`}>
      <KPICard
        title="Totalt antal spelare"
        value={totalPlayers}
        icon={Users}
        description="Aktiva spelare"
      />
      <KPICard
        title="Totalt antal aktiviteter"
        value={totalActivities}
        icon={Calendar}
        description="Genomförda aktiviteter"
      />
      <KPICard
        title="Genomsnittlig närvaro"
        value={`${averageAttendance}%`}
        icon={TrendingUp}
        description="Av alla aktiviteter"
      />
      <KPICard
        title="Mest aktiva nivå"
        value={mostActiveGrade.grade}
        icon={Trophy}
        description={`${Math.round(mostActiveGrade.average * 10) / 10} aktiviteter/spelare`}
      />
    </div>
  );
}
