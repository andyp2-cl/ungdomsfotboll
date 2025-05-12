
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
  displayName?: string;
}

interface LeaguesListProps {
  leagues: LeagueWithMatches[];
  players: Player[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function LeaguesList({ leagues, players, onActivitySelect, onPlayerSelect }: LeaguesListProps) {
  const years = Array.from(new Set(leagues.map(l => l.year))).sort((a, b) => b - a);
  
  // Custom sort function for leagues based on the requested order
  const sortLeagues = (leagues: LeagueWithMatches[]) => {
    return [...leagues].sort((a, b) => {
      // First sort by year (descending)
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      
      // Clean names for comparison
      const aName = a.displayName || a.name;
      const bName = b.displayName || b.name;
      
      // Custom sort for division A, A2, A1, B1, etc.
      const aDivisionLetter = aName.charAt(0);
      const bDivisionLetter = bName.charAt(0);
      
      // If division letters are different, sort alphabetically (A before B)
      if (aDivisionLetter !== bDivisionLetter) {
        return aDivisionLetter.localeCompare(bDivisionLetter);
      }
      
      // Special handling for A/A1/A2 sorting
      const aIsJustA = aName === 'A';
      const bIsJustA = bName === 'A';
      
      // If one is just "A", it comes first
      if (aIsJustA && !bIsJustA) return -1;
      if (bIsJustA && !aIsJustA) return 1;
      
      // Handle A2/A1 specific ordering
      if (aName === 'A2' && bName === 'A1') return -1;
      if (aName === 'A1' && bName === 'A2') return 1;
      
      // Default to normal string comparison
      return aName.localeCompare(bName);
    });
  };
  
  // Process league names to remove duplicate year prefixes
  const processedLeagues = leagues.map(league => {
    // Clean up league name - remove duplicate year prefix
    let displayName = league.name;
    
    // Remove year prefix if it duplicates the year
    const yearStr = league.year.toString();
    if (displayName.startsWith(yearStr)) {
      // This pattern matches both "2013 2013" and just a single year prefix
      displayName = displayName.replace(new RegExp(`^${yearStr}\\s+${yearStr}\\s+`), '');
      displayName = displayName.replace(new RegExp(`^${yearStr}\\s+`), '');
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
