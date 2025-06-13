import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormationTabContent } from "./formation/FormationTabContent";
import { GoalsTabContent } from "./goals/GoalsTabContent";
import { OverviewTabContent } from "./tabs/OverviewTabContent";
import { MatchesTabContent } from "./matches/MatchesTabContent";
import { LeaguesTabContent } from "./leagues/LeaguesTabContent";
import { CupsTabContent } from "./cups/CupsTabContent";
import { CombinationsTabContent } from "./combinations/CombinationsTabContent";
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
      <TabsList className="mb-4 flex flex-wrap gap-1 bg-white/90 rounded-lg p-1 shadow-sm overflow-x-auto">
        <TabsTrigger value="overview" className="min-w-[90px] h-10 text-sm font-semibold md:text-base md:h-9">Översikt</TabsTrigger>
        <TabsTrigger value="combinations" className="min-w-[90px] h-10 text-sm font-semibold md:text-base md:h-9">Kombinationer</TabsTrigger>
        <TabsTrigger value="formation" className="min-w-[90px] h-10 text-sm font-semibold md:text-base md:h-9">Formation</TabsTrigger>
        <TabsTrigger value="goals" className="min-w-[90px] h-10 text-sm font-semibold md:text-base md:h-9">Mål</TabsTrigger>
        <TabsTrigger value="matches" className="min-w-[90px] h-10 text-sm font-semibold md:text-base md:h-9">Matcher</TabsTrigger>
        <TabsTrigger value="leagues" className="min-w-[90px] h-10 text-sm font-semibold md:text-base md:h-9">Ligor</TabsTrigger>
        <TabsTrigger value="cups" className="min-w-[90px] h-10 text-sm font-semibold md:text-base md:h-9">Cuper</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <OverviewTabContent 
          activities={activities} 
          players={players} 
        />
      </TabsContent>
      
      <TabsContent value="combinations">
        <CombinationsTabContent 
          players={players}
          activities={activities}
          onPlayerSelect={onPlayerSelect}
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
      
      <TabsContent value="matches">
        <MatchesTabContent 
          activities={activities} 
          players={players}
          onActivitySelect={handleActivitySelectWithLogging}
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
      
      <TabsContent value="cups">
        <CupsTabContent 
          activities={activities} 
          players={players}
          onActivitySelect={handleActivitySelectWithLogging}
          onPlayerSelect={onPlayerSelect}
        />
      </TabsContent>
    </Tabs>
  );
}
