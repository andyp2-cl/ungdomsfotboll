
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ActivityFormValues } from "./formSchema";
import { UseFormReturn } from "react-hook-form";
import { ActivityType } from "@/types/player";

interface ResultFieldsProps {
  form: UseFormReturn<ActivityFormValues>;
  activityType?: ActivityType; // Make activityType optional
}

export function ResultFields({ form, activityType }: ResultFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Resultat</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="homeScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hemmalag</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Mål" 
                  {...field}
                  value={field.value === undefined ? '' : field.value}
                  onChange={e => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : parseInt(value, 10));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="awayScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bortalag</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Mål" 
                  {...field}
                  value={field.value === undefined ? '' : field.value}
                  onChange={e => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : parseInt(value, 10));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="isWin"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Vinst för Hässleholms IF</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
