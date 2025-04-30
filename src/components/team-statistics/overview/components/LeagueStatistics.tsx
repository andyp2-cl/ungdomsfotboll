
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LeaguesList } from "@/components/player-management/statistics/leagues/components/LeaguesList";

interface LeagueStatisticsProps {
  activities: Activity[];
  players: Player[];
  onPlayerClick?: (playerId: string) => void;
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

export function LeagueStatistics({ activities, players, onPlayerClick }: LeagueStatisticsProps) {
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
          activity => String(activity.type) === "match" && activity.league_id === league.id
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

  return (
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
            onPlayerSelect={onPlayerClick}
          />
        ) : (
          <div className="p-4 text-center">Inga ligor hittades</div>
        )}
      </CardContent>
    </Card>
  );
}
