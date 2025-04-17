
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { ActivityFormValues } from "./formSchema";
import { TimeInput } from "./TimeInput";
import { useEffect, useState } from "react";
import { getAllCupNames } from "@/lib/supabase/activities";
import { useQuery } from "@tanstack/react-query";
import { getStoredActivities } from "@/utils/storage/activity/fetch";

interface BasicInfoFieldsProps {
  form: UseFormReturn<ActivityFormValues>;
}

export function BasicInfoFields({ form }: BasicInfoFieldsProps) {
  const [cupNames, setCupNames] = useState<string[]>([]);
  const activityType = form.watch("type");
  
  // Fetch activities to get cup names
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: getStoredActivities,
  });
  
  // Extract cup names when activities are loaded
  useEffect(() => {
    if (activities && activities.length > 0) {
      const names = getAllCupNames(activities);
      setCupNames(names);
      console.log("Cup names in dropdown:", names);
    }
  }, [activities]);

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Namn</FormLabel>
            <FormControl>
              <Input placeholder="Aktivitetens namn" {...field} />
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Välj aktivitetstyp" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="match">Match</SelectItem>
                <SelectItem value="cup">Cup</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Show Cup Name field for match type */}
      {activityType === "match" && (
        <FormField
          control={form.control}
          name="cupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cup (valfritt)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || "no-cup"}
                disabled={isLoading || cupNames.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Laddar..." : "Välj cup eller lämna tom"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-cup">Ingen cup</SelectItem>
                  {cupNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cupNames.length === 0 && !isLoading && (
                <p className="text-xs text-muted-foreground mt-1">
                  Inga cuper hittades. Skapa en cup först.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Datum</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "yyyy-MM-dd")
                      ) : (
                        <span>Välj ett datum</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <TimeInput form={form} />
      </div>
    </>
  );
}
