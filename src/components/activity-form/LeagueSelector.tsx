
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { ActivityFormValues } from "./formSchema";

// Define a League type
interface League {
  id: string;
  name: string;
  division: string;
  year: number;
}

// Function to fetch leagues from Supabase
const fetchLeagues = async (): Promise<League[]> => {
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
};

interface LeagueSelectorProps {
  form: UseFormReturn<ActivityFormValues>;
}

export function LeagueSelector({ form }: LeagueSelectorProps) {
  const { data: leagues = [], isLoading } = useQuery({
    queryKey: ["leagues"],
    queryFn: fetchLeagues,
  });
  
  return (
    <FormField
      control={form.control}
      name="leagueId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Liga (valfritt)</FormLabel>
          <FormControl>
            <Select
              value={field.value || "none"}
              onValueChange={field.onChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Laddar ligor..." : "Välj liga"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ingen liga</SelectItem>
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id}>
                    {league.name} ({league.year} {league.division})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
