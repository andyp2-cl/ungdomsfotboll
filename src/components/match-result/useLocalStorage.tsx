
import { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { toast } from "sonner";

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

  const saveToLocalStorage = (activityId: string, data: any) => {
    const pendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
    pendingUpdates[activityId] = {
      ...data,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
  };

  const notifyUser = (isOnline: boolean, isAuthenticated: boolean) => {
    if (!isOnline) {
      toast.info("Offline. Resultat sparat lokalt och synkas när du är online igen.");
    } else if (!isAuthenticated) {
      toast.info("Resultat sparat lokalt. Logga in för att synka med databasen.");
    } else {
      toast.success("Resultat sparat och synkroniserat med databasen");
    }
  };

  return {
    isOnline,
    saveToLocalStorage,
    notifyUser
  };
}
