
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
    
    // First, try to fetch activities
    const activitiesResponse = await fetch(`${baseUrl}/api/export/activities`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!activitiesResponse.ok) {
      throw new Error(`Kunde inte hämta aktiviteter: ${activitiesResponse.statusText}`);
    }
    
    let activities: Activity[];
    try {
      activities = await activitiesResponse.json();
    } catch (error) {
      console.error("Failed to parse activities JSON:", error);
      throw new Error(`Kunde inte tolka aktivitetsdata: API endpoint returnerade inte giltig JSON. Kontrollera att API:et är tillgängligt och korrekt konfigurerat.`);
    }
    
    console.log(`Fetched ${activities?.length || 0} activities from ${baseUrl}`);
    
    // Then fetch players
    const playersResponse = await fetch(`${baseUrl}/api/export/players`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!playersResponse.ok) {
      throw new Error(`Kunde inte hämta spelare: ${playersResponse.statusText}`);
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
