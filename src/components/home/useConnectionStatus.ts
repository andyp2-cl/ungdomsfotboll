
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { connectAnonymously } from "@/components/auth/utils/databaseUtils";

type SyncStatus = "connected" | "connecting" | "disconnected" | "not-configured";

export const useConnectionStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("connecting");
  const [isReconnecting, setIsReconnecting] = useState(false);
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
  
  useEffect(() => {
    // Check if already connected using localStorage
    const connectionTest = localStorage.getItem('sb-connection-test');
    if (connectionTest === 'true') {
      setSyncStatus("connected");
      return;
    }
    
    // Check Supabase connection - with aggressive retry mechanism
    const checkConnection = async (retryCount = 0) => {
      try {
        if (!isOnline) {
          setSyncStatus("disconnected");
          return;
        }
        
        // First check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Connection check: Session exists?", !!session);
        
        // Try a simple query to verify connection
        const { error } = await supabase
          .from('leagues')
          .select('id')
          .limit(1);
        
        if (!error) {
          console.log(`Database connection successful on attempt ${retryCount + 1}`);
          setSyncStatus("connected");
          localStorage.setItem('sb-connection-test', 'true');
          localStorage.setItem('sb-connection-test-time', Date.now().toString());
          return;
        }
        
        // If we have a session but can't access data, try to refresh the session
        if (retryCount < 3 && session) {
          console.log(`Connection attempt failed. Retrying with session refresh (attempt ${retryCount + 1})...`);
          
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
              console.error("Error refreshing session during connection check:", error);
            } else {
              console.log("Session refreshed during connection check");
            }
          } catch (refreshError) {
            console.error("Exception refreshing session:", refreshError);
          }
          
          // Add slight delay before retry
          setTimeout(() => checkConnection(retryCount + 1), 1000);
          return;
        }
        
        // After multiple failed attempts
        setSyncStatus("disconnected");
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
        
        // Still retry if within retry count
        if (retryCount < 3) {
          setTimeout(() => checkConnection(retryCount + 1), 1000);
        } else {
          setSyncStatus("disconnected");
        }
      }
    };
    
    // Start connection process
    checkConnection();
    
    // Set up periodic connection checking for reconnection attempts
    const intervalId = setInterval(() => {
      if (syncStatus !== "connected" && isOnline) {
        // Only recheck if not already connected and we're online
        checkConnection();
      }
    }, 30000); // Check every 30 seconds if not connected
    
    return () => clearInterval(intervalId);
  }, [syncStatus, isOnline]);
  
  return {
    syncStatus,
    setSyncStatus,
    isReconnecting,
    setIsReconnecting,
    isOnline,
  };
}
