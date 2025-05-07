
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Player } from "@/types/player";
import { Badge } from "@/components/ui/badge";

interface LeaguesStatsCardProps {
  player: Player;
  activities: Activity[];
}

export function LeaguesStatsCard({ player, activities }: LeaguesStatsCardProps) {
  const leaguesStats = useMemo(() => {
    // Get all league matches played by the player
    const playerMatches = activities.filter(activity => 
      activity.participants?.includes(player.id) && 
      activity.type === "match" &&
      activity.league_id
    );
    
    // Group matches by league
    const leagueMatches = playerMatches.reduce((acc, match) => {
      if (!match.league_id) return acc;
      
      if (!acc[match.league_id]) {
        // Extract basic info
        let leagueName = match.league_id ? match.leagueId || match.league_id : "";
        
        // Fix duplicate year in league name
        if (leagueName) {
          const yearMatch = leagueName.match(/^(\d{4})\s+\1/);
          if (yearMatch) {
            // Remove the duplicate year
            leagueName = leagueName.substring(yearMatch[1].length + 1);
          }
        }
        
        acc[match.league_id] = {
          id: match.league_id,
          name: leagueName,
          year: new Date(match.date).getFullYear(), // Use date to extract year instead
          matches: 0,
          wins: 0,
          draws: 0,
          losses: 0
        };
      }
      
      const league = acc[match.league_id];
      league.matches++;
      
      if (match.isWin === true) {
        league.wins++;
      } else if (match.isWin === false) {
        league.losses++;
      } else if (match.homeScore !== undefined && match.awayScore !== undefined && 
                match.homeScore === match.awayScore) {
        league.draws++;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(leagueMatches);
  }, [player, activities]);
  
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Ligamatcher</CardTitle>
      </CardHeader>
      <CardContent>
        {leaguesStats.length > 0 ? (
          <div className="space-y-2">
            {leaguesStats.map(league => (
              <div key={league.id} className="flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{league.year} {league.name}:</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="success" className="text-xs">V: {league.wins}</Badge>
                    <Badge variant="outline" className="text-xs">O: {league.draws}</Badge>
                    <Badge variant="destructive" className="text-xs">F: {league.losses}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-muted-foreground">
            Inga ligamatcher
          </div>
        )}
      </CardContent>
    </Card>
  );
}
