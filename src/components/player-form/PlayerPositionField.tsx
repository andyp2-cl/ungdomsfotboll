
import React from 'react';
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { CheckboxGroup, CheckboxItem } from "@/components/ui/checkbox-group";
import { UseFormReturn } from 'react-hook-form';

export type PlayerPositionFieldProps = {
  form: UseFormReturn<any>;
  positions?: string[];
  setPositions?: (positions: string[]) => void;
};

export function PlayerPositionField({ form, positions, setPositions }: PlayerPositionFieldProps) {
  const positionLabels = {
    MV: "Målvakt",
    BACK: "Back",
    MF: "Mittfältare",
    ANF: "Anfallare",
    TRÄNARE: "Tränare"
  };

  // Use form-controlled positions or prop-based ones
  const selectedPositions = form?.getValues?.('positions') || positions || [];
  
  const handlePositionChange = (position: string, checked: boolean) => {
    let newPositions: string[];
    
    if (checked) {
      // Add position
      newPositions = [...selectedPositions, position];
    } else {
      // Remove position
      newPositions = selectedPositions.filter(pos => pos !== position);
    }
    
    // Update form and/or props
    if (form) {
      form.setValue('positions', newPositions);
    }
    
    if (setPositions) {
      setPositions(newPositions);
    }
  };

  return (
    <FormField
      control={form.control}
      name="positions"
      render={() => (
        <FormItem>
          <FormLabel>Positioner</FormLabel>
          <CheckboxGroup className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(positionLabels).map(([value, label]) => (
              <CheckboxItem
                key={value}
                id={`position-${value}`}
                checked={selectedPositions.includes(value)}
                onCheckedChange={(checked) => handlePositionChange(value, !!checked)}
              >
                {label}
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </FormItem>
      )}
    />
  );
}
