
import { Activity, Location } from "@/types/player";
import { ActivityFormValues } from "@/components/activity-form/formSchema";
import { format } from "date-fns";
import { normalizePlayerStats } from "@/utils/player-stats";
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
    if (values.location?.name) {
      location = {
        name: values.location.name,
        description: values.location.description || undefined,
        gpsLink: values.location.gpsLink || undefined,
      };
    }

    // Format date to ISO string
    const formattedDate = format(values.date, 'yyyy-MM-dd');
    
    // Make sure score values are converted to numbers or remain undefined
    const homeScore = values.homeScore === undefined || values.homeScore === "" ? 
      undefined : 
      (typeof values.homeScore === 'string' ? parseInt(values.homeScore, 10) : values.homeScore);
      
    const awayScore = values.awayScore === undefined || values.awayScore === "" ? 
      undefined : 
      (typeof values.awayScore === 'string' ? parseInt(values.awayScore, 10) : values.awayScore);
      
    // Create result string ONLY if both scores exist
    const result = (homeScore !== undefined && awayScore !== undefined)
      ? `${homeScore}-${awayScore}`
      : undefined;
    
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
    };
    
    // Only add scores information if scores are provided
    if (homeScore !== undefined || awayScore !== undefined) {
      updatedPlayerStats.scores = {
        home: homeScore,
        away: awayScore
      };
      updatedPlayerStats.isWin = isWin;
    }
    
    // Handle leagueId (convert "none" to undefined)
    const leagueId = values.leagueId && values.leagueId !== "none" ? values.leagueId : undefined;
    
    console.log("Form submission - leagueId:", {
      formLeagueId: values.leagueId,
      finalLeagueId: leagueId
    });
    
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
      leagueId,
      cupName: values.cupName && values.cupName !== "no-cup" ? values.cupName : undefined,
      player_stats: updatedPlayerStats
    };

    // Use preserveMatchData to ensure match statistics are maintained
    const updatedActivity = preserveMatchData(originalActivity, formUpdatedActivity);
    
    console.log("Saving activity with preserved match data and updated values:", {
      isWin: updatedActivity.isWin,
      leagueId: updatedActivity.leagueId,
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
