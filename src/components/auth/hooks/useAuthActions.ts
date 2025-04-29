
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { checkPendingUpdates, clearAuthAndReconnect } from "../utils/databaseUtils";

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
      console.log("Executing logout process...");
      toast.loading("Loggar ut...");
      
      // Use the enhanced clearAuthAndReconnect function
      const success = await clearAuthAndReconnect();
      
      if (success) {
        // Clear any remembered login
        localStorage.removeItem('rememberLogin');
        
        // Force page reload to ensure all state is reset
        console.log("Logout successful, reloading page...");
        window.location.reload();
        
        return true;
      } else {
        console.error("Logout process did not complete successfully");
        toast.error("Utloggningen misslyckades - vänligen ladda om sidan manuellt");
        return false;
      }
    } catch (error) {
      console.error("Exception during logout process:", error);
      toast.error("Kunde inte logga ut - oväntat fel");
      return false;
    }
  };
  
  // Trigger sync process
  const triggerSync = () => {
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
