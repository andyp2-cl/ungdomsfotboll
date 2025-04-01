
import { Activity } from "@/types/player";
import { Form } from "@/components/ui/form";
import { useActivityForm } from "./activity-form/useActivityForm";
import { BasicInfoFields } from "./activity-form/BasicInfoFields";
import { LocationFields } from "./activity-form/LocationFields";
import { ResultFields } from "./activity-form/ResultFields";
import { FormButtons } from "./activity-form/FormButtons";

interface EditActivityFormProps {
  activity: Activity;
  onSave: (updatedActivity: Activity) => void;
  onCancel: () => void;
}

export function EditActivityForm({ activity, onSave, onCancel }: EditActivityFormProps) {
  // Normalisera player_stats innan vi skickar in det i useActivityForm
  const normalizedActivity = {
    ...activity,
    player_stats: normalizePlayerStats(activity.player_stats)
  };
  
  const { form, handleSubmit, isSubmitting } = useActivityForm(normalizedActivity, onSave);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <BasicInfoFields form={form} />
        <LocationFields form={form} />
        <ResultFields form={form} activityType={activity.type} />
        <FormButtons onCancel={onCancel} isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
}

// Hjälpfunktion för att säkerställa att player_stats alltid är ett objekt
function normalizePlayerStats(playerStats: any) {
  if (!playerStats) {
    return { goals: {}, assists: {} };
  }
  
  if (typeof playerStats === 'string') {
    try {
      const parsed = JSON.parse(playerStats);
      // Hantera dubbelt stringifierad JSON
      if (typeof parsed === 'string') {
        try {
          const doubleParsed = JSON.parse(parsed);
          return {
            ...doubleParsed,
            goals: doubleParsed.goals || {},
            assists: doubleParsed.assists || {}
          };
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
  
  // Om det redan är ett objekt, säkerställ att det har nödvändiga egenskaper
  return {
    ...playerStats,
    goals: playerStats.goals || {},
    assists: playerStats.assists || {}
  };
}
