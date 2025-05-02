
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Try to connect anonymously to the database
 */
export const connectAnonymously = async (): Promise<boolean> => {
  try {
    console.log("Attempting to connect anonymously");
    
    // Check if we have an existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("Already have an existing session");
      return true;
    }
    
    // No session, try to sign in anonymously
    try {
      // Note: Anonymous sign-in is disabled in this app based on server error
      // Instead, we'll display an info message
      console.log("Anonymous sign-in is disabled, showing info message");
      
      // Show info toast after a delay
      setTimeout(() => {
        toast.info("Databasåtkomst kräver inloggning. Använd knappen i menyn för att logga in.");
      }, 2000);
      
      return false;
    } catch (error: any) {
      console.error("Error connecting anonymously:", error);
      
      // If anonymous auth is disabled, let's try again with a delay
      if (error?.code === "anonymous_provider_disabled") {
        console.warn("Anonymous sign-in is disabled");
        return false;
      }
      
      // If we get here, we failed for some other reason
      throw error;
    }
  } catch (error) {
    console.error("Failed to connect anonymously even after retry:", error);
    return false;
  }
};

/**
 * Check for pending updates in localStorage
 * @returns Number of pending updates
 */
export const checkPendingUpdates = (): number => {
  try {
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (!pendingUpdatesJson) {
      return 0;
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    return Object.keys(pendingUpdates).length;
  } catch (error) {
    console.error("Error checking pending updates:", error);
    return 0;
  }
};

/**
 * Safe check for session
 */
export const getSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

/**
 * Check if the current user has database access
 */
export const hasDatabaseAccess = async (): Promise<boolean> => {
  try {
    const session = await getSession();
    return !!session;
  } catch (error) {
    console.error("Error checking database access:", error);
    return false;
  }
};
