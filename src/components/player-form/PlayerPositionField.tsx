
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface PlayerPositionFieldProps {
  form: UseFormReturn<any>;
}

export function PlayerPositionField({ form }: PlayerPositionFieldProps) {
  const positions = [
    { value: 'MV', label: 'Målvakt' },
    { value: 'BACK', label: 'Back' },
    { value: 'MF', label: 'Mittfält' },
    { value: 'ANF', label: 'Anfallare' },
    { value: 'TRÄNARE', label: 'Tränare' }
  ];

  return (
    <FormField
      control={form.control}
      name="positions"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Positioner</FormLabel>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {positions.map((position) => (
              <FormField
                key={position.value}
                control={form.control}
                name="positions"
                render={({ field }) => (
                  <FormItem
                    key={position.value}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(position.value)}
                        onCheckedChange={(checked) => {
                          const currentPositions = field.value || [];
                          if (checked) {
                            field.onChange([...currentPositions, position.value]);
                          } else {
                            field.onChange(
                              currentPositions.filter((p: string) => p !== position.value)
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      {position.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
