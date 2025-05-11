
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaguesList } from "./components/LeaguesList";

interface League {
  id: string;
  name: string;
  division: string;
  year: number;
}

interface LeagueWithMatches extends League {
  matches: Activity[];
  wins: number;
  draws: number;
  losses: number;
  displayName?: string; // Added displayName property
}

const fetchLeaguesWithMatches = async (
  activities: Activity[], 
  players: Player[]
): Promise<LeagueWithMatches[]> => {
  const { data: leagues, error } = await supabase
    .from("leagues")
    .select("*")
    .order("year", { ascending: false })
    .order("name");
    
  if (error) {
    console.error("Error fetching leagues:", error);
    throw error;
  }
  
  return (leagues || []).map(league => {
    const leagueMatches = activities.filter(
      activity => activity.type === "match" && activity.league_id === league.id
    );
    
    let wins = 0;
    let draws = 0;
    let losses = 0;
    
    leagueMatches.forEach(match => {
      if (match.homeScore !== undefined && match.awayScore !== undefined && 
          match.homeScore === match.awayScore) {
        draws++;
      } else if (match.isWin === true) {
        wins++;
      } else if (match.isWin === false) {
        losses++;
      }
    });
    
    // Fix duplicate year in league name
    let displayName = league.name;
    const yearStr = league.year.toString();
    
    // Remove year prefix if it duplicates the year
    if (displayName.startsWith(yearStr)) {
      displayName = displayName.replace(new RegExp(`^${yearStr}\\s+${yearStr}\\s+`), '');
      displayName = displayName.replace(new RegExp(`^${yearStr}\\s+`), '');
    }
    
    return {
      ...league,
      matches: leagueMatches,
      wins,
      draws,
      losses,
      displayName
    };
  });
};

interface LeaguesTabContentProps {
  activities: Activity[];
  players: Player[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function LeaguesTabContent({ 
  activities,
  players,
  onActivitySelect,
  onPlayerSelect
}: LeaguesTabContentProps) {
  const { data: leaguesWithMatches = [], isLoading } = useQuery({
    queryKey: ["leagues-with-matches", activities.length],
    queryFn: () => fetchLeaguesWithMatches(activities, players),
  });

  if (isLoading) {
    return <div className="p-4 text-center">Laddar ligor...</div>;
  }
  
  if (leaguesWithMatches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Inga ligor hittades. Kontrollera konfigurationen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ligamatcher</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaguesList 
            leagues={leaguesWithMatches}
            players={players}
            onActivitySelect={onActivitySelect}
            onPlayerSelect={onPlayerSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}
