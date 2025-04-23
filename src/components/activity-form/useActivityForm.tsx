
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "@/types/player";
import { activityFormSchema, ActivityFormValues } from "./formSchema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function useActivityForm(initialActivity: Activity | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  console.log("useActivityForm initializing with leagueId:", initialActivity?.leagueId);

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

  return { form, isSubmitting, setIsSubmitting };
}
