
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthenticationState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuthLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set authentication state
        setIsAuthenticated(!!session);
        setAuthUser(session?.user || null);
        
        if (session) {
          console.log("User is authenticated:", session.user.email);
        } else {
          // If no session, try to refresh it
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            setIsAuthenticated(true);
            setAuthUser(refreshData.session.user || null);
            console.log("Session refreshed:", refreshData.session.user.email);
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast.error("Kunde inte kontrollera inloggningsstatus");
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes with improved persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      setIsAuthenticated(!!session);
      setAuthUser(session?.user || null);
      
      // Show appropriate toast notifications
      if (event === 'SIGNED_IN') {
        toast.success("Inloggad som " + (session?.user?.email || "användare"));
        
        // Store login timestamp to help with session persistence
        localStorage.setItem('auth_timestamp', Date.now().toString());
      } else if (event === 'SIGNED_OUT') {
        toast.info("Du har loggat ut");
        localStorage.removeItem('auth_timestamp');
      } else if (event === 'USER_UPDATED') {
        toast.info("Användarinformation uppdaterad");
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.info("Lösenordsåterställning påbörjad");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
        // Silent refresh, don't show notification
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Handle login with magic link with extended session settings
  const loginWithMagicLink = async (email: string) => {
    try {
      // Get the current URL for redirect
      const currentURL = window.location.href.split('?')[0]; // Remove any query parameters
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: currentURL, // Redirect to current page after login
          shouldCreateUser: true,
          data: {
            login_timestamp: Date.now()
          }
        }
      });
      
      if (error) {
        console.error("Authentication error:", error);
        toast.error("Kunde inte skicka inloggningslänk: " + error.message);
        return false;
      }
      
      toast.success("En inloggningslänk har skickats till din e-post");
      return true;
    } catch (error) {
      console.error("Error during authentication:", error);
      toast.error("Ett fel uppstod vid inloggning");
      return false;
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Kunde inte logga ut");
        return false;
      }
      
      localStorage.removeItem('auth_timestamp');
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Ett fel uppstod vid utloggning");
      return false;
    }
  };

  return { 
    isAuthenticated, 
    isAuthLoading, 
    authUser,
    loginWithMagicLink,
    logout
  };
}
