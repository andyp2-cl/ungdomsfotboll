import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, CloudOff, RefreshCw, CheckCircle2, XCircle, AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Session, User } from '@supabase/supabase-js';

export function LoginStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
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
  
  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First try to get session from storage
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        setSession(session);
        setUser(session?.user || null);
        
        if (session) {
          await testDatabaseAccess();
          
          // Update session expiry to keep user logged in longer
          localStorage.setItem('supabase.auth.token.expiry', 
            (Date.now() + (30 * 24 * 60 * 60 * 1000)).toString());
        } else {
          // If no session, try to refresh it
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            setIsAuthenticated(true);
            setSession(refreshData.session);
            setUser(refreshData.session.user || null);
            await testDatabaseAccess();
            console.log("Session refreshed successfully");
          } else {
            console.log("No valid session found and refresh failed:", refreshError?.message);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
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
          // Extended session
          localStorage.setItem('supabase.auth.token.expiry', 
            (Date.now() + (30 * 24 * 60 * 60 * 1000)).toString());
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
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [rememberLogin]);

  // Test if we can access the database
  const testDatabaseAccess = async () => {
    try {
      // Try a simple read operation
      const { data, error } = await supabase
        .from('leagues')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error("Database access test failed:", error);
        toast.warning("Begränsad databastillgång. Logga in för full funktionalitet.");
        return false;
      }
      
      console.log("Database access test passed:", data);
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

  // If we're offline, show offline mode button
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-amber-600 flex gap-1.5 items-center"
          onClick={triggerSync}
        >
          <CloudOff className="h-4 w-4" />
          <span className="text-xs">Offline</span>
        </Button>
      </div>
    );
  }
  
  if (showLogin) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Logga in</CardTitle>
          <CardDescription>Logga in för att synkronisera ändringar till databasen</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">E-post</label>
              <Input
                id="email"
                placeholder="din.epost@exempel.se"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberLogin"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="rememberLogin" className="text-sm text-muted-foreground">
                Håll mig inloggad (30 dagar)
              </label>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setShowLogin(false)}>
            Avbryt
          </Button>
          <Button 
            onClick={handleLogin}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? "Skickar..." : "Skicka länk"}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-green-600 flex gap-1.5 items-center"
            disabled
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">
              {user?.email ? `Inloggad (${user.email.split('@')[0]})` : 'Inloggad'}
            </span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex gap-1.5 items-center"
            onClick={triggerSync}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs">Synka ändringar</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-1.5 items-center"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs">Logga ut</span>
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="flex gap-1.5 items-center"
          onClick={() => setShowLogin(true)}
        >
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">
            Logga in för databasåtkomst
          </span>
        </Button>
      )}
    </div>
  );
}
