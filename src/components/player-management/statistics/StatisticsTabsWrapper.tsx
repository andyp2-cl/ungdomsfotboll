
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Player } from "@/types/player";
import { OverviewTabContent } from "./tabs/OverviewTabContent";
import { MatchesTabContent } from "./matches/MatchesTabContent";
import { GoalsTabContent } from "./goals/GoalsTabContent";
import { FormationTabContent } from "./formation/FormationTabContent";
import { saveActiveTab } from "@/utils/storage/tabs";

interface StatisticsTabsWrapperProps {
  players: Player[];
  activities: Activity[];
  gradeData: { grade: string; players: number }[];
}

export function StatisticsTabsWrapper({ 
  players, 
  activities,
  gradeData
}: StatisticsTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "goals" | "formation">("overview");

  const handleTabChange = (value: string) => {
    const tab = value as "overview" | "matches" | "goals" | "formation";
    setActiveTab(tab);
    saveActiveTab(`statistics-${tab}`);
  };

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="matches">Matcher</TabsTrigger>
          <TabsTrigger value="goals">Mål</TabsTrigger>
          <TabsTrigger value="formation">Formation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTabContent players={players} activities={activities} />
        </TabsContent>
        
        <TabsContent value="matches">
          <MatchesTabContent activities={activities} players={players} />
        </TabsContent>
        
        <TabsContent value="goals">
          <GoalsTabContent players={players} activities={activities} />
        </TabsContent>
        
        <TabsContent value="formation">
          <FormationTabContent players={players} activities={activities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
