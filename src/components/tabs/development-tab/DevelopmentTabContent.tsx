
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, User, BarChart3 } from "lucide-react";
import { Player, Activity } from "@/types/player";
import { DevelopmentOverview } from "./DevelopmentOverview";
import { PlayerDevelopmentView } from "./PlayerDevelopmentView";
import { DevelopmentComparison } from "./DevelopmentComparison";

interface DevelopmentTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function DevelopmentTabContent({
  players,
  activities,
  onPlayerSelect
}: DevelopmentTabContentProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Spelarutveckling</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Översikt
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Individuell
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Jämförelse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DevelopmentOverview 
            players={players}
            activities={activities}
            onPlayerSelect={onPlayerSelect}
          />
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <PlayerDevelopmentView 
            players={players}
            activities={activities}
            onPlayerSelect={onPlayerSelect}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <DevelopmentComparison 
            players={players}
            activities={activities}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
