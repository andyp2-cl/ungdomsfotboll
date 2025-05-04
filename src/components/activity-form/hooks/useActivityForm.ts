
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "@/types/player";
import { activityFormSchema, ActivityFormValues } from "../formSchema";
import { format, parse } from "date-fns";
import { submitActivityForm } from "../utils/activitySubmission";
import { toast } from "sonner";

/**
 * Custom hook for handling the activity form in edit mode
 */
export function useActivityForm(activity: Activity) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set up form with zod validation
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: activity.name,
      type: activity.type,
      date: activity.date ? parse(activity.date, 'yyyy-MM-dd', new Date()) : new Date(),
      time: activity.time || "",
      location: {
        name: activity.location?.name || "",
        description: activity.location?.description || "",
        gpsLink: activity.location?.gpsLink || "",
      },
      homeScore: activity.homeScore,
      awayScore: activity.awayScore,
      cupName: activity.cupName,
      isWin: activity.isWin,
      leagueId: activity.leagueId || "none",
    },
  });

  // Handle form submission
  const handleSubmit = async (values: ActivityFormValues, onSave: (activity: Activity) => void) => {
    setIsSubmitting(true);
    
    try {
      // Create updated activity object
      const updatedActivity: Activity = {
        ...activity,
        name: values.name,
        type: values.type,
        date: format(values.date, 'yyyy-MM-dd'),
        time: values.time,
        location: values.location && {
          name: values.location.name || "",
          description: values.location.description || "",
          gpsLink: values.location.gpsLink || "",
        },
        homeScore: values.homeScore,
        awayScore: values.awayScore,
        isWin: values.isWin,
        leagueId: values.leagueId !== "none" ? values.leagueId : undefined,
      };
      
      // For match type, handle cup relationship
      if (values.type === "match" && values.cupName) {
        updatedActivity.cupName = values.cupName;
      }
      
      // For cup type, set cup properties
      if (values.type === "cup") {
        updatedActivity.cupId = activity.id;
        updatedActivity.cupName = values.name;
      }
      
      console.log("Saving updated activity:", updatedActivity);
      await onSave(updatedActivity);
      toast.success("Aktivitet uppdaterad");
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error(`Ett fel uppstod: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit,
  };
}
