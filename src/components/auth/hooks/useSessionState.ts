
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase/client";
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
      
      // Always try to connect anonymously if no session
      if (!hasSession) {
        console.log("No session found, attempting anonymous connection");
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
