
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Session, User } from '@supabase/supabase-js';
import { testDatabaseAccess, setExtendedSessionPersistence, cacheSuccessfulConnection } from "../utils/databaseUtils";

export function useSessionManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [rememberLogin, setRememberLogin] = useState(true);
  
  // Check for existing session with improved error handling and retry logic
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsInitializing(true);
        
        // First try to get session from storage
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Found existing session during initialization");
          setIsAuthenticated(true);
          setSession(session);
          setUser(session?.user || null);
          
          // Set extended session persistence immediately
          setExtendedSessionPersistence();
          
          // Test database access with the current session
          const { success } = await testDatabaseAccess();
          
          // Clear connection test flag if access test fails
          if (!success) {
            console.log("Database access test failed during session init, clearing connection cache");
            localStorage.removeItem('sb-connection-test');
          }
        } else {
          console.log("No session found during initialization, trying refresh");
          // If no session found, try to refresh it with retry logic
          let refreshAttempts = 0;
          let refreshSuccess = false;
          
          while (refreshAttempts < 2 && !refreshSuccess) {
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              
              if (!refreshError && refreshData.session) {
                console.log("Session refreshed successfully (attempt", refreshAttempts + 1, ")");
                setIsAuthenticated(true);
                setSession(refreshData.session);
                setUser(refreshData.session.user || null);
                refreshSuccess = true;
                await testDatabaseAccess();
                
                // Set extended session expiry after successful refresh
                setExtendedSessionPersistence();
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
            console.log("All session refresh attempts failed");
            setIsAuthenticated(false);
            setSession(null);
            setUser(null);
            
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
        setIsAuthenticated(false);
        setSession(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Has session:", !!session);
      
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
      } else if (session) {
        console.log("User signed in or session refreshed");
        setIsAuthenticated(true);
        setSession(session);
        setUser(session.user || null);
        
        if (event === 'SIGNED_IN') {
          toast.success("Inloggad som " + (session.user.email || "användare"));
        
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
    setRememberLogin
  };
}
