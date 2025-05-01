
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { checkPendingUpdates } from "../utils/databaseUtils";

export function useAuthActions(isOnline: boolean) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [email, setEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  
  const handleLogin = async (e?: React.FormEvent, rememberLogin: boolean = true) => {
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
      
      // Send a magic link to the user with extended session options
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: true
        }
      });
      
      if (error) {
        console.error("Authentication error:", error);
        toast.error("Kunde inte skicka inloggningslänk: " + error.message);
      } else {
        toast.success("En inloggningslänk har skickats till din e-post");
        // Remember login preference
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
      
      // Clear any remembered login first
      localStorage.removeItem('rememberLogin');
      
      // Clear all connection test flags
      localStorage.removeItem('sb-connection-test');
      localStorage.removeItem('sb-connection-test-time');
      localStorage.removeItem('sb-connection-error');
      
      // Clean up all Supabase-related localStorage items before signing out
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.startsWith('supabase.auth'))) {
          keysToRemove.push(key);
        }
      }
      
      console.log(`Clearing ${keysToRemove.length} Supabase-related localStorage items`);
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Now sign out with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Error during sign out:", error);
        toast.error("Utloggningsfel: " + error.message);
        return false;
      }
      
      // Force page reload to ensure all state is reset
      console.log("Logout successful, reloading page...");
      toast.success("Utloggning lyckades");
      
      // Force reload after a short delay to ensure toast is visible
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      return true;
    } catch (error) {
      console.error("Exception during logout process:", error);
      toast.error("Kunde inte logga ut - oväntat fel");
      return false;
    }
  };
  
  // Trigger sync process
  const triggerSync = () => {
    // Fix the Promise<boolean> vs number comparison error
    const count = checkPendingUpdates();
    
    if (count > 0) {
      // In offline mode, we can still show this information
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
    isAuthenticating,
    email,
    setEmail,
    showLogin,
    setShowLogin,
    handleLogin,
    handleLogout,
    triggerSync
  };
}
