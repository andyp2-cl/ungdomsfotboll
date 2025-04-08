
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersRound } from "lucide-react";
import { PositionPlayerLists } from './PositionPlayerLists';
import { getFieldPlayers } from './positionUtils';

interface FormationTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function FormationTabContent({ players, activities }: FormationTabContentProps) {
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
        </TabsList>
        
        <TabsContent value="players">
          <PositionPlayerLists players={fieldPlayers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
