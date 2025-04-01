
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Location } from "@/types/player";
import { format } from "date-fns";
import { ActivityFormValues, activityFormSchema } from "./formSchema";
import { useState } from "react";
import { preserveMatchData } from "@/hooks/activities/utils/arrayUtils";

export function useActivityForm(
  activity: Activity,
  onSave: (updatedActivity: Activity) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse the ISO date string to a Date object
  const getInitialDate = () => {
    try {
      return new Date(activity.date);
    } catch (e) {
      return new Date();
    }
  };

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: activity.name,
      type: activity.type,
      date: getInitialDate(),
      time: activity.time || "",
      locationName: activity.location?.name || "",
      locationDescription: activity.location?.description || "",
      locationGps: activity.location?.gpsLink || "",
      result: activity.result || "",
      homeScore: activity.homeScore,
      awayScore: activity.awayScore,
      isWin: activity.isWin,
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
        
        const ourScore = isHomeTeam ? homeScore : awayScore;
        const theirScore = isHomeTeam ? awayScore : homeScore;
        
        if (ourScore !== undefined && theirScore !== undefined) {
          if (ourScore > theirScore) {
            isWin = true;
          } else if (ourScore < theirScore) {
            isWin = false;
          }
          // If scores are equal, isWin remains undefined (draw)
        }
      }
      
      // Create updated activity with form values
      const formUpdatedActivity: Activity = {
        ...activity,
        name: values.name,
        date: formattedDate,
        type: values.type,
        time: values.time || undefined,
        location,
        result,
        homeScore,
        awayScore,
        isWin,
        // Create or update player stats
        player_stats: {
          ...(activity.player_stats || {}),
          // Make sure to preserve existing goals and assists
          goals: activity.player_stats?.goals || {},
          assists: activity.player_stats?.assists || {},
          // Add scores information
          scores: {
            home: homeScore,
            away: awayScore
          },
          isWin
        }
      };

      // Use preserveMatchData to ensure match statistics are maintained
      const updatedActivity = preserveMatchData(activity, formUpdatedActivity);
      
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
