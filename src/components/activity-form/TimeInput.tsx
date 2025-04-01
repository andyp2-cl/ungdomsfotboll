
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ActivityFormValues } from "./formSchema";

interface TimeInputProps {
  form: UseFormReturn<ActivityFormValues>;
}

export function TimeInput({ form }: TimeInputProps) {
  return (
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tid</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                placeholder="t.ex. 09:30" 
                {...field} 
                className="pl-10"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
