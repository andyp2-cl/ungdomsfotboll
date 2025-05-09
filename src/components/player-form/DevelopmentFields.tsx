
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { PlayerFormValues } from "./formSchema";

interface DevelopmentFieldsProps {
  form: UseFormReturn<PlayerFormValues>;
}

export function DevelopmentFields({ form }: DevelopmentFieldsProps) {
  // Development skill fields configuration
  const fields = [
    { name: "technical", label: "Teknik" },
    { name: "gameUnderstanding", label: "Spelförståelse" },
    { name: "passing", label: "Passningsspel" },
    { name: "offensive", label: "Offensiv" },
    { name: "defensive", label: "Defensiv" },
    { name: "mentality", label: "Mentalitet" }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Utveckling</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Ställ in spelarens utvecklingsnivå på en skala från 1-10
      </p>

      {fields.map((field) => (
        <FormField
          key={field.name}
          control={form.control}
          name={`development.${field.name}` as any}
          render={({ field: formField }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>{field.label}</FormLabel>
                <span className="text-sm font-medium">{formField.value}</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                defaultValue={[formField.value]}
                onValueChange={(value) => formField.onChange(value[0])}
                className="cursor-pointer"
              />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
