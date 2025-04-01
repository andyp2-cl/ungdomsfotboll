
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Location } from "@/types/player";
import { format } from "date-fns";
import { ActivityFormValues, activityFormSchema } from "./formSchema";
import { useState } from "react";
import { preserveMatchData } from "@/hooks/activities/utils/arrayUtils";

// Hjälpfunktion för att säkerställa att player_stats alltid är ett objekt
function normalizePlayerStats(playerStats: any) {
  if (!playerStats) {
    return { goals: {}, assists: {} };
  }
  
  if (typeof playerStats === 'string') {
    try {
      const parsed = JSON.parse(playerStats);
      // Hantera dubbelt stringifierad JSON
      if (typeof parsed === 'string') {
        try {
          const doubleParsed = JSON.parse(parsed);
          return {
            ...doubleParsed,
            goals: doubleParsed.goals || {},
            assists: doubleParsed.assists || {}
          };
        } catch (e) {
          console.error("Error parsing double-stringified player_stats:", e);
          return { goals: {}, assists: {} };
        }
      }
      return {
        ...parsed,
        goals: parsed.goals || {},
        assists: parsed.assists || {}
      };
    } catch (e) {
      console.error("Error parsing player_stats string:", e);
      return { goals: {}, assists: {} };
    }
  }
  
  // Om det redan är ett objekt, säkerställ att det har nödvändiga egenskaper
  return {
    ...playerStats,
    goals: playerStats.goals || {},
    assists: playerStats.assists || {}
  };
}

export function useActivityForm(
  activity: Activity,
  onSave: (updatedActivity: Activity) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalisera activity.player_stats före användning
  const normalizedActivity = {
    ...activity,
    player_stats: normalizePlayerStats(activity.player_stats)
  };

  // Parse the ISO date string to a Date object
  const getInitialDate = () => {
    try {
      return new Date(normalizedActivity.date);
    } catch (e) {
      return new Date();
    }
  };

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: normalizedActivity.name,
      type: normalizedActivity.type,
      date: getInitialDate(),
      time: normalizedActivity.time || "",
      locationName: normalizedActivity.location?.name || "",
      locationDescription: normalizedActivity.location?.description || "",
      locationGps: normalizedActivity.location?.gpsLink || "",
      result: normalizedActivity.result || "",
      homeScore: normalizedActivity.homeScore,
      awayScore: normalizedActivity.awayScore,
      isWin: normalizedActivity.isWin,
    },
  });

  const handleSubmit = async (values: ActivityFormValues) => {
    setIsSubmitting(true);
    
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
      
      // Determine if the match was a win for Hässleholms IF
      let isWin: boolean | undefined = values.isWin;
      
      // Auto-calculate isWin if we have scores and it's not explicitly set
      if (homeScore !== undefined && awayScore !== undefined && isWin === undefined) {
        const isHomeTeam = values.name.toLowerCase().includes('hässleholms if') && 
                         !values.name.toLowerCase().includes(' vs ') || 
                         values.name.toLowerCase().split(' vs ')[0].includes('hässleholms if');
        
        if (isHomeTeam) {
          if (homeScore > awayScore) {
            isWin = true;
          } else if (homeScore < awayScore) {
            isWin = false;
          }
          // If scores are equal, isWin remains undefined (draw)
        } else {
          if (awayScore > homeScore) {
            isWin = true;
          } else if (awayScore < homeScore) {
            isWin = false;
          }
          // If scores are equal, isWin remains undefined (draw)
        }
      }
      
      // Safely parse existing player_stats från den normaliserade aktiviteten
      const existingPlayerStats = normalizedActivity.player_stats;
      
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
        ...normalizedActivity,
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

      console.log("Before preserveMatchData:", {
        originalActivity: {
          playerStats: normalizedActivity.player_stats,
          playerStatsType: typeof normalizedActivity.player_stats
        },
        formUpdatedActivity: {
          playerStats: formUpdatedActivity.player_stats,
          playerStatsType: typeof formUpdatedActivity.player_stats
        }
      });

      // Use preserveMatchData to ensure match statistics are maintained
      const updatedActivity = preserveMatchData(normalizedActivity, formUpdatedActivity);
      
      console.log("Saving activity with preserved match data:", {
        before: {
          playerStats: normalizedActivity.player_stats,
          playerStatsType: typeof normalizedActivity.player_stats
        },
        after: {
          playerStats: updatedActivity.player_stats,
          playerStatsType: typeof updatedActivity.player_stats
        }
      });
      
      await onSave(updatedActivity);
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    handleSubmit,
    isSubmitting,
  };
}
