
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ActivityFormValues } from "./formSchema";

interface LocationFieldsProps {
  form: UseFormReturn<ActivityFormValues>;
}

export function LocationFields({ form }: LocationFieldsProps) {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-medium flex items-center mb-3">
        <MapPin className="h-4 w-4 mr-2" />
        Plats
      </h3>
      
      <FormField
        control={form.control}
        name="locationName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Platsnamn</FormLabel>
            <FormControl>
              <Input placeholder="t.ex. Östervångs IP" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField
          control={form.control}
          name="locationDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivning</FormLabel>
              <FormControl>
                <Input placeholder="t.ex. Plan 7, manna 7" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationGps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GPS-länk</FormLabel>
              <FormControl>
                <Input placeholder="https://maps.google.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
