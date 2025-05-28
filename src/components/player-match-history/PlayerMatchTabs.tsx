
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchesTabContent } from './components/MatchesTabContent';
import { StatsTabContent } from './components/StatsTabContent';
import { CupsTabContent } from './components/CupsTabContent';

interface PlayerMatchTabsProps {
  player: Player;
  playerActivities: Activity[];
  onActivitySelect: (activity: Activity) => void;
  allPlayers?: Player[];
  allActivities?: Activity[];
}

export function PlayerMatchTabs({ 
  player, 
  playerActivities, 
  onActivitySelect, 
  allPlayers = [], 
  allActivities = [] 
}: PlayerMatchTabsProps) {
  // Get filtered activities by type
  const matches = playerActivities.filter(activity => activity.type === "match");
  const cups = playerActivities.filter(activity => activity.type === "cup");
  
  return (
    <Tabs defaultValue="matches">
      <TabsList className="mb-4">
        <TabsTrigger value="matches">Matcher ({matches.length})</TabsTrigger>
        <TabsTrigger value="stats">Statistik</TabsTrigger>
        <TabsTrigger value="cups">Cuper ({cups.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="matches">
        <MatchesTabContent 
          player={player} 
          matches={matches} 
          onActivitySelect={onActivitySelect}
          allPlayers={allPlayers}
        />
      </TabsContent>
      
      <TabsContent value="stats">
        <StatsTabContent 
          player={player} 
          matches={matches} 
        />
      </TabsContent>
      
      <TabsContent value="cups">
        <CupsTabContent 
          cups={cups} 
          onActivitySelect={onActivitySelect}
          allActivities={allActivities}
        />
      </TabsContent>
    </Tabs>
  );
}
