
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return { isAuthenticated };
}
