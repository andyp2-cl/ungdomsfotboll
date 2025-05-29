
import React from "react";
import { Player, Activity } from "@/types/player";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";
import { KPISection } from "./KPISection";
import { ChartSection } from "./ChartSection";

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
  gradeData: { grade: string; players: number }[];
  onPlayerSelect?: (playerId: string) => void;
  isMobile?: boolean;
}

export function OverviewTabContent({ 
  players, 
  activities, 
  gradeData, 
  onPlayerSelect,
  isMobile = false 
}: OverviewTabContentProps) {
  // Calculate activity count by grade
  const activityCountByGrade = gradeData.map(gradeInfo => {
    const gradePlayers = players.filter(p => p.grade === gradeInfo.grade);
    const playerIds = gradePlayers.map(p => p.id);
    
    let totalActivities = 0;
    
    playerIds.forEach(playerId => {
      const playerActivities = activities.filter(a => 
        a.participants?.includes(playerId)
      ).length;
      
      totalActivities += playerActivities;
    });
    
    const averageActivities = gradePlayers.length > 0 
      ? Math.round(totalActivities / gradePlayers.length * 10) / 10 
      : 0;
    
    return {
      grade: gradeInfo.grade,
      count: totalActivities,
      players: gradeInfo.players,
      average: averageActivities
    };
  });
  
  // Calculate player activity data with correct property name
  const playerActivityData = players
    .filter(player => !player.positions?.includes("TRÄNARE"))
    .map(player => {
      const activityCount = activities.filter(activity => 
        activity.participants?.includes(player.id)
      ).length;
      
      return {
        id: player.id,
        name: player.name,
        grade: player.grade,
        activities: activityCount, // Fixed: use 'activities' instead of 'activityCount'
        activityCount: activityCount // Keep both for compatibility
      };
    })
    .sort((a, b) => b.activities - a.activities);

  const gradeChartConfig = {
    average: {
      label: "Genomsnitt per spelare",
    },
    gradeColors: {}
  };
  
  const playerChartConfig = {
    activities: {
      label: "Antal aktiviteter",
    },
    gradeColors: {}
  };

  // Handle player chart click
  const handlePlayerChartClick = (playerId: string) => {
    console.log("OverviewTabContent: Player chart clicked:", playerId);
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    }
  };

  const gridCols = isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  const topPlayersCount = isMobile ? 5 : 10;

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <KPISection 
        players={players} 
        activities={activities} 
        isMobile={isMobile}
      />
      
      {/* Charts Section */}
      <div className={`grid ${gridCols} gap-6`}>
        <ChartSection
          title="Aktivitetsstatistik per nivå"
          description="Genomsnittligt antal aktiviteter per spelarnivå"
        >
          <GradeStatisticsChart 
            data={activityCountByGrade} 
            config={gradeChartConfig} 
          />
        </ChartSection>
        
        <ChartSection
          title="Mest aktiva spelare"
          description={`Topp ${topPlayersCount} spelare med flest aktiviteter`}
        >
          <PlayerActivityChart 
            data={playerActivityData.slice(0, topPlayersCount)} 
            config={playerChartConfig}
            onBarClick={onPlayerSelect ? handlePlayerChartClick : undefined}
          />
        </ChartSection>
      </div>

      {/* Attendance Analytics - Full Width */}
      <ChartSection
        title="Närvaroanalys"
        description="Detaljerad närvarostatistik för spelare"
        className="w-full"
      >
        <PlayerAttendanceAnalytics
          players={players}
          activities={activities}
        />
      </ChartSection>
    </div>
  );
}
