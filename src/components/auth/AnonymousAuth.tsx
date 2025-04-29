
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck } from "lucide-react";

export function AnonymousAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      console.log("Auth state changed:", event, !!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleLogin = async () => {
    try {
      setIsAuthenticating(true);
      
      // Create an anonymous session for database access
      const { error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error("Authentication error:", error);
        throw error;
      }
      
      console.log("Anonymous authentication successful");
    } catch (error) {
      console.error("Error during anonymous authentication:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-green-600 flex gap-1.5 items-center"
          disabled
        >
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs">Databasåtkomst aktiv</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="flex gap-1.5 items-center"
          onClick={handleLogin}
          disabled={isAuthenticating}
        >
          <Shield className="h-4 w-4" />
          <span className="text-xs">
            {isAuthenticating ? "Aktiverar åtkomst..." : "Aktivera databasåtkomst"}
          </span>
        </Button>
      )}
    </div>
  );
}
