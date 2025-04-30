
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TrainerCheckboxProps {
  isTrainer: boolean;
  onChange: (checked: boolean) => void;
}

export function TrainerCheckbox({ isTrainer, onChange }: TrainerCheckboxProps) {
  return (
    <div className="border-t pt-4">
      <div className="flex items-center mb-4">
        <Checkbox 
          id="is-trainer" 
          checked={isTrainer}
          onCheckedChange={onChange}
          className="mr-2"
        />
        <Label htmlFor="is-trainer">Detta är en tränare</Label>
      </div>
    </div>
  );
}
