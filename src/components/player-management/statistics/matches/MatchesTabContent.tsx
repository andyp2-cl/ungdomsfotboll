
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
    
    completedMatches.forEach(match => {
      // Get our team name for better detection
      const isHomeTeam = match.name.toLowerCase().includes('hässleholms if') && 
                      !match.name.toLowerCase().includes(' vs ') && 
                      match.name.toLowerCase().split(' - ')[0].trim().toLowerCase().includes('hässleholms if');
                      
      // Check for draws first
      if (match.homeScore !== undefined && match.awayScore !== undefined && 
          match.homeScore === match.awayScore) {
        draws++;
      }
      // Then check if isWin is explicitly set
      else if (match.isWin === true) {
        wins++;
      } else if (match.isWin === false) {
        losses++;
      }
      
      // Calculate our score and opponent score
      if (match.homeScore !== undefined && match.awayScore !== undefined && 
          match.homeScore !== null && match.awayScore !== null) {
        
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
      }
    });
    
    return {
      total: completedMatches.length,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      cleanSheets
      // Removed winPercentage, comebackWins, homeWins, awayWins
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
