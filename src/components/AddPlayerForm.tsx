
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player } from "@/types/player";
import { ImageUploadField } from "./player-form/ImageUploadField";
import { PlayerPositionField } from "./player-form/PlayerPositionField";
import { FormButtons } from "./player-form/FormButtons";
import { usePlayerForm } from "./player-form/usePlayerForm";
import { Checkbox } from "./ui/checkbox";

export interface AddPlayerFormProps {
  onSave: (player: Player) => void;
  onCancel: () => void;
}

export function AddPlayerForm({ onSave, onCancel }: AddPlayerFormProps) {
  const { form, imagePreview, setImagePreview, handleSubmit, isTrainer } = usePlayerForm({ 
    onSave, 
    onCancel 
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto px-2">
        <ImageUploadField 
          imagePreview={imagePreview} 
          setImagePreview={setImagePreview} 
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Namn</FormLabel>
              <FormControl>
                <Input placeholder="Spelarens namn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isTrainer && (
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivå</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "A"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj nivå" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">Nivå A</SelectItem>
                    <SelectItem value="B">Nivå B</SelectItem>
                    <SelectItem value="C">Nivå C</SelectItem>
                    <SelectItem value="D">Nivå D</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <PlayerPositionField form={form} />

        <FormField
          control={form.control}
          name="jerseyNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tröjnummer</FormLabel>
              <FormControl>
                <Input placeholder="Tröjnummer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormButtons onCancel={onCancel} />
      </form>
    </Form>
  );
}

// Wrapper component for backward compatibility
export function AddPlayerFormWrapper({ 
  onPlayerAdded, 
  onClose 
}: { 
  onPlayerAdded: () => void; 
  onClose: () => void 
}) {
  return (
    <AddPlayerForm 
      onSave={() => onPlayerAdded()} 
      onCancel={onClose} 
    />
  );
}
