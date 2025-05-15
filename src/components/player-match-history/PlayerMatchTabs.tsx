
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Player, Activity } from "@/types/player";
import { MatchesTabContent } from "./components/MatchesTabContent";
import { CupsTabContent } from "./components/CupsTabContent";
import { StatsTabContent } from "./components/StatsTabContent";

interface PlayerMatchTabsProps {
  player: Player;
  matches: Activity[];
  cups: Activity[];
  activities: Activity[];
  onActivitySelect?: (activity: Activity) => void;
  allPlayers?: Player[]; // Add allPlayers prop
}

export function PlayerMatchTabs({ 
  player, 
  matches, 
  cups, 
  activities,
  onActivitySelect,
  allPlayers 
}: PlayerMatchTabsProps) {
  return (
    <Tabs defaultValue="matches" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="matches">Matcher ({matches.length})</TabsTrigger>
        <TabsTrigger value="cups">Cuper ({cups.length})</TabsTrigger>
        <TabsTrigger value="stats">Statistik</TabsTrigger>
      </TabsList>
      
      <TabsContent value="matches">
        <MatchesTabContent 
          player={player} 
          matches={matches} 
          onActivitySelect={onActivitySelect || (() => {})}
          allPlayers={allPlayers} // Pass allPlayers prop
        />
      </TabsContent>
      
      <TabsContent value="cups">
        <CupsTabContent 
          player={player} 
          cups={cups} 
        />
      </TabsContent>
      
      <TabsContent value="stats">
        <StatsTabContent 
          player={player}
          activities={activities}
        />
      </TabsContent>
    </Tabs>
  );
}
