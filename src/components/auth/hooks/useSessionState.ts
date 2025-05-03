
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase/client";
import { shouldAutoConnectDatabase, isDevelopmentEnvironment, isPublishedEnvironment, setAutoConnectDatabase } from '@/utils/environment';
import { connectAnonymously } from '../utils/databaseUtils';
import { toast } from "sonner";

export function useSessionState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
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
      
      // Try to connect anonymously if not already connected
      tryConnectToDatabase();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Try to connect to database with multiple fallbacks
  const tryConnectToDatabase = async () => {
    try {
      setIsConnecting(true);
      
      // Add a specific flag for when password authentication was successful
      const isPasswordAuth = localStorage.getItem('hifp2014-auth') === 'true';
      
      // Check if we're in a published environment
      const isProdSite = isPublishedEnvironment();
      
      console.log(`Connection attempt: isPasswordAuth=${isPasswordAuth}, isProdSite=${isProdSite}`);
      
      // Always try to connect if password auth is active or if we're on the production site
      if (isPasswordAuth || isProdSite) {
        try {
          console.log("Attempting database connection...");
          const result = await connectAnonymously();
          
          if (result) {
            console.log("Database connection successful");
            
            // On success in production, make sure auto-connect is enabled
            if (isProdSite && !isPasswordAuth) {
              setAutoConnectDatabase(true);
              localStorage.setItem('hifp2014-auth', 'true');
            }
            
            return;
          } else {
            console.warn("Anonymous connection returned false");
          }
        } catch (err) {
          console.error("Initial database connection failed:", err);
          
          // If we're in production, try one more time with a delay
          if (isProdSite) {
            toast.warning("Upplever svårigheter att ansluta. Försöker igen om 2 sekunder...");
            
            setTimeout(async () => {
              try {
                const retryResult = await connectAnonymously();
                console.log("Retry connection result:", retryResult);
              } catch (retryErr) {
                console.error("Retry connection failed:", retryErr);
              }
            }, 2000);
          }
        }
      } else if (shouldAutoConnectDatabase()) {
        // If not force connect but auto-connect is enabled, try to connect
        try {
          await connectAnonymously();
        } catch (err) {
          console.error("Auto-connect failed:", err);
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };
  
  return { isAuthenticated, isConnecting };
}
