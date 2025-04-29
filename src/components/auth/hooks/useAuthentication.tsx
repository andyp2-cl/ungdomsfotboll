import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session, User } from '@supabase/supabase-js';

export function useAuthentication() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitializing, setIsInitializing] = useState(true);
  const [email, setEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [rememberLogin, setRememberLogin] = useState(true);
  
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
  
  // Test if we can access the database - with retry mechanism
  const testDatabaseAccess = useCallback(async () => {
    try {
      // Try a simple read operation with retry logic
      let attempts = 0;
      let success = false;
      
      while (attempts < 3 && !success) {
        const { data, error } = await supabase
          .from('leagues')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error(`Database access test failed (attempt ${attempts + 1}):`, error);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } else {
          console.log("Database access test passed:", data);
          success = true;
          
          // Cache successful connection test
          localStorage.setItem('sb-connection-test', 'true');
          return true;
        }
      }
      
      if (!success) {
        toast.warning("Begränsad databastillgång. Logga in för full funktionalitet.");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error testing database access:", error);
      return false;
    }
  }, []);
  
  // Check for existing session with improved error handling and retry logic
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsInitializing(true);
        
        // First try to get session from storage
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        setSession(session);
        setUser(session?.user || null);
        
        if (session) {
          // Set extended session persistence immediately
          localStorage.setItem('sb-session-persistence', 'true');
          localStorage.setItem('supabase.auth.token.expiry', 
            (Date.now() + (30 * 24 * 60 * 60 * 1000)).toString());
          
          // Test database access with the current session
          await testDatabaseAccess();
        } else {
          // If no session found, try to refresh it with retry logic
          let refreshAttempts = 0;
          let refreshSuccess = false;
          
          while (refreshAttempts < 2 && !refreshSuccess) {
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              
              if (!refreshError && refreshData.session) {
                setIsAuthenticated(true);
                setSession(refreshData.session);
                setUser(refreshData.session.user || null);
                refreshSuccess = true;
                await testDatabaseAccess();
                console.log("Session refreshed successfully (attempt", refreshAttempts + 1, ")");
                
                // Set extended session expiry after successful refresh
                localStorage.setItem('supabase.auth.token.expiry', 
                  (Date.now() + (30 * 24 * 60 * 60 * 1000)).toString());
              } else {
                console.log("Session refresh failed, attempt", refreshAttempts + 1, refreshError?.message);
                refreshAttempts++;
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } catch (err) {
              console.error("Error during session refresh attempt", refreshAttempts + 1, ":", err);
              refreshAttempts++;
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          // After all refresh attempts
          if (!refreshSuccess) {
            // Check if we have a remembered login
            const rememberedLogin = localStorage.getItem('rememberLogin') === 'true';
            if (rememberedLogin) {
              // Prompt user to re-login if they had a remembered session
              toast.warning("Sessionen har upphört. Logga in på nytt för att återansluta till databasen.");
            }
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      setIsAuthenticated(!!session);
      setSession(session);
      setUser(session?.user || null);
      
      if (session) {
        toast.success("Inloggad som " + (session.user.email || "användare"));
        setShowLogin(false);
        await testDatabaseAccess();
        
        if (rememberLogin) {
          // Set a persistent flag to remember this login
          localStorage.setItem('rememberLogin', 'true');
          // Extended session - 30 days
          localStorage.setItem('supabase.auth.token.expiry', 
            (Date.now() + (30 * 24 * 60 * 60 * 1000)).toString());
          
          // Force cache the connection state
          localStorage.setItem('sb-connection-test', 'true');
        }
        
        // Try to sync any pending changes when user logs in
        const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
        if (pendingUpdatesJson) {
          const pendingUpdates = JSON.parse(pendingUpdatesJson);
          const count = Object.keys(pendingUpdates).length;
          if (count > 0) {
            toast.info(`${count} ändringar att synkronisera`);
            setTimeout(() => triggerSync(), 1000);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        toast.info("Du har loggat ut");
        // Clear connection test cache on logout
        localStorage.removeItem('sb-connection-test');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [rememberLogin, testDatabaseAccess]);

  // Test if we can access the database
  const testDatabaseAccess = async () => {
    try {
      // Try a simple read operation with retry logic
      let attempts = 0;
      let success = false;
      
      while (attempts < 3 && !success) {
        const { data, error } = await supabase
          .from('leagues')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error(`Database access test failed (attempt ${attempts + 1}):`, error);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } else {
          console.log("Database access test passed:", data);
          success = true;
          return true;
        }
      }
      
      if (!success) {
        toast.warning("Begränsad databastillgång. Logga in för full funktionalitet.");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error testing database access:", error);
      return false;
    }
  };
  
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!isOnline) {
      toast.error("Ingen internetanslutning. Databasåtkomst kräver uppkoppling.");
      return;
    }
    
    if (!email || !email.includes('@')) {
      toast.error("Ange en giltig e-postadress");
      return;
    }
    
    try {
      setIsAuthenticating(true);
      
      // Send a magic link to the user with extended session options
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: true,
          data: {
            remember_me: rememberLogin
          }
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

  const handleLogout = async () => {
    try {
      // Clear connection status cache before logout
      localStorage.removeItem('sb-connection-test');
      
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('rememberLogin');
      toast.info("Du har loggat ut");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Kunde inte logga ut");
    }
  };
  
  // Trigger sync process
  const triggerSync = () => {
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (!pendingUpdatesJson) {
      toast.info("Inga ändringar att synkronisera");
      return;
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    const count = Object.keys(pendingUpdates).length;
    
    if (count > 0) {
      // In offline mode, we can still show this information
      if (!isOnline) {
        toast.warning(`${count} ändringar sparade lokalt och väntar på synkronisering`);
        toast.info("Ändringar synkas automatiskt när du är online igen");
      } else if (!isAuthenticated) {
        toast.warning(`${count} ändringar sparade lokalt. Logga in för att synkronisera.`);
        setShowLogin(true);
      } else {
        toast.loading(`Synkroniserar ${count} ändringar till databasen...`);
        // Force reload page to trigger sync
        window.location.reload();
      }
    } else {
      toast.info("Inga ändringar att synkronisera");
    }
  };

  return {
    isAuthenticated,
    isAuthenticating,
    isOnline,
    isInitializing,
    email,
    setEmail,
    showLogin,
    setShowLogin,
    session,
    user,
    rememberLogin,
    setRememberLogin,
    handleLogin,
    handleLogout,
    triggerSync,
    testDatabaseAccess
  };
}
