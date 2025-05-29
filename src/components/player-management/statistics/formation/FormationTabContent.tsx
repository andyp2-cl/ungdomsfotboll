
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersRound, Target, Scale } from "lucide-react";
import { PositionPlayerLists } from './PositionPlayerLists';
import { OptimalLineupSuggestion } from './OptimalLineupSuggestion';
import { BalancedMatchOptimizer } from './BalancedMatchOptimizer';
import { getFieldPlayers } from './positionUtils';

interface FormationTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function FormationTabContent({ players, activities, onPlayerSelect }: FormationTabContentProps) {
  // Filter out coaches for field player analysis
  const fieldPlayers = getFieldPlayers(players);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="players">
        <TabsList>
          <TabsTrigger value="players" className="flex items-center gap-1">
            <UsersRound className="h-4 w-4" />
            Spelare per position
          </TabsTrigger>
          <TabsTrigger value="optimal" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Optimal lineup
          </TabsTrigger>
          <TabsTrigger value="balanced" className="flex items-center gap-1">
            <Scale className="h-4 w-4" />
            Balanserad match
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="players">
          <PositionPlayerLists players={fieldPlayers} />
        </TabsContent>
        
        <TabsContent value="optimal">
          <OptimalLineupSuggestion 
            players={fieldPlayers}
            activities={activities}
            onPlayerSelect={onPlayerSelect}
          />
        </TabsContent>
        
        <TabsContent value="balanced">
          <BalancedMatchOptimizer
            players={fieldPlayers}
            activities={activities}
            onPlayerSelect={onPlayerSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
