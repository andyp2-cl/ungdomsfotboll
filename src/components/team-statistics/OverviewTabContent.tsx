
import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy, Target, Award, ShieldCheck, Clock, Calendar, Percent } from "lucide-react";
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

  // Calculate top goal scorers
  const topGoalScorers = useMemo(() => {
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
      .filter(stat => stat.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  }, [matches, players]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Match Statistics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Matchstatistik
          </CardTitle>
          <CardDescription>Översikt över lagets totala matchresultat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-700" />
                <p className="text-sm font-medium text-slate-700">Matcher</p>
              </div>
              <p className="text-2xl font-bold mt-2">{matchStats.totalMatches}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-600">Vinster</p>
              </div>
              <p className="text-2xl font-bold mt-2 text-green-700">
                {matchStats.wins} 
                <span className="text-sm ml-1 text-green-500">
                  ({matchStats.totalMatches > 0 ? Math.round((matchStats.wins / matchStats.totalMatches) * 100) : 0}%)
                </span>
              </p>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-600">Oavgjorda</p>
              </div>
              <p className="text-2xl font-bold mt-2 text-amber-700">
                {matchStats.draws} 
                <span className="text-sm ml-1 text-amber-500">
                  ({matchStats.totalMatches > 0 ? Math.round((matchStats.draws / matchStats.totalMatches) * 100) : 0}%)
                </span>
              </p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-600">Förluster</p>
              </div>
              <p className="text-2xl font-bold mt-2 text-red-700">
                {matchStats.losses} 
                <span className="text-sm ml-1 text-red-500">
                  ({matchStats.totalMatches > 0 ? Math.round((matchStats.losses / matchStats.totalMatches) * 100) : 0}%)
                </span>
              </p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-slate-700">Gjorda mål</p>
              </div>
              <p className="text-2xl font-bold mt-2">{matchStats.goalsScored}</p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-600" />
                <p className="text-sm font-medium text-slate-700">Insläppta mål</p>
              </div>
              <p className="text-2xl font-bold mt-2">{matchStats.goalsConceded}</p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-slate-700">Hållna nollor</p>
              </div>
              <p className="text-2xl font-bold mt-2">
                {matchStats.cleanSheets} 
                <span className="text-sm ml-1 text-slate-500">
                  ({matchStats.totalMatches > 0 ? Math.round((matchStats.cleanSheets / matchStats.totalMatches) * 100) : 0}%)
                </span>
              </p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-medium text-slate-700">Mål per match</p>
              </div>
              <p className="text-2xl font-bold mt-2">{matchStats.totalMatches > 0 ? (matchStats.goalsScored / matchStats.totalMatches).toFixed(1) : "0"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Match Stats - Top Goal Scorers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Spelare med flest mål
          </CardTitle>
          <CardDescription>Målstatistik för de bästa målskyttarna</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 h-[280px] overflow-y-auto">
          {topGoalScorers.map((player, index) => (
            <div 
              key={index}
              className={`flex justify-between items-center p-3 rounded-md ${index % 2 === 0 ? 'bg-slate-50' : ''} ${onPlayerSelect ? 'cursor-pointer hover:bg-muted' : ''}`}
              onClick={onPlayerSelect ? () => handlePlayerClick(players.find(p => p.name === player.name)?.id || '') : undefined}
            >
              <div className="flex items-center">
                <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-xs font-bold mr-2">
                  {index + 1}
                </span>
                <span className="font-medium">{player.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium text-green-600">{player.goals}</span> mål
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{player.matches}</span> matcher
                </div>
                <div className="text-sm text-blue-600">
                  {player.matches > 0 ? (player.goals / player.matches).toFixed(1) : "0"} mål/match
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Leagues statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
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
