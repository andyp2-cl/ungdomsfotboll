
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "@/types/player";
import { activityFormSchema, ActivityFormValues } from "./formSchema";
import { format } from "date-fns";

export function useActivityForm(
  initialActivity: Activity | null,
  onSave: (activity: Activity) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form with default values
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: initialActivity?.name || "",
      type: initialActivity?.type || "match",
      date: initialActivity?.date ? new Date(initialActivity.date) : new Date(),
      time: initialActivity?.time || "",
      location: {
        name: initialActivity?.location?.name || "",
        description: initialActivity?.location?.description || "",
        gpsLink: initialActivity?.location?.gpsLink || "",
      },
      homeScore: initialActivity?.homeScore,
      awayScore: initialActivity?.awayScore,
      cupName: initialActivity?.cupName || "",
      isWin: initialActivity?.isWin,
      league_id: initialActivity?.league_id && initialActivity.league_id !== "none" 
        ? initialActivity.league_id 
        : undefined,
    },
  });

  // Handle form submission
  const handleSubmit = async (values: ActivityFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create updated activity object
      const updatedActivity: Activity = {
        ...(initialActivity || { id: "", participants: [] }), // Ensure we have a base activity
        name: values.name,
        type: values.type,
        date: format(values.date, 'yyyy-MM-dd'),
        time: values.time,
        location: values.location?.name
          ? {
              name: values.location.name,
              description: values.location.description,
              gpsLink: values.location.gpsLink,
            }
          : undefined,
        homeScore: values.homeScore,
        awayScore: values.awayScore,
        // Only set cupName if it's not "no-cup" and we're dealing with a match
        cupName: values.type === "match" && values.cupName && values.cupName !== "no-cup" 
          ? values.cupName 
          : undefined,
        isWin: values.isWin,
        // Set league_id if it's not "none"
        league_id: values.league_id && values.league_id !== "none" ? values.league_id : undefined
      };

      // Update result string
      if (values.homeScore !== undefined && values.awayScore !== undefined) {
        updatedActivity.result = `${values.homeScore}-${values.awayScore}`;
      }

      // Call save handler
      await onSave(updatedActivity);
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, handleSubmit, isSubmitting };
}
