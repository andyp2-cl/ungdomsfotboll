
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { PlayerFormValues, positionOptions } from "./formSchema";

interface PlayerPositionFieldProps {
  form: UseFormReturn<PlayerFormValues>;
}

export function PlayerPositionField({ form }: PlayerPositionFieldProps) {
  return (
    <FormField
      control={form.control}
      name="positions"
      render={() => (
        <FormItem>
          <FormLabel>Positioner</FormLabel>
          <div className="flex flex-col space-y-2">
            {positionOptions.map((position) => (
              <FormField
                key={position.value}
                control={form.control}
                name="positions"
                render={({ field }) => {
                  return (
                    <div className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`position-${position.value}`}
                        checked={field.value?.includes(position.value)}
                        onCheckedChange={(checked) => {
                          let updatedPositions = [...(field.value || [])];
                          if (checked) {
                            updatedPositions.push(position.value);
                          } else {
                            updatedPositions = updatedPositions.filter(
                              (p) => p !== position.value
                            );
                          }
                          field.onChange(updatedPositions);
                        }}
                      />
                      <label
                        htmlFor={`position-${position.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {position.label}
                      </label>
                    </div>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
