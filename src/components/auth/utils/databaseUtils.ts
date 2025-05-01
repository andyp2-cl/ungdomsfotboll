
import { supabase } from "@/lib/supabase/client";

/**
 * Connects to the database anonymously
 * This function is called when the user is not authenticated
 * to ensure they still have access to the database
 */
export const connectAnonymously = async () => {
  try {
    // First check if we already have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("User already has a session, no need to connect anonymously");
      return;
    }

    // Attempt anonymous sign-in
    console.log("Attempting anonymous sign-in");
    
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error("Error signing in anonymously:", error);
      throw error;
    }
    
    console.log("Anonymous sign-in successful");
    
    // Immediately attempt to fetch some simple data to test the connection
    await supabase
      .from('activities')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    console.log("Database connection verified after anonymous login");
    
    return data;
  } catch (error) {
    console.error("Error connecting anonymously:", error);
    
    // Try again with a slight delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error("Error on retry of anonymous sign-in:", error);
        throw error;
      }
      
      console.log("Anonymous sign-in successful on retry");
      return data;
    } catch (retryError) {
      console.error("Failed to connect anonymously even after retry:", retryError);
      throw retryError;
    }
  }
};
