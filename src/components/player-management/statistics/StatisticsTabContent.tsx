
import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";
import { MatchesTabContent } from "@/components/player-management/statistics/matches/MatchesTabContent";
import { GoalsTabContent } from "@/components/player-management/statistics/goals/GoalsTabContent";
import { ParticipationTabContent } from "@/components/player-management/statistics/ParticipationTabContent";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatisticsTabContentProps {
  players: Player[];
  activities: Activity[];
  gradeData: { grade: string; players: number }[];
  onPlayerSelect?: (playerId: string) => void;
}

export function StatisticsTabContent({ 
  players, 
  activities,
  gradeData,
  onPlayerSelect
}: StatisticsTabContentProps) {
  const isMobile = useIsMobile();
  
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
        activities: activityCount
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className={`w-full ${isMobile ? 'grid-cols-2 h-auto' : 'md:w-auto grid-cols-4'}`}>
          <TabsTrigger 
            value="overview" 
            className={isMobile ? 'text-xs px-2 py-3' : ''}
          >
            {isMobile ? 'Översikt' : 'Översikt'}
          </TabsTrigger>
          <TabsTrigger 
            value="matches" 
            className={isMobile ? 'text-xs px-2 py-3' : ''}
          >
            {isMobile ? 'Matcher' : 'Matcher'}
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            className={isMobile ? 'text-xs px-2 py-3 col-span-2' : ''}
          >
            {isMobile ? 'Mål' : 'Matchstatistik'}
          </TabsTrigger>
          {!isMobile && (
            <TabsTrigger value="participation">
              Deltagande
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className={`space-y-${isMobile ? '4' : '6'}`}>
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
            <div className={isMobile ? 'order-2' : ''}>
              <GradeStatisticsChart 
                data={activityCountByGrade} 
                config={gradeChartConfig} 
              />
            </div>
            
            <div className={isMobile ? 'order-1' : ''}>
              <PlayerActivityChart 
                data={playerActivityData.slice(0, isMobile ? 5 : 10)} 
                config={playerChartConfig} 
              />
            </div>

            <div className={`${isMobile ? 'order-3 col-span-1' : 'md:col-span-2'}`}>
              <PlayerAttendanceAnalytics
                players={players}
                activities={activities}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="matches">
          <MatchesTabContent 
            activities={activities} 
            players={players} 
            onPlayerSelect={onPlayerSelect}
          />
        </TabsContent>
        
        <TabsContent value="goals">
          <GoalsTabContent 
            activities={activities} 
            players={players}
            onPlayerSelect={onPlayerSelect} 
          />
        </TabsContent>
        
        {!isMobile && (
          <TabsContent value="participation">
            <ParticipationTabContent activities={activities} players={players} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
