
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkPendingUpdates, cacheSuccessfulConnection } from "../utils/databaseUtils";

export function useAnonymousAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRLSEnabled, setIsRLSEnabled] = useState(false);
  const [pendingUpdatesCount, setPendingUpdatesCount] = useState(0);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  
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
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check for existing session with improved persistence
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Set initial connecting state
        setIsConnecting(true);
        
        // First check if we have cached connection status from a previous visit
        const cachedConnection = localStorage.getItem('sb-connection-test');
        const cachedTimestamp = localStorage.getItem('sb-connection-test-time');
        const currentTime = Date.now();
        const sixHoursAgo = currentTime - (6 * 60 * 60 * 1000);
        
        // If we have a cached connection that's less than 6 hours old, consider it valid
        if (
          cachedConnection === 'true' && 
          cachedTimestamp && 
          parseInt(cachedTimestamp) > sixHoursAgo
        ) {
          console.log("Using cached connection status (less than 6 hours old)");
          setConnectionChecked(true);
          setIsRLSEnabled(true);
          setIsConnecting(false);
          return;
        }
        
        // Then check current session
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session) {
          const connected = await testDatabaseAccess(session.access_token);
          setConnectionChecked(true);
          setIsConnecting(false);
          
          if (connected) {
            // Force cache the successful connection with timestamp
            cacheSuccessfulConnection();
          }
        } else {
          // No session, try anonymous access
          const connected = await testDatabaseAccess();
          setConnectionChecked(true);
          setIsConnecting(false);
          
          if (connected) {
            // Force cache the successful connection with timestamp
            cacheSuccessfulConnection();
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setConnectionChecked(true);
        setIsConnecting(false);
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      
      // Test database access whenever auth state changes
      if (session) {
        setIsConnecting(true);
        await testDatabaseAccess(session.access_token);
        setIsConnecting(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isOnline]);
  
  // Test if we can access the database with improved caching
  const testDatabaseAccess = async (token?: string) => {
    try {
      // Skip test if offline
      if (!isOnline) {
        setConnectionChecked(true);
        setIsConnecting(false);
        return false;
      }
      
      // Try a simple read operation to test database access
      const { data, error } = await supabase
        .from('leagues')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error("Database access test failed:", error);
        setIsRLSEnabled(false);
        setConnectionChecked(true);
        
        // Only show toast if we haven't shown it already
        if (!localStorage.getItem('db-warning-shown')) {
          toast.warning("Begränsad databastillgång. Vissa funktioner kan vara otillgängliga.");
          localStorage.setItem('db-warning-shown', 'true');
        }
        return false;
      }
      
      console.log("Database access test passed:", data);
      setIsRLSEnabled(true);
      setConnectionChecked(true);
      
      // Cache successful connection with timestamp
      cacheSuccessfulConnection();
      return true;
    } catch (error) {
      console.error("Error testing database access:", error);
      setIsRLSEnabled(false);
      setConnectionChecked(true);
      return false;
    }
  };
  
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
      } else {
        toast.success("En inloggningslänk har skickats till din e-post");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      toast.error("Ett fel uppstod vid aktivering av databasåtkomst");
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Trigger manual sync from pending updates in localStorage
  const handleSyncPendingUpdates = () => {
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
    handleLogin,
    handleSyncPendingUpdates
  };
}
