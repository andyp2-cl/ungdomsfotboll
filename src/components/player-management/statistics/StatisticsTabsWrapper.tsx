
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { TeamStatistics } from "@/components/TeamStatistics";
import { MatchesTabContent } from "./MatchesTabContent";
import { GoalsTabContent } from "./goals/GoalsTabContent";
import { ParticipationTabContent } from "./ParticipationTabContent";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "goals" | "participation">("overview");

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "overview" | "matches" | "goals" | "participation")}
      >
        <TabsList>
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="matches">Matcher</TabsTrigger>
          <TabsTrigger value="goals">Mål</TabsTrigger>
          <TabsTrigger value="participation">Deltagare</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <TeamStatistics players={players} activities={activities} />
        </TabsContent>
        
        <TabsContent value="matches">
          <MatchesTabContent activities={activities} />
        </TabsContent>
        
        <TabsContent value="goals">
          <GoalsTabContent players={players} activities={activities} />
        </TabsContent>
        
        <TabsContent value="participation">
          <ParticipationTabContent players={players} activities={activities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
