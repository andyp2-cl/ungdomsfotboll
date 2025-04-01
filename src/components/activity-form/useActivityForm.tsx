
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "@/types/player";
import { format } from "date-fns";
import { ActivityFormValues, activityFormSchema } from "./formSchema";
import { useState, useEffect } from "react";
import { normalizePlayerStats } from "@/hooks/activities/utils/playerStatsUtils";
import { handleActivitySubmit } from "@/utils/activity/handleActivitySubmit";

export function useActivityForm(
  activity: Activity,
  onSave: (updatedActivity: Activity) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize activity.player_stats before using
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

  // Auto-compute the result string when scores change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === 'homeScore' || name === 'awayScore') && 
          value.homeScore !== undefined && 
          value.awayScore !== undefined) {
        // Update result string
        form.setValue('result', `${value.homeScore}-${value.awayScore}`);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (values: ActivityFormValues) => {
    setIsSubmitting(true);
    
    try {
      await handleActivitySubmit(values, normalizedActivity, onSave, setIsSubmitting);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error in form submission:", error);
    }
  };

  return {
    form,
    handleSubmit,
    isSubmitting,
  };
}
