import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "@/types/player";
import { activityFormSchema, ActivityFormValues } from "./formSchema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { extractTeamNames } from "@/components/activity-detail/match-result/utils";

export function useActivityForm(initialActivity: Activity | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  console.log("useActivityForm initializing with leagueId:", initialActivity?.leagueId);

  // Extract team names from activity name if they're not already set
  let homeTeam = initialActivity?.homeTeam || "";
  let awayTeam = initialActivity?.awayTeam || "";
  
  if (initialActivity && (!homeTeam || !awayTeam)) {
    const teamNames = extractTeamNames(initialActivity);
    homeTeam = homeTeam || teamNames.homeTeam;
    awayTeam = awayTeam || teamNames.awayTeam;
  }

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
      homeTeam,
      awayTeam,
    },
  });

  return { form, isSubmitting, setIsSubmitting };
}
