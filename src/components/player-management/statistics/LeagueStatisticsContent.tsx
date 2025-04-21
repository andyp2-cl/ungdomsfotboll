
import React, { useMemo, useState } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

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

  // Get unique league names from activities
  const leagues = useMemo(() => {
    const leagueSet = new Set(
      activities
        .filter(activity => activity.league_id)
        .map(activity => {
          const leagueActivity = activities.find(a => a.id === activity.league_id);
          return leagueActivity ? leagueActivity.name : null;
        })
        .filter(Boolean)
    );
    return Array.from(leagueSet);
  }, [activities]);

  // Filter matches by selected league
  const leagueMatches = useMemo(() => {
    if (!selectedLeague) return [];
    
    return activities.filter(activity => {
      const leagueActivity = activities.find(a => a.id === activity.league_id);
      return leagueActivity?.name === selectedLeague && activity.type === 'match';
    });
  }, [activities, selectedLeague]);

  // Calculate league statistics
  const leagueStats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;

    leagueMatches.forEach(match => {
      if (match.homeScore !== undefined && match.awayScore !== undefined) {
        // Assuming home team is always Hässleholms IF
        const isHomeTeam = match.name.toLowerCase().includes('hässleholms if');
        const ourScore = isHomeTeam ? match.homeScore : match.awayScore;
        const theirScore = isHomeTeam ? match.awayScore : match.homeScore;

        if (ourScore > theirScore) wins++;
        else if (ourScore === theirScore) draws++;
        else losses++;

        goalsScored += ourScore;
        goalsConceded += theirScore;
      }
    });

    return { wins, draws, losses, goalsScored, goalsConceded };
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
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Välj liga" />
              </SelectTrigger>
              <SelectContent>
                {leagues.map(league => (
                  <SelectItem key={league} value={league}>{league}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedLeague ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Matchstatistik för {selectedLeague}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-muted-foreground">Vinster</p>
                      <p className="text-2xl font-bold">{leagueStats.wins}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Oavgjorda</p>
                      <p className="text-2xl font-bold">{leagueStats.draws}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Förluster</p>
                      <p className="text-2xl font-bold">{leagueStats.losses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matcher i {selectedLeague}</CardTitle>
                </CardHeader>
                <CardContent>
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
                          <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
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
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Välj en liga för att se statistik
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
