
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { shouldAutoConnectDatabase, isDevelopmentEnvironment } from '@/utils/environment';
import { connectAnonymously } from '../utils/databaseUtils';

export function useSessionState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check for existing session and set up auth state listener
  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Has session:", !!session);
      setIsAuthenticated(!!session);
    });
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hasSession = !!session;
      setIsAuthenticated(hasSession);
      
      // If no session and auto-connect is enabled, try to connect
      if (!hasSession && shouldAutoConnectDatabase() && isDevelopmentEnvironment()) {
        console.log("No session found but auto-connect is enabled, attempting anonymous connection");
        connectAnonymously().catch(err => {
          console.error("Auto-connect failed:", err);
        });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return { isAuthenticated };
}
