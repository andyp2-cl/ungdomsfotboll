
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, CloudOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function AnonymousAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
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
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        // Try to authenticate automatically if no session exists
        await handleLogin(true);
      }
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
  
  const handleLogin = async (silent: boolean = false) => {
    if (!isOnline) {
      if (!silent) toast.error("Ingen internetanslutning. Databasåtkomst kräver uppkoppling.");
      return;
    }
    
    try {
      if (!silent) setIsAuthenticating(true);
      
      // Create an anonymous session for database access
      const { error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error("Authentication error:", error);
        if (!silent) toast.error("Kunde inte aktivera databasåtkomst: " + error.message);
      } else {
        console.log("Anonymous authentication successful");
        if (!silent) toast.success("Databasåtkomst aktiverad");
      }
    } catch (error) {
      console.error("Error during anonymous authentication:", error);
      if (!silent) toast.error("Ett fel uppstod vid aktivering av databasåtkomst");
    } finally {
      if (!silent) setIsAuthenticating(false);
    }
  };
  
  // If we're offline, show a different button
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-amber-600 flex gap-1.5 items-center"
        >
          <CloudOff className="h-4 w-4" />
          <span className="text-xs">Offline</span>
        </Button>
      </div>
    );
  }
  
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
      toast.loading(`Synkroniserar ${count} ändringar till databasen...`);
      
      // Force reload page to trigger sync
      window.location.reload();
    } else {
      toast.info("Inga ändringar att synkronisera");
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-green-600 flex gap-1.5 items-center"
            disabled
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs">Databasåtkomst aktiv</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex gap-1.5 items-center"
            onClick={handleSyncPendingUpdates}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs">Synka ändringar</span>
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="flex gap-1.5 items-center"
          onClick={() => handleLogin()}
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
