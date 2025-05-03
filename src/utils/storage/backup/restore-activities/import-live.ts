
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
    
    // Try direct API access for Lovable apps with native API
    const activitiesEndpoint = `${baseUrl}/api/export/activities`;
    console.log(`Attempting to fetch activities from ${activitiesEndpoint}`);
    
    try {
      // First, check if the site is accessible at all by trying to fetch the base URL
      const baseResponse = await fetch(baseUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'cors',
      }).catch(error => {
        console.error("Error accessing the base URL:", error);
        throw new Error(`Kunde inte nå ${baseUrl}. Kontrollera att webbplatsen är tillgänglig och att URL:en är korrekt.`);
      });
      
      if (!baseResponse.ok) {
        console.error("Base URL not accessible:", baseResponse.status, baseResponse.statusText);
        throw new Error(`Kunde inte nå ${baseUrl}: ${baseResponse.statusText} (${baseResponse.status}). 
        
Tips: Kontrollera att webbplatsen är tillgänglig och att URL:en är korrekt.`);
      }
      
      // Now try to fetch the activities
      const activitiesResponse = await fetch(activitiesEndpoint, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-cache',
        mode: 'cors',
      });
      
      if (!activitiesResponse.ok) {
        console.error("Activities fetch response not OK:", activitiesResponse.status, activitiesResponse.statusText);
        
        // Try to get the text of the response for debugging
        const responseText = await activitiesResponse.text();
        console.error("Response body:", responseText.substring(0, 200) + "...");
        
        // Check if this is an HTML response (typical for error pages)
        const contentType = activitiesResponse.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.log("Got HTML response, this is likely a 404 page or similar");
          throw new Error(`API-slutpunkten (${activitiesEndpoint}) returnerar HTML istället för JSON, vilket tyder på att den inte existerar.
          
Detta kan bero på att:
1. Applikationen använder en annan API-struktur än förväntad
2. Datan är inte tillgänglig via API:et
3. URL-formatet är felaktigt

Alternativ:
- Om det är din egen applikation, försök exportera data direkt från Supabase Admin-panelen
- Använd säkerhetskopiering/backup i live-miljön först, och återställ sedan från den filen`);
        }
        
        throw new Error(`Kunde inte hämta aktiviteter: ${activitiesResponse.statusText} (${activitiesResponse.status})`);
      }
      
      // Check if the response is actually JSON by looking at content-type header
      const contentType = activitiesResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error("Response is not JSON:", contentType);
        throw new Error(`API-svaret är inte i JSON-format (Content-Type: ${contentType || 'unknown'}).
        
Detta kan bero på att:
1. API:et är skyddat och kräver autentisering
2. Applikationen använder en annan struktur än förväntad
        
Alternativ: Använd direktexport från Supabase Admin-panelen i live-miljön för att exportera data.`);
      }
      
      let activities: Activity[];
      try {
        const text = await activitiesResponse.text();
        console.log("Response text preview:", text.substring(0, 100) + "...");
        
        if (!text || text.trim() === "") {
          throw new Error("API-svaret är tomt");
        }
        
        try {
          activities = JSON.parse(text);
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          // First 100 characters of text for debugging
          console.error("Failed JSON content:", text.substring(0, 100));
          throw new Error(`Kunde inte tolka aktivitetsdata. API endpoint returnerar ogiltig JSON.`);
        }
      } catch (error) {
        console.error("Failed to parse activities JSON:", error);
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
        throw new Error(`Spelar-API-svaret är inte i JSON-format (Content-Type: ${playerContentType || 'unknown'}).`);
      }
      
      let players: Player[];
      try {
        const text = await playersResponse.text();
        
        if (!text || text.trim() === "") {
          throw new Error("Spelar-API-svaret är tomt");
        }
        
        try {
          players = JSON.parse(text);
        } catch (parseError) {
          console.error("Failed to parse player JSON:", parseError);
          throw new Error(`Kunde inte tolka spelardata: API endpoint returnerar ogiltig JSON.`);
        }
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
        activities: activities,
        players: players,
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
