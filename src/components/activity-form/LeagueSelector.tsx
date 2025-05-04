
import React from "react";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { League } from "./hooks/useActivityData";

interface LeagueSelectorProps {
  leagueId: string;
  leagues: League[];
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function LeagueSelector({ 
  leagueId, 
  leagues, 
  isLoading, 
  onChange 
}: LeagueSelectorProps) {
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
