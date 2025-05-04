
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
    
    // Attempt to connect anonymously on page load
    connectAnonymously().then(success => {
      if (success) {
        setSyncStatus("connected");
      } else {
        // Check Supabase connection - with aggressive retry mechanism
        const checkConnection = async (retryCount = 0) => {
          try {
            if (!isOnline) {
              setSyncStatus("disconnected");
              return;
            }
            
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
            
            // After multiple failed attempts
            if (retryCount >= 3) {
              setSyncStatus("disconnected");
              return;
            }
            
            // Retry with delay
            setTimeout(() => checkConnection(retryCount + 1), 1000);
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
      }
    });
    
    // Set up periodic connection checking for reconnection attempts
    const intervalId = setInterval(() => {
      if (syncStatus !== "connected" && isOnline) {
        // Only recheck if not already connected and we're online
        connectAnonymously().then(success => {
          if (success) {
            setSyncStatus("connected");
          }
        });
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
};
