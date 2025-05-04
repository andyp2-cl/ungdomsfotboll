
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthenticationActions(isOnline: boolean) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const handleLogin = async () => {
    if (!isOnline) {
      toast.error("Ingen internetanslutning. Databasåtkomst kräver uppkoppling.");
      return;
    }
    
    try {
      setIsAuthenticating(true);
      
      // Since anonymous auth is disabled, switch to magic link option
      const email = prompt("Ange din e-postadress för att aktivera databasåtkomst:");
      
      if (!email) {
        setIsAuthenticating(false);
        toast.error("Ingen e-postadress angiven");
        return;
      }
      
      // Send a magic link to the user
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
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

  return {
    isAuthenticating,
    handleLogin
  };
}
