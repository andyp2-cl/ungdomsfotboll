
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Calendar, Clock, MapPin, Trophy, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlayerMatchHistoryProps {
  player: Player;
  activities: Activity[];
  onActivitySelect: (activity: Activity) => void;
}

export function PlayerMatchHistory({ player, activities, onActivitySelect }: PlayerMatchHistoryProps) {
  // Find activities that this player participated in
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get match statistics
  const matches = playerActivities.filter(activity => activity.type === "match");
  const cups = playerActivities.filter(activity => activity.type === "cup");
  
  let totalGoals = 0;
  let totalAssists = 0;
  let matchesWithGoals = 0;
  let matchesWithAssists = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;

  matches.forEach(match => {
    // Count goals and assists
    const goals = match.player_stats?.goals?.[player.id] || 0;
    const assists = match.player_stats?.assists?.[player.id] || 0;
    
    totalGoals += goals;
    totalAssists += assists;
    
    if (goals > 0) matchesWithGoals++;
    if (assists > 0) matchesWithAssists++;
    
    // CORRECTED: Determine if we're the home team - Hässleholms IF is usually listed first in the match name
    const isHomeTeam = match.name.toLowerCase().includes('hässleholms if') && 
                      !match.name.toLowerCase().startsWith('vs') &&
                      !match.name.toLowerCase().includes('mot');
    
    if (match.homeScore !== undefined && match.awayScore !== undefined) {
      const ourScore = isHomeTeam ? match.homeScore : match.awayScore;
      const theirScore = isHomeTeam ? match.awayScore : match.homeScore;
      
      if (ourScore > theirScore) wins++;
      else if (ourScore === theirScore) draws++;
      else losses++;
    } else if (match.result) {
      const [score1, score2] = match.result.split('-').map(Number);
      if (!isNaN(score1) && !isNaN(score2)) {
        const ourScore = isHomeTeam ? score1 : score2;
        const theirScore = isHomeTeam ? score2 : score1;
        
        if (ourScore > theirScore) wins++;
        else if (ourScore === theirScore) draws++;
        else losses++;
      }
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Spelarhistorik</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="matches">
          <TabsList className="mb-4">
            <TabsTrigger value="matches">Matcher ({matches.length})</TabsTrigger>
            <TabsTrigger value="stats">Statistik</TabsTrigger>
            <TabsTrigger value="cups">Cuper ({cups.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches" className="space-y-4">
            {matches.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead>Resultat</TableHead>
                      <TableHead>Mål</TableHead>
                      <TableHead>Assist</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map(match => (
                      <TableRow 
                        key={match.id} 
                        className="cursor-pointer hover:bg-accent/10"
                        onClick={() => onActivitySelect(match)}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(match.date)}</span>
                            <span className="text-xs text-muted-foreground">{match.time}</span>
                          </div>
                        </TableCell>
                        <TableCell>{match.name}</TableCell>
                        <TableCell>
                          {match.result ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                              {match.result}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {match.player_stats?.goals?.[player.id] ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {match.player_stats.goals[player.id]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {match.player_stats?.assists?.[player.id] ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {match.player_stats.assists[player.id]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Spelaren har inte deltagit i några matcher ännu
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                    Mål & Assist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt>Matcher:</dt>
                      <dd>{matches.length}</dd>
                    </div>
                    <div className="flex justify-between font-medium">
                      <dt>Mål:</dt>
                      <dd>{totalGoals}</dd>
                    </div>
                    <div className="flex justify-between font-medium">
                      <dt>Assist:</dt>
                      <dd>{totalAssists}</dd>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <dt>Mål per match:</dt>
                      <dd>{matches.length > 0 ? (totalGoals / matches.length).toFixed(1) : "0"}</dd>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <dt>Assist per match:</dt>
                      <dd>{matches.length > 0 ? (totalAssists / matches.length).toFixed(1) : "0"}</dd>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <dt>Matcher med mål:</dt>
                      <dd>{matchesWithGoals} ({matches.length > 0 ? Math.round((matchesWithGoals / matches.length) * 100) : 0}%)</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center">
                    <Star className="h-4 w-4 mr-2 text-blue-500" />
                    Resultat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt>Matcher:</dt>
                      <dd>{matches.length}</dd>
                    </div>
                    <div className="flex justify-between font-medium text-green-600">
                      <dt>Vinster:</dt>
                      <dd>{wins}</dd>
                    </div>
                    <div className="flex justify-between font-medium text-amber-600">
                      <dt>Oavgjorda:</dt>
                      <dd>{draws}</dd>
                    </div>
                    <div className="flex justify-between font-medium text-red-600">
                      <dt>Förluster:</dt>
                      <dd>{losses}</dd>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <dt>Vinstprocent:</dt>
                      <dd>{matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0}%</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="cups">
            {cups.length > 0 ? (
              <div className="space-y-4">
                {cups.map(cup => (
                  <Card key={cup.id} className="hover:bg-accent/5 cursor-pointer" onClick={() => onActivitySelect(cup)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{cup.name}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(cup.date)}
                            {cup.time && (
                              <span className="ml-2 flex items-center">
                                <Clock className="h-3 w-3 ml-2 mr-1" />
                                {cup.time}
                              </span>
                            )}
                          </div>
                          {cup.location && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {cup.location.name}
                            </div>
                          )}
                        </div>
                        <Badge>
                          {cup.matches?.length || 0} matcher
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Spelaren har inte deltagit i några cuper ännu
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
