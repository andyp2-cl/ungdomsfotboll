
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityList } from "@/components/ActivityList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

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
  
  // Group activities by league and calculate statistics
  return (leagues || []).map(league => {
    const leagueMatches = activities.filter(
      activity => activity.type === "match" && activity.league_id === league.id
    );
    
    // Calculate match statistics
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
    
    return {
      ...league,
      matches: leagueMatches,
      wins,
      draws,
      losses
    };
  });
};

interface LeaguesTabContentProps {
  activities: Activity[];
  players: Player[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

const COLORS = ['#8B5CF6', '#9F9EA1', '#ea384c'];

export function LeaguesTabContent({ 
  activities,
  players,
  onActivitySelect,
  onPlayerSelect
}: LeaguesTabContentProps) {
  const isMobile = useIsMobile();
  
  const { data: leaguesWithMatches = [], isLoading } = useQuery({
    queryKey: ["leagues-with-matches", activities.length],
    queryFn: () => fetchLeaguesWithMatches(activities, players),
  });
  
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

  const handleActivityClick = (activity: Activity) => {
    if (onActivitySelect) {
      console.log("League match clicked:", activity.id, activity.name);
      onActivitySelect(activity);
    } else {
      console.error("onActivitySelect is undefined in LeaguesTabContent");
    }
  };

  const renderPieChart = (league: LeagueWithMatches) => {
    const data = [
      { name: 'Vinster', value: league.wins },
      { name: 'Oavgjorda', value: league.draws },
      { name: 'Förluster', value: league.losses }
    ];

    return (
      <div className="w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={15}
              outerRadius={30}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
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
              <TabsContent key={year} value={year.toString()}>
                <Accordion type="multiple" className="space-y-4">
                  {leaguesWithMatches
                    .filter(league => league.year === year)
                    .map(league => (
                      <AccordionItem key={league.id} value={league.id} className="border rounded-lg">
                        <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <span>{league.name} ({league.division})</span>
                              <div className="flex items-center space-x-1 text-sm">
                                <Badge variant="success" className="text-xs">
                                  {league.wins}
                                </Badge>
                                <Badge variant="secondary" className="text-xs bg-gray-400 text-white">
                                  {league.draws}
                                </Badge>
                                <Badge variant="destructive" className="text-xs">
                                  {league.losses}
                                </Badge>
                              </div>
                            </div>
                            {renderPieChart(league)}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          {league.matches.length > 0 ? (
                            <ActivityList
                              activities={league.matches}
                              players={players}
                              onSelect={handleActivityClick}
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
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
