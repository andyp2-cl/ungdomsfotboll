
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { TimeInput } from "./TimeInput";
import { ActivityFormValues } from "./formSchema";
import { LeagueSelector } from "./LeagueSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useEffect } from "react";

interface BasicInfoFieldsProps {
  form: UseFormReturn<ActivityFormValues>;
  onTypeChange?: (type: string) => void;
}

export function BasicInfoFields({ form, onTypeChange }: BasicInfoFieldsProps) {
  const type = form.watch("type");
  
  // Fetch leagues for the league selector when type is "match"
  const { data: leagues = [] } = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .order("year", { ascending: false })
        .order("name");
        
      if (error) {
        console.error("Error fetching leagues:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: type === "match"
  });
  
  useEffect(() => {
    if (onTypeChange) {
      onTypeChange(type);
    }
  }, [type, onTypeChange]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Namn</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Typ</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                className="flex gap-4"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="match" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Match</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="cup" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Cup</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="training" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Träning</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Only show league selector for match type */}
      {type === "match" && <LeagueSelector form={form} />}
      
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Datum</FormLabel>
            <FormControl>
              <DatePicker
                value={field.value}
                onSelect={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <TimeInput form={form} />
    </div>
  );
}
