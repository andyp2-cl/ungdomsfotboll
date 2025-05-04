
import React from "react";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { League } from "./hooks/useActivityData";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ActivityFormValues } from "./formSchema";

// Props for standalone usage
interface StandaloneLeagueSelectorProps {
  leagueId: string;
  leagues: League[];
  isLoading: boolean;
  onChange: (value: string) => void;
  form?: never;
}

// Props for form integration
interface FormLeagueSelectorProps {
  form: UseFormReturn<ActivityFormValues>;
  leagueId?: never;
  leagues?: never;
  isLoading?: never;
  onChange?: never;
}

// Union type for both prop types
type LeagueSelectorProps = StandaloneLeagueSelectorProps | FormLeagueSelectorProps;

export function LeagueSelector(props: LeagueSelectorProps) {
  // If form is provided, use FormField integration
  if ('form' in props) {
    return (
      <FormField
        control={props.form.control}
        name="leagueId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Liga (valfritt)</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                value={field.value || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj liga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen liga</SelectItem>
                  {/* We'll get leagues from useQuery in the component that uses this */}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
  
  // For standalone use
  const { leagueId, leagues, isLoading, onChange } = props;
  
  return (
    <div>
      <Label htmlFor="leagueId">Liga (valfritt)</Label>
      <Select 
        onValueChange={onChange} 
        value={leagueId}
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
    </div>
  );
}
