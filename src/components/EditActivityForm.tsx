import { Activity } from "@/types/player";
import { Form } from "@/components/ui/form";
import { useActivityForm } from "./activity-form/useActivityForm";
import { BasicInfoFields } from "./activity-form/BasicInfoFields";
import { LocationFields } from "./activity-form/LocationFields";
import { ResultFields } from "./activity-form/ResultFields";
import { FormButtons } from "./activity-form/FormButtons";
import { toast } from "sonner";
import { LeagueSelector } from "./activity-form/LeagueSelector";
import { handleActivitySubmit } from "@/utils/activity/handleActivitySubmit";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EditActivityFormProps {
  activity: Activity;
  onSave: (updatedActivity: Activity) => void;
  onCancel: () => void;
}

export function EditActivityForm({ activity, onSave, onCancel }: EditActivityFormProps) {
  console.log("EditActivityForm render with activity:", activity.id, "date:", activity.date, "leagueId:", activity.leagueId);
  
  // Create a clean copy of the activity with normalized player_stats
  const normalizedActivity = {
    ...activity,
    player_stats: normalizePlayerStats(activity.player_stats),
    // If leagueId is undefined but league_id is defined, use league_id
    leagueId: activity.leagueId || activity.league_id
  };
  
  const { form, isSubmitting, setIsSubmitting } = useActivityForm(normalizedActivity);
  
  // Lokala states för extra fält
  const [reportText, setReportText] = useState(activity.matchReport || "");
  const [youtubeLink, setYoutubeLink] = useState(activity.youtubeLink || "");

  const handleSubmit = async (values: any) => {
    if (isSubmitting) return; // Prevent double submission
    
    console.log("Form handleSubmit called with values:", values);
    setIsSubmitting(true);
    try {
      console.log("Form submission values:", values);
      // Skicka med matchReport och youtubeLink i updatedActivity
      await handleActivitySubmit(
        { ...values, matchReport: reportText, youtubeLink },
        normalizedActivity,
        async (updatedActivity) => {
          console.log("handleActivitySubmit onSave callback called with:", updatedActivity);
          await onSave(updatedActivity);
          console.log("onSave completed");
        },
        setIsSubmitting
      );
      console.log("Activity updated successfully with leagueId:", values.leagueId);
    } catch (error) {
      console.error("Failed to save activity:", error);
      toast.error("Kunde inte spara aktiviteten");
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <BasicInfoFields form={form} />
        <LeagueSelector form={form} />
        <LocationFields form={form} />
        <ResultFields form={form} activityType={activity.type} />

        {/* --- Matchrapportfält --- */}
        <div>
          <label htmlFor="match-report" className="block text-sm font-medium mb-1">
            Matchreferat
          </label>
          <Textarea
            id="match-report"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Skriv matchreferat här..."
            className="min-h-[100px]"
          />
        </div>

        {/* --- YouTube-länksfält --- */}
        <div>
          <label htmlFor="youtube-link" className="block text-sm font-medium mb-1">
            YouTube-länk
          </label>
          <Input
            id="youtube-link"
            type="url"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <FormButtons onCancel={onCancel} isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
}

// Helper function to ensure player_stats is properly normalized
function normalizePlayerStats(playerStats: any) {
  if (!playerStats) {
    return { goals: {}, assists: {} };
  }
  
  if (typeof playerStats === 'string') {
    try {
      const parsed = JSON.parse(playerStats);
      if (typeof parsed === 'string') {
        try {
          return JSON.parse(parsed);
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
  
  // Ensure the object has the required structure
  return {
    ...playerStats,
    goals: playerStats.goals || {},
    assists: playerStats.assists || {}
  };
}
