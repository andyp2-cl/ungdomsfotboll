
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
  // Ensure activity.player_stats is an object before passing to useActivityForm
  const normalizedActivity = {
    ...activity,
    player_stats: typeof activity.player_stats === 'string' 
      ? JSON.parse(activity.player_stats) 
      : activity.player_stats || { goals: {}, assists: {} }
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
