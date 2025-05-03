
import { Activity, Player } from "@/types/player";
import { toast } from "sonner";
import { processActivityBatches } from "./batch-processor";

/**
 * Import activities from live production environment
 */
export const importFromLiveEnv = async (liveUrl: string = 'https://hassleholmsifp2014.lovable.app'): Promise<{
  success: boolean;
  activitiesCount: number;
  playersCount: number;
  activities?: Activity[];
  players?: Player[];
  error?: string;
}> => {
  try {
    toast.loading("Hämtar data från live-miljön...", { id: "live-import" });
    console.log("Initiating import from live environment:", liveUrl);
    
    // Ensure the URL has no trailing slash
    const baseUrl = liveUrl.endsWith('/') ? liveUrl.slice(0, -1) : liveUrl;
    
    // Validate URL format
    try {
      new URL(baseUrl);
    } catch (error) {
      throw new Error(`Ogiltig URL: ${baseUrl}`);
    }
    
    // First, try to fetch activities
    const activitiesEndpoint = `${baseUrl}/api/export/activities`;
    console.log(`Attempting to fetch activities from ${activitiesEndpoint}`);
    
    try {
      const activitiesResponse = await fetch(activitiesEndpoint, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Add cache busting to prevent cached responses
        cache: 'no-cache',
        mode: 'cors',
      });
      
      if (!activitiesResponse.ok) {
        console.error("Activities fetch response not OK:", activitiesResponse.status, activitiesResponse.statusText);
        // Try to get the text of the response for debugging
        const responseText = await activitiesResponse.text();
        console.error("Response body:", responseText.substring(0, 200) + "...");
        throw new Error(`Kunde inte hämta aktiviteter: ${activitiesResponse.statusText} (${activitiesResponse.status})`);
      }
      
      // Check if the response is actually JSON by looking at content-type header
      const contentType = activitiesResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error("Response is not JSON:", contentType);
        // Try to get the text of the response for debugging
        const responseText = await activitiesResponse.text();
        console.error("Non-JSON response body:", responseText.substring(0, 200) + "...");
        throw new Error(`API-svaret är inte i JSON-format. API-endpointen '${activitiesEndpoint}' returnerar inte JSON. (Content-Type: ${contentType || 'unknown'})`);
      }
      
      let activities: Activity[];
      try {
        activities = await activitiesResponse.json();
      } catch (error) {
        console.error("Failed to parse activities JSON:", error);
        // Try to get the text of the response for debugging
        const responseText = await activitiesResponse.text();
        console.error("Failed parsing JSON from:", responseText.substring(0, 200) + "...");
        throw new Error(`Kunde inte tolka aktivitetsdata: API endpoint returnerade inte giltig JSON.`);
      }
      
      console.log(`Fetched ${activities?.length || 0} activities from ${baseUrl}`);
      
      // Then fetch players
      const playersEndpoint = `${baseUrl}/api/export/players`;
      console.log(`Attempting to fetch players from ${playersEndpoint}`);
      
      const playersResponse = await fetch(playersEndpoint, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-cache',
        mode: 'cors',
      });
      
      if (!playersResponse.ok) {
        console.error("Players fetch response not OK:", playersResponse.status, playersResponse.statusText);
        throw new Error(`Kunde inte hämta spelare: ${playersResponse.statusText} (${playersResponse.status})`);
      }
      
      // Check if the response is actually JSON
      const playerContentType = playersResponse.headers.get('content-type');
      if (!playerContentType || !playerContentType.includes('application/json')) {
        console.error("Player response is not JSON:", playerContentType);
        throw new Error(`Spelar-API-svaret är inte i JSON-format. API-endpointen '${playersEndpoint}' returnerar inte JSON. (Content-Type: ${playerContentType || 'unknown'})`);
      }
      
      let players: Player[];
      try {
        players = await playersResponse.json();
      } catch (error) {
        console.error("Failed to parse players JSON:", error);
        throw new Error(`Kunde inte tolka spelardata: API endpoint returnerade inte giltig JSON.`);
      }
      
      console.log(`Hämtade ${activities.length} aktiviteter och ${players.length} spelare från live-miljön`);
      toast.success(`Hämtade ${activities.length} aktiviteter och ${players.length} spelare från live-miljön`, { id: "live-import" });
      
      // Process and save activities in batches
      const activityResult = await processActivityBatches(activities);
      
      // Process players (implement in a similar pattern as activities)
      const playersResult = await importPlayers(players);
      
      return {
        success: activityResult.success && playersResult.success,
        activitiesCount: activityResult.count,
        playersCount: playersResult.count,
        activities: activities, // Return the fetched activities
        players: players,       // Return the fetched players
        error: activityResult.error || playersResult.error
      };
    } catch (error) {
      throw error; // Re-throw to be handled by the outer catch
    }
  } catch (error) {
    console.error("Error importing from live environment:", error);
    toast.error(`Fel vid import: ${error instanceof Error ? error.message : 'Okänt fel'}`, { id: "live-import" });
    
    return {
      success: false,
      activitiesCount: 0,
      playersCount: 0,
      error: error instanceof Error ? error.message : 'Okänt fel'
    };
  }
};

/**
 * Import players from the provided array
 */
async function importPlayers(players: Player[]): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    // Here we would implement player import logic
    // For now, just log what would happen
    console.log(`Would import ${players.length} players`);
    
    // This would need to be implemented with actual supabase calls
    // Similar to how activities are processed in batch-processor.ts
    
    return {
      success: true,
      count: players.length
    };
  } catch (error) {
    console.error("Error importing players:", error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Okänt fel vid import av spelare'
    };
  }
}
