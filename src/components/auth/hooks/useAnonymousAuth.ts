
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkPendingUpdates } from "../utils/databaseUtils";

export function useAnonymousAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRLSEnabled, setIsRLSEnabled] = useState(false);
  const [pendingUpdatesCount, setPendingUpdatesCount] = useState(0);
  const [connectionChecked, setConnectionChecked] = useState(false);
  
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
  
  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check if we have cached connection status from a previous visit
        const cachedConnection = localStorage.getItem('sb-connection-test');
        if (cachedConnection === 'true') {
          setConnectionChecked(true);
        }
        
        // Then check current session
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session) {
          await testDatabaseAccess(session.access_token);
          setConnectionChecked(true);
        } else {
          // Authentication will now be manual only
          console.log("No session found, user will need to authenticate manually");
          
          // Only perform an anonymous check if the cache doesn't exist
          if (cachedConnection !== 'true' && isOnline) {
            testDatabaseAccess();
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        
        // Even if there's an error, consider connection checked to avoid loading indicator
        setTimeout(() => setConnectionChecked(true), 1000);
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      console.log("Auth state changed:", event, !!session);
      
      // Test database access whenever auth state changes
      if (session) {
        await testDatabaseAccess(session.access_token);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isOnline]);
  
  // Test if we can access the database
  const testDatabaseAccess = async (token?: string) => {
    try {
      // Skip test if offline
      if (!isOnline) {
        setConnectionChecked(true);
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
      
      // Cache successful connection
      localStorage.setItem('sb-connection-test', 'true');
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
    handleLogin,
    handleSyncPendingUpdates
  };
}
