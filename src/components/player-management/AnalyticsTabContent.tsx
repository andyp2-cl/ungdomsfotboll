
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerPerformanceChart } from "@/components/performance-charts/PlayerPerformanceChart";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";

interface AnalyticsTabContentProps {
  players: Player[];
  activities: Activity[];
  gradeData: { grade: string; players: number }[];
}

export function AnalyticsTabContent({ 
  players, 
  activities,
  gradeData
}: AnalyticsTabContentProps) {
  // Beräkna antal aktiviteter per nivå
  const activityCountByGrade = gradeData.map(gradeInfo => {
    const gradePlayers = players.filter(p => p.grade === gradeInfo.grade);
    const playerIds = gradePlayers.map(p => p.id);
    
    let totalActivities = 0;
    
    // Räkna aktiviteter för spelarna i denna nivå
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
  
  // Hämta de 10 mest aktiva spelarna
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
  
  // Konfigurera diagram
  const gradeChartConfig = {
    average: {
      label: "Genomsnitt per spelare",
    }
  };
  
  const playerChartConfig = {
    activities: {
      label: "Antal aktiviteter",
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Aktivitetsanalys</TabsTrigger>
          <TabsTrigger value="performance">Prestationsanalys</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aktiviteter per nivå</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <GradeStatisticsChart 
                  data={activityCountByGrade} 
                  config={gradeChartConfig} 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Mest aktiva spelare</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <PlayerActivityChart 
                  data={playerActivityData} 
                  config={playerChartConfig} 
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Närvarotrend</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <PlayerAttendanceAnalytics
                  players={players}
                  activities={activities}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <PlayerPerformanceChart 
            players={players}
            activities={activities}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
