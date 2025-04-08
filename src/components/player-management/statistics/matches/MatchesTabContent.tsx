
import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { calculateGoalStats } from "../goals/calculateGoalStats";
import { MatchResultChart } from "./MatchResultChart";
import { MatchStatsCard } from "./MatchStatsCard";
import { DetailedMatchStats } from "./DetailedMatchStats";

interface MatchesTabContentProps {
  activities: Activity[];
  players?: Player[];
  onPlayerSelect?: (player: Player) => void;
}

export function MatchesTabContent({ activities, players = [], onPlayerSelect }: MatchesTabContentProps) {
  // Filter out only completed historical matches (those with a result)
  const completedMatches = useMemo(() => {
    const now = new Date();
    
    return activities.filter(a => {
      // Filter out future matches
      const matchDate = new Date(a.date);
      if (a.time) {
        const [hours, minutes] = a.time.split(':').map(Number);
        matchDate.setHours(hours || 0, minutes || 0);
      } else {
        matchDate.setHours(23, 59, 59);
      }
      
      if (matchDate > now) {
        return false;
      }
      
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
    
    // Calculate additional statistics for display
    const winPercentage = completedMatches.length > 0 
      ? Math.round((wins / completedMatches.length) * 100) 
      : 0;
    
    return {
      total: completedMatches.length,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      cleanSheets,
      winPercentage,
      // Add empty values for homeWins and awayWins to match the expected interface
      homeWins: 0,
      awayWins: 0
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
