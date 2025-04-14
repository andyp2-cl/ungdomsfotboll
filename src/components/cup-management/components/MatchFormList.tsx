import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { CupMatch } from "../types";
import { MatchFormItem } from "./MatchFormItem";

interface MatchFormListProps {
  matches: CupMatch[];
  onAddMatch: () => void;
  updateMatch: (index: number, field: keyof CupMatch, value: string) => void;
  removeMatch: (index: number) => void;
}

export function MatchFormList({ 
  matches,
  onAddMatch,
  updateMatch,
  removeMatch
}: MatchFormListProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Nya matcher</h4>
        <Button 
          type="button" 
          onClick={onAddMatch} 
          size="sm" 
          variant="outline"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Lägg till match
        </Button>
      </div>
      
      {matches.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Inga matcher tillagda ännu. Klicka på "Lägg till match" för att lägga till matcher.
        </p>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <MatchFormItem
              key={match.id}
              match={match}
              index={index}
              updateMatch={updateMatch}
              removeMatch={removeMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
