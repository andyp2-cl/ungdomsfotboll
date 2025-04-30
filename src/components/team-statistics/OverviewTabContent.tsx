
import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { calculateMatchStats } from "@/components/player-management/statistics/matches/utils/calculateMatchStats";
import { LeaguesList } from "@/components/player-management/statistics/leagues/components/LeaguesList";

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (player: Player) => void;
}

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

export function OverviewTabContent({ players, activities, onPlayerSelect }: OverviewTabContentProps) {
  // Filter match activities
  const matches = activities.filter(activity => activity.type === "match");
  
  // Calculate overall match statistics
  const matchStats = calculateMatchStats(matches);
  
  // Fetch leagues data
  const { data: leaguesWithMatches = [], isLoading } = useQuery({
    queryKey: ["leagues-with-matches", activities.length],
    queryFn: async () => {
      const { data: leagues, error } = await supabase
        .from("leagues")
        .select("*")
        .order("year", { ascending: false })
        .order("name");
        
      if (error) {
        console.error("Error fetching leagues:", error);
        throw error;
      }
      
      return (leagues || []).map((league: League) => {
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
        
        return {
          ...league,
          matches: leagueMatches,
          wins,
          draws,
          losses
        };
      });
    },
  });

  // Handle player click
  const handlePlayerClick = (playerId: string) => {
    if (onPlayerSelect) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        onPlayerSelect(player);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Match Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Matchstatistik
          </CardTitle>
          <CardDescription>Översikt över lagets totala matchresultat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Matcher</p>
              <p className="text-2xl font-bold">{matchStats.totalMatches}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600">Vinster</p>
              <p className="text-2xl font-bold">
                {matchStats.wins} 
                <span className="text-sm text-muted-foreground">
                  ({matchStats.totalMatches > 0 ? Math.round((matchStats.wins / matchStats.totalMatches) * 100) : 0}%)
                </span>
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-600">Oavgjorda</p>
              <p className="text-2xl font-bold">
                {matchStats.draws} 
                <span className="text-sm text-muted-foreground">
                  ({matchStats.totalMatches > 0 ? Math.round((matchStats.draws / matchStats.totalMatches) * 100) : 0}%)
                </span>
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600">Förluster</p>
              <p className="text-2xl font-bold">
                {matchStats.losses} 
                <span className="text-sm text-muted-foreground">
                  ({matchStats.totalMatches > 0 ? Math.round((matchStats.losses / matchStats.totalMatches) * 100) : 0}%)
                </span>
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Gjorda mål</p>
              <p className="text-2xl font-bold">{matchStats.goalsScored}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Insläppta mål</p>
              <p className="text-2xl font-bold">{matchStats.goalsConceded}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Hållna nollor</p>
              <p className="text-2xl font-bold">
                {matchStats.cleanSheets} 
                <span className="text-sm text-muted-foreground">
                  ({matchStats.totalMatches > 0 ? Math.round((matchStats.cleanSheets / matchStats.totalMatches) * 100) : 0}%)
                </span>
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Mål per match</p>
              <p className="text-2xl font-bold">{matchStats.totalMatches > 0 ? (matchStats.goalsScored / matchStats.totalMatches).toFixed(1) : "0"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Match Stats - Top Goal Scorers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Spelare med flest mål
          </CardTitle>
          <CardDescription>Målstatistik för de bästa målskyttarna</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 h-[280px] overflow-y-auto">
          {useMemo(() => {
            // Calculate player statistics from activities
            const stats = new Map<string, { name: string, matches: number, goals: number }>();
            
            // Initialize stats for all players
            players.forEach(player => {
              stats.set(player.id, {
                name: player.name,
                matches: 0,
                goals: 0
              });
            });
            
            // Count matches and goals
            matches.forEach(activity => {
              // Count participations as matches
              activity.participants?.forEach(playerId => {
                const playerStat = stats.get(playerId);
                if (playerStat) {
                  playerStat.matches += 1;
                }
              });
              
              // Count goals if available in player_stats
              if (activity.player_stats?.goals) {
                Object.entries(activity.player_stats.goals).forEach(([playerId, goals]) => {
                  const playerStat = stats.get(playerId);
                  if (playerStat) {
                    playerStat.goals += goals;
                  }
                });
              }
            });
            
            // Convert to array and sort by goals
            return Array.from(stats.values())
              .filter(stat => stat.matches > 0)
              .sort((a, b) => b.goals - a.goals)
              .slice(0, 10);
          }, [matches, players]).map((player, index) => (
            <div 
              key={index}
              className={`flex justify-between items-center p-3 rounded-md ${onPlayerSelect ? 'cursor-pointer hover:bg-muted' : ''}`}
              onClick={onPlayerSelect ? () => handlePlayerClick(players.find(p => p.name === player.name)?.id || '') : undefined}
            >
              <span className="font-medium">{player.name}</span>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{player.goals}</span> mål
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{player.matches}</span> matcher
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Leagues statistics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ligastatistik
          </CardTitle>
          <CardDescription>Översikt över lagets ligamatcher</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4 text-center">Laddar ligastatistik...</div>
          ) : leaguesWithMatches.length > 0 ? (
            <LeaguesList 
              leagues={leaguesWithMatches}
              players={players}
              onPlayerSelect={handlePlayerClick}
            />
          ) : (
            <div className="p-4 text-center">Inga ligor hittades</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
