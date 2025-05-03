
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ActivityFormValues } from "./formSchema";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultFieldsProps {
  form: UseFormReturn<ActivityFormValues>;
  activityType: string;
}

export function ResultFields({ form, activityType }: ResultFieldsProps) {
  const isMobile = useIsMobile();
  
  // Only show result fields for matches
  if (activityType !== "match") {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Matchresultat (valfritt)</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="homeScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hemmamål</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Hemmamål"
                  value={field.value === undefined ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 
                      undefined : 
                      parseInt(e.target.value, 10);
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="awayScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bortamål</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Bortamål"
                  value={field.value === undefined ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 
                      undefined : 
                      parseInt(e.target.value, 10);
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
