
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityList } from "@/components/ActivityList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

interface League {
  id: string;
  name: string;
  division: string;
  year: number;
}

interface LeagueWithMatches extends League {
  matches: Activity[];
}

// Function to fetch leagues from Supabase
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
  
  // Group activities by league
  return (leagues || []).map(league => {
    const leagueMatches = activities.filter(
      activity => activity.type === "match" && activity.league_id === league.id
    );
    
    return {
      ...league,
      matches: leagueMatches
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
  const isMobile = useIsMobile();
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  
  const { data: leaguesWithMatches = [], isLoading } = useQuery({
    queryKey: ["leagues-with-matches", activities.length],
    queryFn: () => fetchLeaguesWithMatches(activities, players),
  });
  
  // Get unique years for tabs
  const years = Array.from(new Set(leaguesWithMatches.map(l => l.year))).sort((a, b) => b - a);
  
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
          <Tabs defaultValue={years[0]?.toString() || ""}>
            <TabsList className="mb-4 flex flex-wrap gap-1">
              {years.map(year => (
                <TabsTrigger key={year} value={year.toString()}>
                  {year}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {years.map(year => (
              <TabsContent key={year} value={year.toString()} className="space-y-4">
                {leaguesWithMatches
                  .filter(league => league.year === year)
                  .map(league => (
                    <Card key={league.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 p-4">
                        <CardTitle className="text-lg">
                          {league.name} ({league.division})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {league.matches.length > 0 ? (
                          <ActivityList
                            activities={league.matches}
                            players={players}
                            onSelect={activity => onActivitySelect?.(activity)}
                            onPlayerSelect={onPlayerSelect}
                            isHistorical={true}
                            isMobile={isMobile}
                            noResultsMessage="Inga matcher har lagts till i denna liga ännu."
                          />
                        ) : (
                          <p className="text-center text-muted-foreground py-4">
                            Inga matcher har lagts till i denna liga ännu.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
