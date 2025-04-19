
import { Activity, Player } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";
import { normalizePlayerStats } from "../utils/playerStatsUtils";
import { toast } from "sonner";

/**
 * Handles updating an existing activity
 */
export const handleActivityUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  updatedActivity: Activity
): Promise<void> => {
  console.log("handleActivityUpdate called with:", {
    activityId: updatedActivity.id,
    activityName: updatedActivity.name,
    date: updatedActivity.date,
    cupId: updatedActivity.cupId,
    cupName: updatedActivity.cupName,
    participantsCount: updatedActivity.participants?.length || 0
  });
  
  try {
    // Find the existing activity
    const existingActivity = activities.find(activity => activity.id === updatedActivity.id);
    
    if (!existingActivity) {
      console.error("Activity not found:", updatedActivity.id);
      toast({
        title: "Kunde inte uppdatera aktivitet",
        description: "Aktiviteten hittades inte.",
        variant: "destructive"
      });
      return;
    }

    // Normalize player_stats before updating
    const normalizedActivity = {
      ...updatedActivity,
      player_stats: normalizePlayerStats(updatedActivity.player_stats)
    };
    
    // Create updated activities array
    const updatedActivities = activities.map(activity => 
      activity.id === normalizedActivity.id ? normalizedActivity : activity
    );
    
    // Update state first to prevent UI freezes
    setActivities(updatedActivities);
    
    // Save to database - CRITICAL FIX: Make sure we pass a copy of the activity
    try {
      console.log("Saving activity to database:", normalizedActivity.id, "with date:", normalizedActivity.date);
      
      // Create a clean copy that won't be mutated by other code
      const activityToSave = JSON.parse(JSON.stringify(normalizedActivity));
      
      await saveActivities([activityToSave]);
      console.log("Activity saved successfully to database");
      
      if (process.env.NODE_ENV === 'development') {
        toast.success(`Aktivitet sparad till databasen: ${normalizedActivity.id}`);
      }
    } catch (saveError) {
      console.error("Error saving activity to database:", saveError);
      toast({
        title: "Databasfel",
        description: "Det gick inte att spara aktiviteten till databasen. Försök igen.",
        variant: "destructive"
      });
      // Revert the state update since the database save failed
      setActivities(activities);
      throw saveError;
    }
    
    // Update player-activity relationships if needed
    if (normalizedActivity.participants) {
      const updatedPlayers = players.map(player => {
        const isParticipating = normalizedActivity.participants?.includes(player.id);
        let playerActivities = player.activities || [];
        
        if (isParticipating && !playerActivities.includes(normalizedActivity.id)) {
          return {
            ...player,
            activities: [...playerActivities, normalizedActivity.id]
          };
        } else if (!isParticipating && playerActivities.includes(normalizedActivity.id)) {
          return {
            ...player,
            activities: playerActivities.filter(id => id !== normalizedActivity.id)
          };
        }
        
        return player;
      });
      
      setPlayers(updatedPlayers);
      
      // Fixa: Skapa en kopia av spelarlistan för att undvika mutationer
      const playersToSave = JSON.parse(JSON.stringify(updatedPlayers));
      await savePlayers(playersToSave);
    }
    
    toast({
      title: "Aktivitet uppdaterad",
      description: `${normalizedActivity.name} har uppdaterats.`,
    });
  } catch (error) {
    console.error("Error saving activity updates:", error);
    
    toast({
      title: "Ett fel uppstod",
      description: "Kunde inte spara ändringarna. Försök igen.",
      variant: "destructive"
    });
    
    throw error; // Re-throw to allow caller to handle
  }
};
