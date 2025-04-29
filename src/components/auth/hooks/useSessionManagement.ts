
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Session, User } from '@supabase/supabase-js';
import { 
  testDatabaseAccess, 
  setExtendedSessionPersistence, 
  cacheSuccessfulConnection 
} from "../utils/databaseUtils";

export function useSessionManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [loginAttempted, setLoginAttempted] = useState(false);
  
  // Check for existing session with improved error handling and retry logic
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsInitializing(true);
        
        console.log("Checking for existing auth session...");
        
        // First try to get session from storage
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Found existing session during initialization:", 
            session.user.email ? `User: ${session.user.email}` : "Anonymous session");
            
          setIsAuthenticated(true);
          setSession(session);
          setUser(session?.user || null);
          setLoginAttempted(true);
          
          // Set extended session persistence immediately
          setExtendedSessionPersistence();
          
          // Test database access with the current session
          const { success } = await testDatabaseAccess();
          
          // Clear connection test flag if access test fails
          if (!success) {
            console.log("Database access test failed during session init, clearing connection cache");
            localStorage.removeItem('sb-connection-test');
            toast.warning("Session found but database connection failed. Try reloading the page.");
          } else {
            console.log("Database access test successful during initialization");
            cacheSuccessfulConnection();
          }
        } else {
          console.log("No session found during initialization, will try refresh");
          // If no session found, try to refresh it
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            console.log("Session refreshed successfully during initialization");
            setIsAuthenticated(true);
            setSession(refreshData.session);
            setUser(refreshData.session.user || null);
            setLoginAttempted(true);
            
            // Test database access
            await testDatabaseAccess();
            
            // Set extended session expiry after successful refresh
            setExtendedSessionPersistence();
          } else {
            console.log("No active session after refresh attempt");
            setIsAuthenticated(false);
            setSession(null);
            setUser(null);
            
            // Check if we have a remembered login
            const rememberedLogin = localStorage.getItem('rememberLogin') === 'true';
            if (rememberedLogin) {
              setLoginAttempted(true);
              // Prompt user to re-login if they had a remembered session
              toast.warning("Sessionen har upphört. Logga in på nytt för att återansluta till databasen.");
            }
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
        setSession(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, "Has session:", !!currentSession);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, updating state");
        setIsAuthenticated(false);
        setSession(null);
        setUser(null);
        toast.info("Du har loggat ut");
        
        // Clear connection test cache on logout
        localStorage.removeItem('sb-connection-test');
        localStorage.removeItem('sb-connection-test-time');
        localStorage.removeItem('rememberLogin');
        localStorage.removeItem('sb-connection-error');
        
        // Reload the page after logout to completely reset the state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else if (currentSession) {
        console.log("User signed in or session refreshed");
        setIsAuthenticated(true);
        setSession(currentSession);
        setUser(currentSession.user || null);
        setLoginAttempted(true);
        
        if (event === 'SIGNED_IN') {
          toast.success("Inloggad som " + (currentSession.user.email || "användare"));
        
          const { success } = await testDatabaseAccess();
          
          if (success) {
            if (rememberLogin) {
              // Set a persistent flag to remember this login
              localStorage.setItem('rememberLogin', 'true');
              // Extended session - 30 days
              setExtendedSessionPersistence();
              
              // Force cache the connection state
              cacheSuccessfulConnection();
            }
          } else {
            toast.warning("Inloggad men kan inte ansluta till databasen. Försök att ladda om sidan.");
          }
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [rememberLogin]);
  
  return {
    isAuthenticated,
    isInitializing,
    session,
    user,
    rememberLogin,
    setRememberLogin,
    loginAttempted
  };
}
