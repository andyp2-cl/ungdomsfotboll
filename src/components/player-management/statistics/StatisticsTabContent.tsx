
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTabContent } from "./overview/OverviewTabContent";
import { ParticipationTabContent } from "./ParticipationTabContent";
import { MatchesTabContent } from "./matches/MatchesTabContent";
import { GoalsTabContent } from "./goals/GoalsTabContent";
import { LeaguesTabContent } from "./leagues/LeaguesTabContent";
import { CombinationsTabContent } from "./combinations/CombinationsTabContent";
import { FormationTabContent } from "./formation/FormationTabContent";

interface StatisticsTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function StatisticsTabContent({ players, activities }: StatisticsTabContentProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
    // You could add navigation logic here if needed
    console.log('Selected player:', playerId);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="participation">Deltagande</TabsTrigger>
          <TabsTrigger value="matches">Matcher</TabsTrigger>
          <TabsTrigger value="goals">Mål</TabsTrigger>
          <TabsTrigger value="leagues">Serier</TabsTrigger>
          <TabsTrigger value="combinations">Kombinationer</TabsTrigger>
          <TabsTrigger value="formation">Formation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTabContent players={players} activities={activities} />
        </TabsContent>

        <TabsContent value="participation">
          <ParticipationTabContent players={players} activities={activities} />
        </TabsContent>

        <TabsContent value="matches">
          <MatchesTabContent players={players} activities={activities} onPlayerSelect={handlePlayerSelect} />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsTabContent players={players} activities={activities} onPlayerSelect={handlePlayerSelect} />
        </TabsContent>

        <TabsContent value="leagues">
          <LeaguesTabContent players={players} activities={activities} />
        </TabsContent>

        <TabsContent value="combinations">
          <CombinationsTabContent players={players} activities={activities} onPlayerSelect={handlePlayerSelect} />
        </TabsContent>

        <TabsContent value="formation">
          <FormationTabContent 
            players={players} 
            activities={activities}
            onPlayerSelect={handlePlayerSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
