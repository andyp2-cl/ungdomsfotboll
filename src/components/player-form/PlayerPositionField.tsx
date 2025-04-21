
import React from "react";
import { PlayerPosition } from "@/types/player";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface PlayerPositionFieldProps {
  form: UseFormReturn<any>;
  positions: PlayerPosition[];
  setPositions: (positions: PlayerPosition[]) => void;
}

export function PlayerPositionField({ 
  form, 
  positions, 
  setPositions 
}: PlayerPositionFieldProps) {
  const handlePositionChange = (position: PlayerPosition) => {
    if (positions.includes(position)) {
      setPositions(positions.filter(p => p !== position));
    } else {
      setPositions([...positions, position]);
    }
  };

  // Position options with readable labels
  const positionOptions = [
    { value: "MV", label: "Målvakt" },
    { value: "BACK", label: "Back" },
    { value: "MF", label: "Mittfältare" },
    { value: "ANF", label: "Anfallare" },
    { value: "TRÄNARE", label: "Tränare" }
  ];

  return (
    <FormField
      control={form.control}
      name="positions"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel>Position</FormLabel>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {positionOptions.map((option) => (
              <FormItem
                key={option.value}
                className="flex flex-row items-start space-x-3 space-y-0"
              >
                <FormControl>
                  <Checkbox
                    checked={positions.includes(option.value as PlayerPosition)}
                    onCheckedChange={() => handlePositionChange(option.value as PlayerPosition)}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  {option.label}
                </FormLabel>
              </FormItem>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
