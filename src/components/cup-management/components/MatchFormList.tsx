
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { CupMatch } from "../types";
import { Label } from "@/components/ui/label";

interface MatchFormListProps {
  matches: CupMatch[];
  onAddMatch: () => void;
  updateMatch: (index: number, field: keyof CupMatch, value: string | number | undefined) => void;
  removeMatch: (index: number) => void;
  showOnlyNameAndScore?: boolean;
}

export function MatchFormList({
  matches,
  onAddMatch,
  updateMatch,
  removeMatch,
  showOnlyNameAndScore = false
}: MatchFormListProps) {
  return (
    <div className="space-y-6">
      {matches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Inga matcher tillagda ännu. Lägg till en match nedan.
          </p>
          <Button onClick={onAddMatch} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Lägg till match
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {matches.map((match, index) => (
            <div key={match.id} className="border rounded-lg p-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeMatch(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor={`match-${index}-name`}>Matchens namn</Label>
                  <Input
                    id={`match-${index}-name`}
                    placeholder="t.ex. Hässleholm IF - Motståndare"
                    value={match.name || ""}
                    onChange={(e) => updateMatch(index, "name", e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`match-${index}-home-score`}>Hemmapoäng</Label>
                    <Input
                      id={`match-${index}-home-score`}
                      type="number"
                      min={0}
                      placeholder="0"
                      value={match.homeScore === undefined ? "" : match.homeScore}
                      onChange={(e) => updateMatch(index, "homeScore", e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`match-${index}-away-score`}>Bortapoäng</Label>
                    <Input
                      id={`match-${index}-away-score`}
                      type="number"
                      min={0}
                      placeholder="0"
                      value={match.awayScore === undefined ? "" : match.awayScore}
                      onChange={(e) => updateMatch(index, "awayScore", e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                
                {/* Only show time and location fields if not inheriting from cup */}
                {!showOnlyNameAndScore && (
                  <>
                    <div>
                      <Label htmlFor={`match-${index}-time`}>Tid</Label>
                      <Input
                        id={`match-${index}-time`}
                        placeholder="t.ex. 15:00"
                        value={match.time || ""}
                        onChange={(e) => updateMatch(index, "time", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`match-${index}-location`}>Plats</Label>
                      <Input
                        id={`match-${index}-location`}
                        placeholder="t.ex. Österås IP"
                        value={match.location || ""}
                        onChange={(e) => updateMatch(index, "location", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`match-${index}-location-desc`}>Platsbeskrivning</Label>
                      <Input
                        id={`match-${index}-location-desc`}
                        placeholder="t.ex. Plan 1"
                        value={match.locationDescription || ""}
                        onChange={(e) => updateMatch(index, "locationDescription", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          
          <Button 
            onClick={onAddMatch} 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Lägg till match
          </Button>
        </div>
      )}
    </div>
  );
}
