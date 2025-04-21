
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { positionOptions } from "./formSchema";
import { UseFormReturn } from "react-hook-form";
import { PlayerFormValues } from "./formSchema";
import { PlayerPosition } from "@/types/player";
import { useEffect } from "react";

interface PlayerPositionFieldProps {
  form: UseFormReturn<PlayerFormValues>;
}

export function PlayerPositionField({ form }: PlayerPositionFieldProps) {
  const isTrainer = form.watch("isTrainer");

  // Handle isTrainer changes
  useEffect(() => {
    const positions = form.getValues("positions");
    if (isTrainer) {
      // Add TRÄNARE to positions if not already there
      if (!positions.includes("TRÄNARE")) {
        form.setValue("positions", [...positions, "TRÄNARE"]);
      }
    } else {
      // Remove TRÄNARE from positions if it exists
      if (positions.includes("TRÄNARE")) {
        form.setValue(
          "positions",
          positions.filter(pos => pos !== "TRÄNARE")
        );
      }
    }
  }, [isTrainer, form]);

  return (
    <>
      <FormField
        control={form.control}
        name="isTrainer"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id="isTrainer"
            />
            <div className="space-y-1 leading-none">
              <FormLabel htmlFor="isTrainer">Tränare</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {!isTrainer && (
        <FormField
          control={form.control}
          name="positions"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Position</FormLabel>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {positionOptions.filter(option => option.value !== "TRÄNARE").map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="positions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <Checkbox
                              checked={field.value?.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const currentPositions = field.value || [];
                                const updated = checked
                                  ? [...currentPositions, option.value]
                                  : currentPositions.filter(
                                      (value) => value !== option.value
                                    );
                                field.onChange(updated);
                              }}
                            />
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
