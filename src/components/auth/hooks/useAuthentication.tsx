
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useAuthentication() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [email, setEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);
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
        // First set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setIsAuthenticated(!!session);
          setUser(session?.user || null);
          
          if (event === 'SIGNED_OUT') {
            toast.info("Du har loggat ut");
          } else if (event === 'SIGNED_IN') {
            toast.success("Inloggad som " + (session?.user?.email || "användare"));
          }
        });
        
        // Then check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        setUser(session?.user || null);
        setIsInitializing(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error checking session:", error);
        setIsInitializing(false);
      }
    };
    
    checkSession();
  }, []);
  
  const handleLogin = async (e) => {
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
      
      console.log("Sending login link to:", email);
      toast.loading("Skickar inloggningslänk...");
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: true
        }
      });
      
      if (error) {
        toast.error("Kunde inte skicka inloggningslänk: " + error.message);
      } else {
        toast.success("En inloggningslänk har skickats till din e-post");
        if (rememberLogin) {
          localStorage.setItem('rememberLogin', 'true');
        }
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
      console.log("Executing logout process...");
      toast.loading("Loggar ut...");
      
      // Clear any remembered login
      localStorage.removeItem('rememberLogin');
      
      // Clear connection test flags
      localStorage.removeItem('sb-connection-test');
      localStorage.removeItem('sb-connection-test-time');
      
      // Clean up all Supabase-related localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.startsWith('supabase.auth'))) {
          localStorage.removeItem(key);
        }
      }
      
      // Sign out with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        toast.error("Utloggningsfel: " + error.message);
        return false;
      }
      
      toast.success("Utloggning lyckades");
      
      // Force reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    } catch (error) {
      console.error("Exception during logout process:", error);
      toast.error("Kunde inte logga ut - oväntat fel");
      return false;
    }
  };
  
  const triggerSync = () => {
    // Check for pending updates
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    let count = 0;
    
    if (pendingUpdatesJson) {
      try {
        const updates = JSON.parse(pendingUpdatesJson);
        count = Object.keys(updates).length;
      } catch (e) {
        console.error("Error parsing pending updates:", e);
      }
    }
    
    if (count > 0) {
      if (!isOnline) {
        toast.warning(`${count} ändringar sparade lokalt och väntar på synkronisering`);
        toast.info("Ändringar synkas automatiskt när du är online igen");
      } else {
        toast.loading(`Synkroniserar ${count} ändringar till databasen...`);
        // Force reload page to trigger sync
        window.location.reload();
      }
    } else {
      toast.info("Inga ändringar att synkronisera");
    }
  };
  
  return {
    isAuthenticated,
    isAuthenticating,
    isOnline,
    isInitializing,
    user,
    email,
    setEmail,
    showLogin,
    setShowLogin,
    rememberLogin,
    setRememberLogin,
    handleLogin,
    handleLogout,
    triggerSync
  };
}
