
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
  
  // Custom sort function for leagues based on the requested order
  const sortLeagues = (leagues: LeagueWithMatches[]) => {
    return [...leagues].sort((a, b) => {
      // First sort by year (descending)
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      
      // Custom sort for division A, A2, A1, B1, etc.
      const aDivisionLetter = a.name.charAt(0);
      const bDivisionLetter = b.name.charAt(0);
      
      // If division letters are different, sort alphabetically (A before B)
      if (aDivisionLetter !== bDivisionLetter) {
        return aDivisionLetter.localeCompare(bDivisionLetter);
      }
      
      // If both are A division, handle A, A1, A2 special case
      if (aDivisionLetter === 'A') {
        // Plain "A" always comes first
        if (a.name === 'A' && b.name !== 'A') return -1;
        if (b.name === 'A' && a.name !== 'A') return 1;
        
        // For A1, A2, etc., sort by the number (A2 before A1)
        const aNumber = parseInt(a.name.substring(1), 10) || 0;
        const bNumber = parseInt(b.name.substring(1), 10) || 0;
        
        // Special case: A2 should come before A1
        if (aNumber === 2 && bNumber === 1) return -1;
        if (aNumber === 1 && bNumber === 2) return 1;
        
        return aNumber - bNumber;
      }
      
      // For other divisions, sort normally
      return a.name.localeCompare(b.name);
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
