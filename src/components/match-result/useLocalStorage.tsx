
import { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { toast } from "sonner";
import { isHomeMatch, calculateWinStatus, extractTeamNames, isHassleholm } from '@/components/activity-detail/match-result/utils';

interface MatchResult {
  homeScore?: number;
  awayScore?: number;
  isWin?: boolean;
  result?: string;
  player_stats?: {
    goals?: Record<string, number>;
    assists?: Record<string, number>;
  };
}

export function useLocalStorage(activity: Activity) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitor online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check for pending updates when coming back online
  useEffect(() => {
    if (isOnline) {
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
      const count = Object.keys(pendingUpdates).length;
      
      if (count > 0) {
        toast.info(`Du har ${count} matchresultat som väntar på att synkas. Synkning kommer att ske automatiskt när du går till aktivitetssidan.`);
      }
    }
  }, [isOnline]);
  
  // Save match result to local storage
  const saveToLocalStorage = (activityId: string, homeScore?: number, awayScore?: number) => {
    try {
      // Enhanced logic to determine if Hässleholms IF won the match
      let isWin: boolean | undefined;
      
      // Only calculate outcome if we have scores
      if (homeScore !== undefined && awayScore !== undefined) {
        // For draws (equal scores), isWin will be undefined
        if (homeScore === awayScore) {
          isWin = undefined; // Draw
          console.log("Match is a draw");
        } else {
          // Extract team names to check which team is Hässleholms IF
          const { homeTeam, awayTeam } = extractTeamNames(activity);
          const isHifHome = isHassleholm(homeTeam);
          const isHifAway = isHassleholm(awayTeam);
          
          console.log("Team detection:", {
            homeTeam,
            awayTeam,
            isHifHome,
            isHifAway
          });
          
          // If we can identify that Hässleholms IF is home or away, use that to determine win
          if (isHifHome) {
            isWin = homeScore > awayScore;
            console.log(`HIF is home team, ${isWin ? "win" : "loss"}`);
          } else if (isHifAway) {
            isWin = awayScore > homeScore;
            console.log(`HIF is away team, ${isWin ? "win" : "loss"}`);
          } else {
            // If we can't identify by name, fall back to using isHomeMatch
            const isHome = isHomeMatch(activity);
            isWin = isHome ? (homeScore > awayScore) : (awayScore > homeScore);
            console.log(`Could not detect HIF in team names, using fallback: isHome=${isHome}, isWin=${isWin}`);
          }
        }
        
        console.log(`Determined match outcome for ${activity.name}: ${isWin === undefined ? 'draw' : isWin ? 'win' : 'loss'}`);
      }
      
      // Important: Make a deep copy of player_stats to avoid reference issues
      let player_stats = undefined;
      if (activity.player_stats) {
        player_stats = JSON.parse(JSON.stringify(activity.player_stats));
      } else {
        player_stats = { goals: {}, assists: {} };
      }
      
      // Prepare data with player_stats included
      const data: MatchResult = {
        homeScore,
        awayScore,
        isWin, // This will be true/false/undefined (undefined for draw)
        result: homeScore !== undefined && awayScore !== undefined ? 
          `${homeScore}-${awayScore}` : undefined,
        player_stats: player_stats
      };
      
      console.log("Saving player_stats to localStorage:", player_stats);
      
      // Get current pending updates
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
      
      // Add or update this activity's result
      pendingUpdates[activityId] = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // Save back to localStorage
      localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
      
      // Also save in the matchScores storage for redundancy
      const matchScores = JSON.parse(localStorage.getItem('matchScores') || '{}');
      matchScores[activityId] = {
        homeScore,
        awayScore,
        isWin,
        result: data.result,
        player_stats: data.player_stats, 
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('matchScores', JSON.stringify(matchScores));
      
      console.log("Saved match result to localStorage:", { 
        activityId, 
        ...data,
        isHome: isHomeMatch(activity),
        playerStatsIncluded: !!data.player_stats
      });
      
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  };
  
  // Notify user based on status
  const notifyUser = (isOnline: boolean, isAuthenticated: boolean) => {
    if (!isOnline) {
      toast.success("Matchresultat sparat lokalt", {
        description: "Resultatet kommer att synkas när du får internetanslutning igen"
      });
    } else if (!isAuthenticated) {
      toast.success("Matchresultat sparat lokalt", {
        description: "Logga in för att synka resultatet med databasen"
      });
    } else {
      toast.success("Matchresultat har sparats");
    }
  };
  
  return {
    isOnline,
    saveToLocalStorage,
    notifyUser
  };
}
