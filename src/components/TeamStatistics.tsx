
import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our new components
import { OverviewTabContent } from "@/components/team-statistics/OverviewTabContent";
import { PerformanceTabContent } from "@/components/team-statistics/PerformanceTabContent";
import { AttendanceTabContent } from "@/components/team-statistics/AttendanceTabContent";
import { TrendsTabContent } from "@/components/team-statistics/TrendsTabContent";
import { calculatePlayerStats } from "@/components/team-statistics/utils/playerStatsUtils";

interface TeamStatisticsProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (player: Player) => void;
}

export function TeamStatistics({ players, activities, onPlayerSelect }: TeamStatisticsProps) {
  // Calculate player participation statistics
  const playerStats = useMemo(() => calculatePlayerStats(players, activities), [players, activities]);

  // Helper function to handle player click if onPlayerSelect is provided
  const handlePlayerClick = (playerId: string) => {
    if (onPlayerSelect) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        onPlayerSelect(player);
      }
    }
  };

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
