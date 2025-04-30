
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { PlayerPosition } from "@/types/player";

interface PlayerFormFieldsProps {
  form: UseFormReturn<any>;
  isTrainer: boolean;
}

export function PlayerFormFields({ form, isTrainer }: PlayerFormFieldsProps) {
  // Available player positions
  const positions: { label: string; value: PlayerPosition }[] = [
    { label: "Målvakt", value: "MV" },
    { label: "Back", value: "BACK" },
    { label: "Mittfältare", value: "MF" },
    { label: "Anfallare", value: "ANF" },
    { label: "Tränare", value: "TRÄNARE" },
  ];

  return (
    <>
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
            <FormItem className="space-y-3">
              <FormLabel>Nivå</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-2"
                >
                  {["A", "B", "C", "D"].map((grade) => (
                    <FormItem
                      key={grade}
                      className="flex items-center space-x-1 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={grade} id={`grade-${grade}`} />
                      </FormControl>
                      <Label
                        htmlFor={`grade-${grade}`}
                        className="font-normal cursor-pointer"
                      >
                        {grade}
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="positions"
        render={() => (
          <FormItem>
            <div className="mb-2">
              <FormLabel>Position</FormLabel>
            </div>
            <div className="flex flex-wrap gap-2">
              {positions.filter(pos => isTrainer ? pos.value === "TRÄNARE" : true).map((position) => (
                <FormField
                  key={position.value}
                  control={form.control}
                  name="positions"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={position.value}
                        className="flex items-center space-x-1 space-y-0"
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
                                  currentPositions.filter((val) => val !== position.value)
                                );
                              }
                            }}
                            id={`position-${position.value}`}
                            className="hidden"
                          />
                        </FormControl>
                        <Badge
                          variant={
                            field.value?.includes(position.value)
                              ? "default"
                              : "outline"
                          }
                          className="px-3 py-1 cursor-pointer select-none"
                          onClick={() => {
                            const currentPositions = field.value || [];
                            if (currentPositions.includes(position.value)) {
                              field.onChange(
                                currentPositions.filter((val) => val !== position.value)
                              );
                            } else {
                              field.onChange([...currentPositions, position.value]);
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

      <FormField
        control={form.control}
        name="jerseyNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tröjnummer</FormLabel>
            <FormControl>
              <Input placeholder="t.ex. 10" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
