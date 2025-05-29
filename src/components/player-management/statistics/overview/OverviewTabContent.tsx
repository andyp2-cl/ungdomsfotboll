
import React from "react";
import { Player, Activity } from "@/types/player";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";
import { KPISection } from "./KPISection";
import { ChartSection } from "./ChartSection";
import { isTrainer } from "@/utils/positionUtils";
import { calculateGoalStats } from "@/components/player-management/statistics/goals/calculateGoalStats";

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
    const gradePlayers = players.filter(p => p.grade === gradeInfo.grade && !isTrainer(p.positions));
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
  
  // Calculate goal statistics for players
  const { playerStats } = calculateGoalStats(activities, players);
  
  // Calculate player activity data with goals per match
  const playerActivityData = players
    .filter(player => !isTrainer(player.positions))
    .map(player => {
      const activityCount = activities.filter(activity => 
        activity.participants?.includes(player.id)
      ).length;
      
      // Find goal stats for this player
      const goalStat = playerStats.find(stat => stat.playerId === player.id);
      const goalsPerMatch = goalStat && goalStat.matches > 0 
        ? Number((goalStat.goals / goalStat.matches).toFixed(2))
        : 0;
      
      return {
        id: player.id,
        name: player.name,
        grade: player.grade,
        jerseyNumber: player.jerseyNumber,
        activities: activityCount,
        activityCount: activityCount,
        goalsPerMatch: goalsPerMatch
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

      {/* Mål per match Section */}
      <ChartSection
        title="Mål per match"
        description="Spelare med bäst målsnitt per match"
        className="w-full"
      >
        <div className="h-[300px] w-full overflow-y-auto pr-4">
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b text-left">
                <th className="pb-2">Spelare</th>
                <th className="pb-2 text-center">Matcher</th>
                <th className="pb-2 text-center">Mål</th>
                <th className="pb-2 text-center">Mål per match</th>
              </tr>
            </thead>
            <tbody>
              {playerStats
                .filter(player => player.matches > 0)
                .sort((a, b) => {
                  const aGoalsPerMatch = a.matches > 0 ? a.goals / a.matches : 0;
                  const bGoalsPerMatch = b.matches > 0 ? b.goals / b.matches : 0;
                  return bGoalsPerMatch - aGoalsPerMatch;
                })
                .slice(0, 10)
                .map(player => {
                  const goalsPerMatch = player.matches > 0 ? (player.goals / player.matches).toFixed(2) : '0.00';
                  return (
                    <tr 
                      key={player.playerId} 
                      className="border-b hover:bg-accent/5 cursor-pointer"
                      onClick={() => onPlayerSelect && onPlayerSelect(player.playerId)}
                    >
                      <td className="py-2">{player.name}</td>
                      <td className="py-2 text-center">{player.matches}</td>
                      <td className="py-2 text-center">{player.goals}</td>
                      <td className="py-2 text-center">{goalsPerMatch}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </ChartSection>

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
