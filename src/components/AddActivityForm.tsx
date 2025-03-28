
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Activity, ActivityType } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";

const activityFormSchema = z.object({
  name: z.string().min(2, { message: "Namn måste vara minst 2 tecken" }),
  type: z.enum(["match", "cup"], {
    required_error: "Välj en aktivitetstyp",
  }),
  date: z.date({
    required_error: "Välj ett datum",
  }),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

interface AddActivityFormProps {
  onSave: (activity: Activity) => void;
  onCancel: () => void;
}

export function AddActivityForm({ onSave, onCancel }: AddActivityFormProps) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: "",
      type: "match",
    },
  });

  const handleSubmit = (values: ActivityFormValues) => {
    // Create a new activity with form values and a unique ID
    const newActivity: Activity = {
      id: uuidv4(),
      name: values.name,
      date: format(values.date, 'yyyy-MM-dd'),
      type: values.type as ActivityType,
      participants: [],
    };

    onSave(newActivity);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Avbryt
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Spara
          </Button>
        </div>
      </form>
    </Form>
  );
}
