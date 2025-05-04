
import React from "react";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CupSelectorProps {
  cupName: string;
  cupNames: string[];
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function CupSelector({ cupName, cupNames, isLoading, onChange }: CupSelectorProps) {
  return (
    <div>
      <Label htmlFor="cupName">Cup (valfritt)</Label>
      <Select 
        onValueChange={onChange} 
        value={cupName}
        disabled={isLoading || cupNames.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Laddar cuper..." : "Välj cup eller lämna tom"} />
        </SelectTrigger>
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
    </div>
  );
}
