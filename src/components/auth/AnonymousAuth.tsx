
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, CloudOff, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function AnonymousAuth() {
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
  
  // Check for existing session and test RLS
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // Test if we can write to the database with the current session
        if (session) {
          await testDatabaseWrite(session.access_token);
        } else {
          // Try to authenticate automatically if no session exists
          await handleLogin(true);
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
        await testDatabaseWrite(session.access_token);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Test if we can write to the database
  const testDatabaseWrite = async (token: string) => {
    try {
      // Try a direct API call to test RLS permissions
      const response = await fetch('https://zkrruihxszziifyogzko.supabase.co/rest/v1/activities?id=eq.test_rls', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name: 'RLS Test ' + new Date().toISOString()
        })
      });
      
      setIsRLSEnabled(response.status !== 403);
      console.log("RLS test result:", response.status, response.statusText);
      
      if (response.status === 403) {
        toast.warning("RLS-problem: Databasåtgärder kan vara begränsade");
      } else {
        console.log("RLS test passed or record not found");
      }
    } catch (error) {
      console.error("Error testing RLS:", error);
    }
  };
  
  const handleLogin = async (silent: boolean = false) => {
    if (!isOnline) {
      if (!silent) toast.error("Ingen internetanslutning. Databasåtkomst kräver uppkoppling.");
      return;
    }
    
    try {
      if (!silent) setIsAuthenticating(true);
      
      // Create an anonymous session for database access
      const { error, data } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error("Authentication error:", error);
        if (!silent) toast.error("Kunde inte aktivera databasåtkomst: " + error.message);
      } else {
        console.log("Anonymous authentication successful", data);
        if (!silent) toast.success("Databasåtkomst aktiverad");
        
        // Test RLS after successful login
        if (data.session) {
          await testDatabaseWrite(data.session.access_token);
        }
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
            className={`flex gap-1.5 items-center ${isRLSEnabled ? "text-green-600" : "text-amber-600"}`}
            disabled
          >
            {isRLSEnabled ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span className="text-xs">
              {isRLSEnabled ? "DB-åtkomst aktiv" : "Begränsad DB-åtkomst"}
            </span>
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
