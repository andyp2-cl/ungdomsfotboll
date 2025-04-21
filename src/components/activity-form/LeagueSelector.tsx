
import { useQuery } from "@tanstack/react-query";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ActivityFormValues } from "./formSchema";
import { supabase } from "@/integrations/supabase/client";
import { League } from "@/types/player";

interface LeagueSelectorProps {
  form: UseFormReturn<ActivityFormValues>;
  activityType: "match" | "cup";
}

export function LeagueSelector({ form, activityType }: LeagueSelectorProps) {
  const { data: leagues, isLoading } = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .order('year', { ascending: false })
        .order('division');
      
      if (error) throw error;
      return data as League[];
    },
  });

  if (activityType !== "match") return null;

  return (
    <FormField
      control={form.control}
      name="league_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Liga</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || "none"}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Laddar ligor..." : "Välj liga"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Ingen liga</SelectItem>
              {leagues?.map((league) => (
                <SelectItem key={league.id} value={league.id}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
