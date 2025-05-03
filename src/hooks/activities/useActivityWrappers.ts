
import { Activity } from "@/types/player";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook that provides wrapper functions for activity-related operations
 * to ensure consistent return types and error handling
 */
export function useActivityWrappers(
  handleActivityUpdate: (activity: Activity) => Promise<boolean>,
  handleDeleteActivity: (activityId: string) => Promise<boolean>,
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>,
  handleImportActivities: (activities: Activity[]) => Promise<boolean>,
  handleClearHistorical: () => Promise<boolean>,
  handleMatchResult: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>
) {
  const { toast } = useToast();

  // Wrapper for activity update to ensure Promise<void> return type
  const handleActivityUpdateWrapper = async (activity: Activity): Promise<void> => {
    try {
      await handleActivityUpdate(activity);
    } catch (error) {
      console.error("Error updating activity:", error);
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte uppdatera aktivitet. Försök igen.",
        variant: "destructive"
      });
    }
  };

  // Wrapper for kiosk assignment to ensure consistent return type
  const handleKioskUpdateWrapper = async (activityId: string, playerId?: string): Promise<boolean> => {
    try {
      return await handleKioskUpdate(activityId, playerId);
    } catch (error) {
      console.error("Error updating kiosk assignment:", error);
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte uppdatera kioskansvarig. Försök igen.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Wrapper for activity deletion
  const handleDeleteActivityWrapper = async (activityId: string): Promise<boolean> => {
    try {
      return await handleDeleteActivity(activityId);
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Fel vid borttagning",
        description: "Kunde inte ta bort aktivitet. Försök igen.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Wrapper for importing activities
  const handleImportActivitiesWrapper = async (activities: Activity[]): Promise<boolean> => {
    try {
      return await handleImportActivities(activities);
    } catch (error) {
      console.error("Error importing activities:", error);
      toast({
        title: "Fel vid import",
        description: "Kunde inte importera aktiviteter. Försök igen.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Wrapper for clearing historical activities
  const handleClearHistoricalWrapper = async (): Promise<boolean> => {
    try {
      return await handleClearHistorical();
    } catch (error) {
      console.error("Error clearing historical activities:", error);
      toast({
        title: "Fel vid rensning",
        description: "Kunde inte rensa historiska aktiviteter. Försök igen.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Wrapper for match result update - ensuring void return type
  const handleMatchResultWrapper = async (activityId: string, homeScore?: number, awayScore?: number): Promise<void> => {
    try {
      console.log(`ActivityWrappers: Calling handleMatchResult with scores=${homeScore}-${awayScore}`);
      await handleMatchResult(activityId, homeScore, awayScore);
    } catch (error) {
      console.error("Error updating match result:", error);
      toast({
        title: "Fel vid uppdatering av resultat",
        description: "Kunde inte uppdatera matchresultat. Försök igen.",
        variant: "destructive"
      });
    }
  };

  return {
    handleActivityUpdateWrapper,
    handleKioskUpdateWrapper,
    handleDeleteActivityWrapper,
    handleImportActivitiesWrapper,
    handleClearHistoricalWrapper,
    handleMatchResultWrapper
  };
}
