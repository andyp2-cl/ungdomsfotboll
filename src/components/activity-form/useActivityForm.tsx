
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "@/types/player";
import { format } from "date-fns";
import { ActivityFormValues, activityFormSchema } from "./formSchema";

export function useActivityForm(
  activity: Activity,
  onSave: (updatedActivity: Activity) => void
) {
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

  const handleSubmit = (values: ActivityFormValues) => {
    // Update activity with form values
    const updatedActivity: Activity = {
      ...activity,
      name: values.name,
      date: format(values.date, 'yyyy-MM-dd'),
      type: values.type,
      time: values.time || undefined,
      result: values.result || undefined,
      homeScore: values.homeScore,
      awayScore: values.awayScore,
    };

    // Add location information if provided
    if (values.locationName) {
      updatedActivity.location = {
        name: values.locationName,
        description: values.locationDescription || undefined,
        gpsLink: values.locationGps || undefined,
      };
    } else {
      updatedActivity.location = undefined;
    }

    onSave(updatedActivity);
  };

  return {
    form,
    handleSubmit,
  };
}
