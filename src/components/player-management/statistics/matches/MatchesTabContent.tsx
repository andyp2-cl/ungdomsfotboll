
import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { calculateGoalStats } from "../goals/calculateGoalStats";
import { MatchResultChart } from "./MatchResultChart";
import { MatchStatsCard } from "./MatchStatsCard";
import { DetailedMatchStats } from "./DetailedMatchStats";

interface MatchesTabContentProps {
  activities: Activity[];
  players?: Player[];
}

export function MatchesTabContent({ activities, players = [] }: MatchesTabContentProps) {
  // Filter out only completed matches (those with a result)
  const completedMatches = useMemo(() => {
    return activities.filter(a => {
      if (a.type !== 'match') return false;
      
      // Consider a match as having result if either result is set directly or 
      // if both homeScore and awayScore are defined and not null
      return (a.result && !a.result.includes('null') && !a.result.includes('undefined')) || 
             (a.homeScore !== undefined && a.awayScore !== undefined && 
              a.homeScore !== null && a.awayScore !== null);
    });
  }, [activities]);
  
  // Get goal statistics from the same function used in GoalsTabContent
  const { totalStats } = useMemo(() => 
    calculateGoalStats(activities, players), 
    [activities, players]
  );
  
  // Calculate match statistics
  const matchStats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let cleanSheets = 0;
    let comebackWins = 0;
    let homeWins = 0;
    let awayWins = 0;
    
    completedMatches.forEach(match => {
      // First check if isWin is explicitly set
      if (match.isWin === true) {
        wins++;
        
        // Determine if we're home or away team
        const isHomeTeam = match.name.toLowerCase().includes('hässleholms if') && 
                        !match.name.toLowerCase().includes(' vs ') || 
                        match.name.toLowerCase().split(' - ')[0].trim().toLowerCase().includes('hässleholms if');
        
        if (isHomeTeam) {
          homeWins++;
        } else {
          awayWins++;
        }
        
      } else if (match.isWin === false) {
        losses++;
      } else if (match.homeScore !== undefined && match.awayScore !== undefined && 
                match.homeScore === match.awayScore) {
        draws++;
      }
      
      // Calculate our score and opponent score
      if (match.homeScore !== undefined && match.awayScore !== undefined && 
          match.homeScore !== null && match.awayScore !== null) {
        // Determine if we're home or away team
        const isHomeTeam = match.name.toLowerCase().includes('hässleholms if') && 
                       !match.name.toLowerCase().includes(' vs ') || 
                       match.name.toLowerCase().split(' - ')[0].trim().toLowerCase().includes('hässleholms if');
        
        // goalsScored is always OUR goals (Hässleholms IF)
        // goalsConceded is always THEIR goals (opponent)
        const ourScore = isHomeTeam ? match.homeScore : match.awayScore;
        const theirScore = isHomeTeam ? match.awayScore : match.homeScore;
        
        goalsScored += ourScore;
        goalsConceded += theirScore;
        
        // Clean sheets - matches where we conceded 0 goals
        if (theirScore === 0) {
          cleanSheets++;
        }
        
        // Count home/away wins - this is now handled above with the isWin check
        
        // Comeback wins - we won despite conceding first
        // This is an approximation since we don't have timeline data
        if (match.isWin === true && theirScore > 0) {
          comebackWins++;
        }
      }
    });
    
    return {
      total: completedMatches.length,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      cleanSheets,
      comebackWins,
      homeWins,
      awayWins,
      winPercentage: completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0
    };
  }, [completedMatches]);

  // If there are no completed matches, show a message
  if (completedMatches.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-muted-foreground">Det finns inga genomförda matcher med resultat.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MatchResultChart matchStats={matchStats} />
      <MatchStatsCard matchStats={matchStats} />
    </div>
  );
}
