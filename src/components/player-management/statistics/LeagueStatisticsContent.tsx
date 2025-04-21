
import React, { useMemo, useState, useEffect } from "react";
import { Activity, Player, League } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeagueStatisticsContentProps {
  activities: Activity[];
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
}

export function LeagueStatisticsContent({ 
  activities, 
  players,
  onPlayerSelect 
}: LeagueStatisticsContentProps) {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leagues from Supabase
  useEffect(() => {
    async function fetchLeagues() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('leagues')
          .select('*')
          .order('year', { ascending: false })
          .order('name');
        
        if (error) throw error;
        setLeagues(data || []);
        
        // Set first league as default if there are leagues and none selected
        if (data && data.length > 0 && !selectedLeague) {
          setSelectedLeague(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching leagues:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeagues();
  }, []);

  // Find league details for the selected league
  const selectedLeagueDetails = useMemo(() => {
    return leagues.find(league => league.id === selectedLeague);
  }, [leagues, selectedLeague]);

  // Filter matches by selected league
  const leagueMatches = useMemo(() => {
    if (!selectedLeague) return [];
    
    return activities.filter(activity => 
      activity.league_id === selectedLeague && activity.type === 'match'
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activities, selectedLeague]);

  // Calculate league statistics
  const leagueStats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let cleanSheets = 0;

    leagueMatches.forEach(match => {
      if (match.homeScore !== undefined && match.awayScore !== undefined) {
        // Assuming home team is always our team when the match name starts with "Hässleholms IF"
        const isHomeTeam = match.name.toLowerCase().includes('hässleholms if') && 
          !match.name.toLowerCase().startsWith('vs ') && 
          !match.name.toLowerCase().startsWith('mot ');
        
        const ourScore = isHomeTeam ? match.homeScore : match.awayScore;
        const theirScore = isHomeTeam ? match.awayScore : match.homeScore;

        if (ourScore > theirScore) wins++;
        else if (ourScore === theirScore) draws++;
        else losses++;

        goalsScored += ourScore;
        goalsConceded += theirScore;
        
        // Check for clean sheets
        if (theirScore === 0) cleanSheets++;
      }
    });

    return { 
      wins, 
      draws, 
      losses, 
      goalsScored, 
      goalsConceded, 
      cleanSheets,
      total: leagueMatches.length,
      gamesWithResult: wins + draws + losses
    };
  }, [leagueMatches]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Ligaöversikt
            </CardTitle>
            <Select 
              value={selectedLeague || ""} 
              onValueChange={(value) => setSelectedLeague(value)}
              disabled={isLoading || leagues.length === 0}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isLoading ? "Laddar ligor..." : "Välj liga"} />
              </SelectTrigger>
              <SelectContent>
                {leagues.map(league => (
                  <SelectItem key={league.id} value={league.id}>
                    {league.name} ({league.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedLeagueDetails ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Matchstatistik för {selectedLeagueDetails.name} ({selectedLeagueDetails.year})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-muted-foreground">Vinster</p>
                      <p className="text-2xl font-bold text-green-600">{leagueStats.wins}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-md">
                      <p className="text-sm text-muted-foreground">Oavgjorda</p>
                      <p className="text-2xl font-bold text-yellow-600">{leagueStats.draws}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-muted-foreground">Förluster</p>
                      <p className="text-2xl font-bold text-red-600">{leagueStats.losses}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-muted-foreground">Gjorda mål</p>
                      <p className="text-2xl font-bold text-blue-600">{leagueStats.goalsScored}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-md">
                      <p className="text-sm text-muted-foreground">Insläppta mål</p>
                      <p className="text-2xl font-bold text-orange-600">{leagueStats.goalsConceded}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-emerald-50 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Nollor</p>
                    <p className="text-2xl font-bold text-emerald-600">{leagueStats.cleanSheets}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    Matcher i {selectedLeagueDetails.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leagueMatches.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Datum</TableHead>
                            <TableHead>Match</TableHead>
                            <TableHead>Resultat</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leagueMatches.map(match => (
                            <TableRow key={match.id}>
                              <TableCell>{new Date(match.date).toLocaleDateString('sv-SE')}</TableCell>
                              <TableCell>{match.name}</TableCell>
                              <TableCell>
                                {match.homeScore !== undefined && match.awayScore !== undefined 
                                  ? `${match.homeScore}-${match.awayScore}` 
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Inga matcher hittades för denna liga
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {isLoading ? "Laddar ligainformation..." : "Välj en liga för att se statistik"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
