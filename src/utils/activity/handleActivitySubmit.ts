
import { Activity, Location } from "@/types/player";
import { ActivityFormValues } from "@/components/activity-form/formSchema";
import { format } from "date-fns";
import { normalizePlayerStats } from "@/hooks/activities/utils/playerStatsUtils";
import { preserveMatchData } from "@/hooks/activities/utils/arrayUtils";
import { isHomeMatch, calculateWinStatus } from "@/components/activity-detail/match-result/utils";

export async function handleActivitySubmit(
  values: ActivityFormValues,
  originalActivity: Activity,
  onSave: (updatedActivity: Activity) => void,
  setIsSubmitting: (isSubmitting: boolean) => void
) {
  try {
    // Construct location object if name is provided
    let location: Location | undefined;
    if (values.locationName) {
      location = {
        name: values.locationName,
        description: values.locationDescription || undefined,
        gpsLink: values.locationGps || undefined,
      };
    }

    // Format date to ISO string
    const formattedDate = format(values.date, 'yyyy-MM-dd');
    
    // Make sure score values are converted to numbers
    const homeScore = typeof values.homeScore === 'string' 
      ? parseInt(values.homeScore, 10) 
      : values.homeScore;
      
    const awayScore = typeof values.awayScore === 'string' 
      ? parseInt(values.awayScore, 10) 
      : values.awayScore;
      
    // Create result string if both scores exist
    const result = (homeScore !== undefined && awayScore !== undefined)
      ? `${homeScore}-${awayScore}`
      : values.result || undefined;
    
    // Get the win status from the form
    let isWin = values.isWin;
    
    // Auto-calculate isWin if we have scores and it's not explicitly set
    if (homeScore !== undefined && awayScore !== undefined && isWin === undefined) {
      const isHomeTeam = isHomeMatch(originalActivity);
      isWin = calculateWinStatus(homeScore, awayScore, isHomeTeam);
    }
    
    console.log("Form submission - win status:", {
      explicitIsWin: values.isWin,
      calculatedIsWin: isWin,
      homeScore,
      awayScore
    });
    
    // Make sure originalActivity.player_stats is normalized
    const existingPlayerStats = normalizePlayerStats(originalActivity.player_stats);
    
    // Create updated player_stats - ensure it's an object with all necessary fields
    const updatedPlayerStats = {
      ...existingPlayerStats,
      // Make sure to preserve existing goals and assists
      goals: existingPlayerStats.goals || {},
      assists: existingPlayerStats.assists || {},
      // Add scores information
      scores: {
        home: homeScore,
        away: awayScore
      },
      isWin
    };
    
    // Create updated activity with form values
    const formUpdatedActivity: Activity = {
      ...originalActivity,
      name: values.name,
      date: formattedDate,
      type: values.type,
      time: values.time || undefined,
      location,
      result,
      homeScore,
      awayScore,
      isWin,
      player_stats: updatedPlayerStats
    };

    // Use preserveMatchData to ensure match statistics are maintained
    const updatedActivity = preserveMatchData(originalActivity, formUpdatedActivity);
    
    console.log("Saving activity with preserved match data and win status:", {
      isWin: updatedActivity.isWin,
      playerStats: updatedActivity.player_stats
    });
    
    await onSave(updatedActivity);
  } catch (error) {
    console.error("Error saving activity:", error);
    throw error;
  } finally {
    setIsSubmitting(false);
  }
}
