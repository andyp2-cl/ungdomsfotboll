
import { Activity } from "@/types/player";
import { Form } from "@/components/ui/form";
import { useActivityForm } from "./activity-form/useActivityForm";
import { BasicInfoFields } from "./activity-form/BasicInfoFields";
import { LocationFields } from "./activity-form/LocationFields";
import { ResultFields } from "./activity-form/ResultFields";
import { FormButtons } from "./activity-form/FormButtons";
import { normalizePlayerStats as normalizeStats } from "@/hooks/activities/utils/playerStatsUtils";

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
    player_stats: normalizeStats(activity.player_stats),
    // If leagueId is undefined but league_id is defined, use league_id
    leagueId: activity.leagueId || activity.league_id
  };
  
  const { form, isSubmitting, handleSubmit } = useActivityForm(normalizedActivity);
  
  const onSubmit = async (values: any) => {
    await handleSubmit(values, onSave);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <BasicInfoFields form={form} />
        <div className="space-y-4">
          <LocationFields
            locationName={form.watch("location.name") || ""}
            locationDescription={form.watch("location.description") || ""}
            locationGpsLink={form.watch("location.gpsLink") || ""}
            onLocationNameChange={(e) => form.setValue("location.name", e.target.value)}
            onLocationDescriptionChange={(e) => form.setValue("location.description", e.target.value)}
            onLocationGpsLinkChange={(e) => form.setValue("location.gpsLink", e.target.value)}
          />
        </div>
        <ResultFields form={form} activityType={activity.type} />
        <FormButtons 
          onCancel={onCancel} 
          onSave={form.handleSubmit(onSubmit)}
          isSaving={isSubmitting} 
        />
      </form>
    </Form>
  );
}
