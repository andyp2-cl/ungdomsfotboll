
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
  
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      console.log("Form submission values:", values);
      await handleActivitySubmit(values, normalizedActivity, onSave, setIsSubmitting);
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
