
import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchesTabContent } from "@/components/player-management/statistics/matches/MatchesTabContent";
import { GoalsTabContent } from "@/components/player-management/statistics/goals/GoalsTabContent";
import { ParticipationTabContent } from "@/components/player-management/statistics/ParticipationTabContent";
import { OverviewTabContent } from "@/components/player-management/statistics/overview/OverviewTabContent";
import { CombinationsTabContent } from "@/components/player-management/statistics/combinations/CombinationsTabContent";
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className={`w-full ${isMobile ? 'grid-cols-3 h-auto' : 'md:w-auto grid-cols-5'}`}>
          <TabsTrigger 
            value="overview" 
            className={isMobile ? 'text-xs px-2 py-3' : ''}
          >
            Översikt
          </TabsTrigger>
          <TabsTrigger 
            value="combinations" 
            className={isMobile ? 'text-xs px-2 py-3' : ''}
          >
            {isMobile ? 'Kombo' : 'Kombinationer'}
          </TabsTrigger>
          <TabsTrigger 
            value="matches" 
            className={isMobile ? 'text-xs px-2 py-3' : ''}
          >
            Matcher
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
        
        <TabsContent value="overview" className="space-y-6">
          <OverviewTabContent
            players={players}
            activities={activities}
            gradeData={gradeData}
            onPlayerSelect={onPlayerSelect}
            isMobile={isMobile}
          />
        </TabsContent>
        
        <TabsContent value="combinations" className="space-y-6">
          <CombinationsTabContent
            players={players}
            activities={activities}
            onPlayerSelect={onPlayerSelect}
          />
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
