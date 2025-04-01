
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Trophy } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ActivityFormValues } from "./formSchema";
import { ActivityType } from "@/types/player";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ResultFieldsProps {
  form: UseFormReturn<ActivityFormValues>;
  activityType: ActivityType;
}

export function ResultFields({ form, activityType }: ResultFieldsProps) {
  // Auto-compute the result string when scores change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === 'homeScore' || name === 'awayScore') && 
          value.homeScore !== undefined && 
          value.awayScore !== undefined) {
        form.setValue('result', `${value.homeScore}-${value.awayScore}`);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  if (activityType !== "match") {
    return null;
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-medium flex items-center mb-3">
        <Trophy className="h-4 w-4 mr-2" />
        Resultat
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="homeScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hemmamål</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field} 
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                    field.onChange(value);
                    
                    // Also update the result field for immediate feedback
                    if (value !== undefined && form.getValues().awayScore !== undefined) {
                      form.setValue('result', `${value}-${form.getValues().awayScore}`);
                    }
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
              <FormLabel>Bortamål</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field} 
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                    field.onChange(value);
                    
                    // Also update the result field for immediate feedback
                    if (value !== undefined && form.getValues().homeScore !== undefined) {
                      form.setValue('result', `${form.getValues().homeScore}-${value}`);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resultat (text)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="2-1" 
                  {...field} 
                  readOnly 
                  className="bg-gray-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4">
        <FormField
          control={form.control}
          name="isWin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Hässleholms IF vann matchen
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Markera om Hässleholms IF vann matchen oavsett resultat
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
