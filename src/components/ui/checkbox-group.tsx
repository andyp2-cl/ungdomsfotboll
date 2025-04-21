
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form";

export interface CheckboxGroupProps {
  className?: string;
  children: React.ReactNode;
}

export interface CheckboxItemProps {
  id: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function CheckboxGroup({ className, children }: CheckboxGroupProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CheckboxItem({ 
  id, 
  checked, 
  onCheckedChange, 
  disabled, 
  children 
}: CheckboxItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={id} 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <FormLabel htmlFor={id} className="font-normal cursor-pointer">
        {children}
      </FormLabel>
    </div>
  );
}
