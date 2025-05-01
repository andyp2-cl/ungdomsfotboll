
import { useState, useEffect } from 'react';
import { Activity } from '@/types/player';
import { toast } from 'sonner';

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
  const saveToLocalStorage = (activityId: string, data: MatchResult) => {
    try {
      // Get current pending updates
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
      
      // Add or update this activity's result
      pendingUpdates[activityId] = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // Save back to localStorage
      localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
      
      console.log("Saved match result to localStorage:", { activityId, data });
      
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
