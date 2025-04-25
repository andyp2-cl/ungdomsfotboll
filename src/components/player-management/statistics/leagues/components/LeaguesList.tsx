
import { Activity, Player } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { LeagueCard } from "./LeagueCard";

interface LeagueWithMatches {
  id: string;
  name: string;
  division: string;
  matches: Activity[];
  wins: number;
  draws: number;
  losses: number;
}

interface LeaguesListProps {
  leagues: LeagueWithMatches[];
  players: Player[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function LeaguesList({ leagues, players, onActivitySelect, onPlayerSelect }: LeaguesListProps) {
  const years = Array.from(new Set(leagues.map(l => l.year))).sort((a, b) => b - a);

  return (
    <Tabs defaultValue={years[0]?.toString() || ""}>
      <TabsList className="mb-4 flex flex-wrap gap-1">
        {years.map(year => (
          <TabsTrigger key={year} value={year.toString()}>
            {year}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {years.map(year => (
        <TabsContent key={year} value={year.toString()}>
          <Accordion type="multiple" className="space-y-4" defaultValue={[]}>
            {leagues
              .filter(league => league.year === year)
              .map(league => (
                <LeagueCard
                  key={league.id}
                  league={league}
                  players={players}
                  onActivitySelect={onActivitySelect}
                  onPlayerSelect={onPlayerSelect}
                />
              ))}
          </Accordion>
        </TabsContent>
      ))}
    </Tabs>
  );
}
