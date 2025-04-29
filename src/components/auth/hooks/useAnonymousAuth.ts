import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkPendingUpdates, testDatabaseAccess, cacheSuccessfulConnection, getConnectionError, clearConnectionCache } from "../utils/databaseUtils";

export function useAnonymousAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRLSEnabled, setIsRLSEnabled] = useState(false);
  const [pendingUpdatesCount, setPendingUpdatesCount] = useState(0);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Check for connection error from local storage on mount
  useEffect(() => {
    const storedError = getConnectionError();
    if (storedError) {
      setConnectionError(storedError);
    }
  }, []);
  
  // Check for pending updates periodically
  useEffect(() => {
    const updatePendingCount = () => {
      const count = checkPendingUpdates();
      setPendingUpdatesCount(count);
    };
    
    // Initial check
    updatePendingCount();
    
    // Periodic check
    const intervalId = setInterval(updatePendingCount, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("Device went online at", new Date().toISOString());
      setIsOnline(true);
      // Force reconnection when device goes online
      setIsConnecting(true);
      checkDatabaseConnection();
    };
    
    const handleOffline = () => {
      console.log("Device went offline at", new Date().toISOString());
      setIsOnline(false);
      setIsConnecting(false);
      setConnectionChecked(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check database connection
  const checkDatabaseConnection = async () => {
    if (!isOnline) {
      setConnectionChecked(true);
      setIsConnecting(false);
      return;
    }
    
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      console.log("Checking database connection at", new Date().toISOString());
      
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      // Test database access
      const { success, error } = await testDatabaseAccess();
      
      if (success) {
        setIsRLSEnabled(true);
        setConnectionError(null);
      } else {
        setIsRLSEnabled(false);
        setConnectionError(error || "Kunde inte ansluta till databasen");
        console.error("Database connection error:", error);
      }
    } catch (error) {
      console.error("Error checking database connection:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown connection error";
      setConnectionError(errorMessage);
      setIsRLSEnabled(false);
    } finally {
      setConnectionChecked(true);
      setIsConnecting(false);
    }
  };
  
  // Check for existing session with improved persistence
  useEffect(() => {
    // Initial connection check
    checkDatabaseConnection();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Has session:", !!session);
      setIsAuthenticated(!!session);
      
      // Test database access whenever auth state changes
      if (session) {
        setIsConnecting(true);
        await checkDatabaseConnection();
      }
    });
    
    // Set up periodic connection check (every 5 minutes)
    const intervalId = setInterval(() => {
      console.log("Performing periodic connection check");
      checkDatabaseConnection();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [isOnline]);
  
  const handleLogin = async () => {
    if (!isOnline) {
      toast.error("Ingen internetanslutning. Databasåtkomst kräver uppkoppling.");
      return;
    }
    
    try {
      setIsAuthenticating(true);
      
      // Since anonymous auth is disabled, switch to magic link option
      const email = prompt("Ange din e-postadress för att aktivera databasåtkomst:");
      
      if (!email) {
        setIsAuthenticating(false);
        toast.error("Ingen e-postadress angiven");
        return;
      }
      
      // Send a magic link to the user
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error("Authentication error:", error);
        toast.error("Kunde inte skicka inloggningslänk: " + error.message);
        setConnectionError(error.message);
      } else {
        toast.success("En inloggningslänk har skickats till din e-post");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown authentication error";
      setConnectionError(errorMessage);
      toast.error("Ett fel uppstod vid aktivering av databasåtkomst");
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Trigger manual sync from pending updates in localStorage
  const handleSyncPendingUpdates = () => {
    // If we have a connection error, try to reconnect
    if (connectionError) {
      clearConnectionCache();
      setIsConnecting(true);
      setConnectionError(null);
      checkDatabaseConnection();
      return;
    }
    
    // Otherwise handle syncing pending updates
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (!pendingUpdatesJson) {
      toast.info("Inga ändringar att synkronisera");
      return;
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    const count = Object.keys(pendingUpdates).length;
    
    if (count > 0) {
      // In offline mode, we can still show this information
      toast.loading(`${count} ändringar sparade lokalt och väntar på synkronisering`);
      
      // Only force reload if we're online
      if (isOnline) {
        toast.loading(`Synkroniserar ${count} ändringar till databasen...`);
        // Force reload page to trigger sync
        window.location.reload();
      } else {
        toast.info("Ändringar synkas automatiskt när du är online igen");
      }
    } else {
      toast.info("Inga ändringar att synkronisera");
    }
  };

  return {
    isAuthenticated,
    isAuthenticating,
    isOnline,
    isRLSEnabled,
    pendingUpdatesCount,
    connectionChecked,
    isConnecting,
    connectionError,
    handleLogin,
    handleSyncPendingUpdates,
    checkDatabaseConnection
  };
}
