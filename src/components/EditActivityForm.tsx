
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
  const { form, handleSubmit } = useActivityForm(activity, onSave);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <BasicInfoFields form={form} />
        <LocationFields form={form} />
        <ResultFields form={form} activityType={activity.type} />
        <FormButtons onCancel={onCancel} />
      </form>
    </Form>
  );
}
