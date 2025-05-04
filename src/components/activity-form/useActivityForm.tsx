
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "@/types/player";
import { activityFormSchema, ActivityFormValues } from "./formSchema";
import { submitActivityForm } from "./utils/activitySubmission";

export function useActivityForm(initialActivity: Activity | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("useActivityForm initializing with:", initialActivity?.id, "leagueId:", initialActivity?.leagueId);

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
      leagueId: initialActivity?.leagueId || "none",
    },
  });

  /**
   * Submit handler for the form
   * @param values Form values
   * @param onSave Function to call with the updated activity
   */
  const handleSubmit = async (
    values: ActivityFormValues, 
    onSave: (activity: Activity) => void
  ): Promise<boolean> => {
    if (isSubmitting) return false;
    
    setIsSubmitting(true);
    const emptyPlayers: never[] = [];
    
    return submitActivityForm(values, emptyPlayers, onSave, {
      onComplete: () => setIsSubmitting(false)
    });
  };

  return { form, isSubmitting, setIsSubmitting, handleSubmit };
}
