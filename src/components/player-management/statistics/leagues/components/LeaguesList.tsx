
import { Activity, Player } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { LeagueCard } from "./LeagueCard";

interface LeagueWithMatches {
  id: string;
  name: string;
  division: string;
  year: number;
  matches: Activity[];
  wins: number;
  draws: number;
  losses: number;
  displayName?: string; // Added displayName property
}

interface LeaguesListProps {
  leagues: LeagueWithMatches[];
  players: Player[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function LeaguesList({ leagues, players, onActivitySelect, onPlayerSelect }: LeaguesListProps) {
  const years = Array.from(new Set(leagues.map(l => l.year))).sort((a, b) => b - a);
  
  // Function to sort leagues by priority
  const sortLeagues = (leagues: LeagueWithMatches[]) => {
    // Custom sort order for league names
    return [...leagues].sort((a, b) => {
      // Special case for 2013 A - should come first
      if (a.name === "A" && a.year === 2013) return -1;
      if (b.name === "A" && b.year === 2013) return 1;
      
      // Sort by division letter (A before B)
      const aDivision = a.name.charAt(0);
      const bDivision = b.name.charAt(0);
      
      if (aDivision !== bDivision) {
        return aDivision.localeCompare(bDivision);
      }
      
      // Then by division number if present
      const aNumber = parseInt(a.name.substring(1), 10) || 0;
      const bNumber = parseInt(b.name.substring(1), 10) || 0;
      
      return aNumber - bNumber;
    });
  };
  
  // Process league names to remove duplicate year prefixes
  const processedLeagues = leagues.map(league => {
    // Fix duplicate year in league name
    let displayName = league.name;
    
    if (displayName.startsWith(league.year.toString())) {
      const yearStr = league.year.toString();
      if (displayName.startsWith(`${yearStr} ${yearStr}`)) {
        displayName = displayName.substring(yearStr.length + 1);
      }
    }
    
    return {
      ...league,
      displayName
    };
  });

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
            {sortLeagues(processedLeagues.filter(league => league.year === year))
              .map(league => (
                <LeagueCard
                  key={league.id}
                  league={{
                    ...league,
                    // Use displayName if available, otherwise use name
                    name: league.displayName || league.name
                  }}
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
