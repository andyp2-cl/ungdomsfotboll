
import { useState, useEffect } from 'react';
import { Activity } from '@/types/player';
import { toast } from 'sonner';
import { isHomeMatch, calculateWinStatus } from '@/components/activity-detail/match-result/utils';

interface MatchResult {
  homeScore?: number;
  awayScore?: number;
  isWin?: boolean;
  result?: string;
}

export function useLocalStorage(activity: Activity) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitor online/offline status
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
      // Determine if it's a home match
      const isHome = isHomeMatch(activity);
      
      // Calculate win status
      const isWin = calculateWinStatus(homeScore, awayScore, isHome);
      
      // Debug the win status calculation
      console.log(`Local Storage: Calculated isWin=${isWin} for activity ${activityId} with scores ${homeScore}-${awayScore}, isHome=${isHome}`);
      
      // Prepare data
      const data: MatchResult = {
        homeScore,
        awayScore,
        isWin, // This will be true/false/undefined (undefined for draw)
        result: homeScore !== undefined && awayScore !== undefined ? 
          `${homeScore}-${awayScore}` : undefined
      };
      
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
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('matchScores', JSON.stringify(matchScores));
      
      console.log("Saved match result to localStorage:", { 
        activityId, 
        ...data,
        isHome
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
