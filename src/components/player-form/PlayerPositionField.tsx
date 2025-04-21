
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { PlayerPosition } from "@/types/player";

interface PlayerPositionFieldProps {
  form: UseFormReturn<any>;
}

export function PlayerPositionField({ form }: PlayerPositionFieldProps) {
  const isTrainer = form.watch("isTrainer");

  // Update positions when trainer status changes
  React.useEffect(() => {
    const currentPositions = form.getValues("positions") || [];
    
    if (isTrainer) {
      // If becoming a trainer, ensure TRÄNARE is in positions
      if (!currentPositions.includes("TRÄNARE")) {
        form.setValue("positions", [...currentPositions, "TRÄNARE"]);
      }
    } else {
      // If no longer a trainer, remove TRÄNARE from positions
      if (currentPositions.includes("TRÄNARE")) {
        form.setValue("positions", currentPositions.filter(pos => pos !== "TRÄNARE"));
      }
    }
  }, [form, isTrainer]);

  // Available positions
  const positions: { label: string; value: PlayerPosition }[] = [
    { label: "Målvakt", value: "MV" },
    { label: "Back", value: "BACK" },
    { label: "Mittfältare", value: "MF" },
    { label: "Anfallare", value: "ANF" },
    { label: "Tränare", value: "TRÄNARE" },
  ];

  return (
    <FormField
      control={form.control}
      name="positions"
      render={() => (
        <FormItem>
          <div className="mb-2">
            <FormLabel>Position</FormLabel>
          </div>
          <div className="flex flex-wrap gap-2">
            {positions
              .filter(pos => isTrainer ? pos.value === "TRÄNARE" : true)
              .map((position) => (
                <FormField
                  key={position.value}
                  control={form.control}
                  name="positions"
                  render={({ field }) => {
                    const isSelected = field.value?.includes(position.value);
                    
                    return (
                      <FormItem
                        key={position.value}
                        className="flex items-center space-x-1 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              if (checked) {
                                field.onChange([...currentValues, position.value]);
                              } else {
                                field.onChange(
                                  currentValues.filter((val: string) => val !== position.value)
                                );
                              }
                            }}
                            id={`position-${position.value}`}
                            className="hidden"
                          />
                        </FormControl>
                        <Badge
                          variant={isSelected ? "default" : "outline"}
                          className="px-3 py-1 cursor-pointer select-none"
                          onClick={() => {
                            const currentValues = field.value || [];
                            if (currentValues.includes(position.value)) {
                              field.onChange(
                                currentValues.filter((val: string) => val !== position.value)
                              );
                            } else {
                              field.onChange([...currentValues, position.value]);
                            }
                          }}
                        >
                          {position.label}
                        </Badge>
                      </FormItem>
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
