
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
      
      // Create updated activity with form values
      const formUpdatedActivity: Activity = {
        ...activity,
        name: values.name,
        date: formattedDate,
        type: values.type,
        time: values.time || undefined,
        location,
        result: values.result || undefined,
        homeScore: values.homeScore,
        awayScore: values.awayScore,
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
