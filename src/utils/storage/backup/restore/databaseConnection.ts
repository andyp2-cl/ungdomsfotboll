
import { supabase, isSupabaseConfigured, forceResetConnection } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Verifies database connectivity before restoration
 */
export const checkDatabaseConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  try {
    console.log("Performing pre-restore database connection check...");
    
    // First check if Supabase is properly configured
    const isConfigured = await isSupabaseConfigured();
    if (!isConfigured) {
      console.error("Supabase is not properly configured");
      return { connected: false, error: "Databasen är inte korrekt konfigurerad" };
    }
    
    // Try a simple test query to ensure we can write to the database
    console.log("Testing database write permissions...");
    const testId = `test-${Date.now()}`;
    const { error: writeError } = await supabase
      .from('leagues')
      .insert({ id: testId, name: 'Connection Test', division: 'Test', year: 2025 })
      .select()
      .single();
    
    if (writeError) {
      console.log("Database write test failed with error:", writeError);
      
      // Check if it's a row-level security error, which might be expected
      if (writeError.message && writeError.message.includes('row-level security')) {
        console.log("Row-level security prevented test write, but connection seems valid");
        return { connected: true };
      }
      
      // For other errors, try a read-only query as a fallback
      console.log("Attempting read-only test query...");
      const { error: readError } = await supabase
        .from('players')
        .select('id')
        .limit(1);
      
      if (readError) {
        console.error("Database read test also failed:", readError);
        return { 
          connected: false, 
          error: `Databasåtkomst nekad: ${readError.message || "Okänt fel"}` 
        };
      } else {
        console.log("Read test successful, proceeding with limited permissions");
        return { connected: true };
      }
    }
    
    // If we got here, the write test succeeded
    console.log("Database connection and permissions verified");
    return { connected: true };
  } catch (error) {
    console.error("Error checking database connection:", error);
    return { connected: false, error: error instanceof Error ? error.message : 'Okänt fel' };
  }
};
