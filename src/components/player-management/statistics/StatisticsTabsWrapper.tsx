
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipationTabContent } from "./ParticipationTabContent";
import { FormationTabContent } from "./formation/FormationTabContent";
import { GoalsTabContent } from "./goals/GoalsTabContent";
import { OverviewTabContent } from "./tabs/OverviewTabContent";
import { LeaguesTabContent } from "./leagues/LeaguesTabContent";
import { Activity, Player } from "@/types/player";

interface StatisticsTabsWrapperProps {
  players: Player[];
  activities: Activity[];
  gradeData?: { grade: string; players: number }[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function StatisticsTabsWrapper({
  players,
  activities,
  gradeData,
  onActivitySelect,
  onPlayerSelect
}: StatisticsTabsWrapperProps) {
  // Add debug logging
  const handleActivitySelectWithLogging = (activity: Activity) => {
    console.log("StatisticsTabsWrapper: Activity selected:", activity.id, activity.name);
    if (onActivitySelect) {
      onActivitySelect(activity);
    } else {
      console.error("onActivitySelect is undefined in StatisticsTabsWrapper");
    }
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4 flex flex-wrap gap-1">
        <TabsTrigger value="overview">Översikt</TabsTrigger>
        <TabsTrigger value="participation">Deltagande</TabsTrigger>
        <TabsTrigger value="formation">Formation</TabsTrigger>
        <TabsTrigger value="goals">Mål</TabsTrigger>
        <TabsTrigger value="leagues">Ligor</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <OverviewTabContent 
          activities={activities} 
          players={players} 
        />
      </TabsContent>
      
      <TabsContent value="participation">
        <ParticipationTabContent 
          activities={activities} 
          players={players} 
        />
      </TabsContent>
      
      <TabsContent value="formation">
        <FormationTabContent 
          players={players}
          activities={activities}
        />
      </TabsContent>
      
      <TabsContent value="goals">
        <GoalsTabContent 
          activities={activities} 
          players={players} 
          onPlayerSelect={onPlayerSelect}
        />
      </TabsContent>
      
      <TabsContent value="leagues">
        <LeaguesTabContent 
          activities={activities} 
          players={players}
          onActivitySelect={handleActivitySelectWithLogging}
          onPlayerSelect={onPlayerSelect}
        />
      </TabsContent>
    </Tabs>
  );
}
