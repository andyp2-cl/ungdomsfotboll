import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { CupMatch } from "../types";

interface MatchFormItemProps {
  match: CupMatch;
  index: number;
  updateMatch: (index: number, field: keyof CupMatch, value: string) => void;
  removeMatch: (index: number) => void;
}

export function MatchFormItem({
  match,
  index,
  updateMatch,
  removeMatch
}: MatchFormItemProps) {
  return (
    <div className="border p-3 rounded-md space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div>
            <Label htmlFor={`match-name-${index}`}>Matchnamn</Label>
            <Input
              id={`match-name-${index}`}
              value={match.name}
              onChange={(e) => updateMatch(index, "name", e.target.value)}
              placeholder="T.ex. Hässleholms IF svart - FC Hessleholm"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`match-time-${index}`}>Tid</Label>
              <Input
                id={`match-time-${index}`}
                type="time"
                value={match.time}
                onChange={(e) => updateMatch(index, "time", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`match-location-${index}`}>Plats</Label>
              <Input
                id={`match-location-${index}`}
                value={match.location}
                onChange={(e) => updateMatch(index, "location", e.target.value)}
                placeholder="Platsnamn"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor={`match-location-desc-${index}`}>Beskrivning av plats</Label>
            <Input
              id={`match-location-desc-${index}`}
              value={match.locationDescription}
              onChange={(e) => updateMatch(index, "locationDescription", e.target.value)}
              placeholder="T.ex. A-plan 11-manna"
            />
          </div>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => removeMatch(index)}
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
