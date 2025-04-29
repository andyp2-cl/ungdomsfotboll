
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAnonymousAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRLSEnabled, setIsRLSEnabled] = useState(false);
  
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
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session) {
          await testDatabaseAccess(session.access_token);
        } else {
          // Authentication will now be manual only, as anonymous auth is disabled
          console.log("No session found, user will need to authenticate manually");
        }
      } catch (error) {
        console.error("Error checking session:", error);
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
  }, []);
  
  // Test if we can access the database
  const testDatabaseAccess = async (token: string) => {
    try {
      // Try a simple read operation to test database access
      const { data, error } = await supabase
        .from('leagues')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error("Database access test failed:", error);
        setIsRLSEnabled(false);
        toast.warning("Begränsad databastillgång. Vissa funktioner kan vara otillgängliga.");
        return;
      }
      
      console.log("Database access test passed:", data);
      setIsRLSEnabled(true);
    } catch (error) {
      console.error("Error testing database access:", error);
      setIsRLSEnabled(false);
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
      // or email/password login is the preferred solution long-term
      const email = prompt("Ange din e-postadress för att aktivera databasåtkomst:");
      
      if (!email) {
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
    handleLogin,
    handleSyncPendingUpdates
  };
}
