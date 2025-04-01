
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersRound, LayoutGrid } from "lucide-react";
import { FormationField } from './FormationField';
import { FormationSelector } from './FormationSelector';
import { FormationStats } from './FormationStats';
import { PositionPlayerLists } from './PositionPlayerLists';
import { getFieldPlayers } from './positionUtils';

interface FormationTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function FormationTabContent({ players, activities }: FormationTabContentProps) {
  const [selectedFormation, setSelectedFormation] = useState<string>("4-4-2");
  const [selectedTab, setSelectedTab] = useState<"overview" | "players">("overview");

  // Filter out coaches for field player analysis
  const fieldPlayers = getFieldPlayers(players);
  
  return (
    <div className="space-y-6">
      <Tabs 
        value={selectedTab} 
        onValueChange={(value) => setSelectedTab(value as "overview" | "players")}
      >
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <LayoutGrid className="h-4 w-4" />
            Överblick
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-1">
            <UsersRound className="h-4 w-4" />
            Spelare per position
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formationsöversikt</CardTitle>
            </CardHeader>
            <CardContent>
              <FormationSelector 
                selectedFormation={selectedFormation}
                onFormationChange={setSelectedFormation}
              />
              <FormationField selectedFormation={selectedFormation} />
              <FormationStats
                players={fieldPlayers}
                selectedFormation={selectedFormation}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="players">
          <PositionPlayerLists players={fieldPlayers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
