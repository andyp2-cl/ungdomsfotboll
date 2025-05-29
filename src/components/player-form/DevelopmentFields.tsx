
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { PlayerFormValues } from "./formSchema";
import { Separator } from "@/components/ui/separator";

interface DevelopmentFieldsProps {
  form: UseFormReturn<PlayerFormValues>;
}

export function DevelopmentFields({ form }: DevelopmentFieldsProps) {
  // Development skill fields configuration organized by category
  const fieldCategories = [
    {
      title: "Grundläggande färdigheter",
      description: "Kärnfärdigheter för alla spelare",
      fields: [
        { name: "technical", label: "Teknik" },
        { name: "gameUnderstanding", label: "Spelförståelse" },
        { name: "passing", label: "Passningsspel" },
        { name: "offensive", label: "Offensiv" },
        { name: "defensive", label: "Defensiv" },
        { name: "mentality", label: "Mentalitet" }
      ]
    },
    {
      title: "Offensiva färdigheter",
      description: "Färdigheter för målskapande och avslut",
      fields: [
        { name: "shooting", label: "Skott" },
        { name: "finishing", label: "Avslut" },
        { name: "crossing", label: "Inlägg" },
        { name: "creativity", label: "Kreativitet" }
      ]
    },
    {
      title: "Defensiva färdigheter", 
      description: "Färdigheter för försvarsspel",
      fields: [
        { name: "tackling", label: "Tacklingar" },
        { name: "interception", label: "Avbrott" },
        { name: "positioning", label: "Positionering" },
        { name: "heading", label: "Huvudspel" }
      ]
    },
    {
      title: "Fysiska egenskaper",
      description: "Fysisk kapacitet och styrka",
      fields: [
        { name: "speed", label: "Snabbhet" },
        { name: "stamina", label: "Uthållighet" },
        { name: "strength", label: "Styrka" }
      ]
    },
    {
      title: "Mentala egenskaper",
      description: "Psykologiska och ledarskapsegenskaper",
      fields: [
        { name: "leadership", label: "Ledarskap" },
        { name: "composure", label: "Lugn" },
        { name: "workRate", label: "Arbetsmoral" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-lg">Spelarutveckling</h3>
        <p className="text-sm text-muted-foreground">
          Ställ in spelarens utvecklingsnivå på en skala från 1-10 för varje färdighet
        </p>
      </div>

      {fieldCategories.map((category, categoryIndex) => (
        <div key={category.title} className="space-y-4">
          <div>
            <h4 className="font-medium text-base">{category.title}</h4>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {category.fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={`development.${field.name}` as any}
                render={({ field: formField }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-sm">{field.label}</FormLabel>
                      <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                        {formField.value}
                      </span>
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
          
          {categoryIndex < fieldCategories.length - 1 && (
            <Separator className="my-4" />
          )}
        </div>
      ))}
    </div>
  );
}
