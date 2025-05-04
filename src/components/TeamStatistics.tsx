
import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our components
import { OverviewTabContent } from "@/components/team-statistics/overview";
import { AttendanceTabContent } from "@/components/team-statistics/AttendanceTabContent";
import { PerformanceTabContent } from "@/components/team-statistics/PerformanceTabContent";
import { TrendsTabContent } from "@/components/team-statistics/TrendsTabContent";
import { calculatePlayerStats } from "@/components/team-statistics/utils/playerStatsUtils";

interface TeamStatisticsProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (player: Player) => void;
}

export function TeamStatistics({ players, activities, onPlayerSelect }: TeamStatisticsProps) {
  // Add debug logging
  console.log("TeamStatistics received:", {
    playerCount: players.length,
    activityCount: activities.length,
    matchCount: activities.filter(a => a.type === "match").length
  });

  // Calculate player participation statistics
  const playerStats = useMemo(() => calculatePlayerStats(players, activities), [players, activities]);
  
  console.log("Calculated player stats:", playerStats.length);
  
  // Debug match data
  const matchData = activities.filter(a => a.type === "match");
  console.log("Match data count:", matchData.length);
  if (matchData.length > 0) {
    console.log("Sample match:", JSON.stringify(matchData[0]));
  }

  // Helper function to handle player click if onPlayerSelect is provided
  const handlePlayerClick = (playerId: string) => {
    if (onPlayerSelect) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        onPlayerSelect(player);
      }
    }
  };

  if (players.length === 0 || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ingen data tillgänglig</h2>
        <p className="text-gray-500 max-w-md">
          Det finns ingen data att visa för statistik just nu. Se till att det finns spelare och aktiviteter i systemet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Lagstatistik
          </h2>
          <TabsList>
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="attendance">Närvaro</TabsTrigger>
            <TabsTrigger value="performance">Prestationer</TabsTrigger>
            <TabsTrigger value="trends">Trender</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          <OverviewTabContent players={players} activities={activities} onPlayerSelect={onPlayerSelect} />
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-6">
          <AttendanceTabContent players={players} activities={activities} />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <PerformanceTabContent 
            players={players} 
            activities={activities} 
            playerStats={playerStats}
            onPlayerClick={handlePlayerClick}
          />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <TrendsTabContent players={players} activities={activities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
