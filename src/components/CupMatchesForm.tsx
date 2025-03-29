
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

export interface CupMatch {
  id: string;
  name: string;
  time: string;
  location?: string;
  locationDescription?: string;
}

interface CupMatchesFormProps {
  cupDate?: string;
  onMatchesChange: (matches: CupMatch[]) => void;
  matches?: CupMatch[];
}

export function CupMatchesForm({
  cupDate,
  onMatchesChange,
  matches: initialMatches,
}: CupMatchesFormProps) {
  const [matches, setMatches] = useState<CupMatch[]>(initialMatches || []);

  const addMatch = () => {
    const newMatch: CupMatch = {
      id: uuidv4(),
      name: "",
      time: "",
      location: "",
      locationDescription: "",
    };
    
    const updatedMatches = [...matches, newMatch];
    setMatches(updatedMatches);
    onMatchesChange(updatedMatches);
  };

  const updateMatch = (index: number, field: keyof CupMatch, value: string) => {
    const updatedMatches = [...matches];
    updatedMatches[index] = {
      ...updatedMatches[index],
      [field]: value,
    };
    
    setMatches(updatedMatches);
    onMatchesChange(updatedMatches);
  };

  const removeMatch = (index: number) => {
    const updatedMatches = matches.filter((_, i) => i !== index);
    setMatches(updatedMatches);
    onMatchesChange(updatedMatches);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Cupmatcher</h3>
        <Button type="button" onClick={addMatch} size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Lägg till match
        </Button>
      </div>
      
      {matches.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Inga matcher tillagda ännu. Klicka på "Lägg till match" för att lägga till cupmatcher.
        </p>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <div key={match.id} className="border p-3 rounded-md space-y-3">
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
              
              {cupDate && (
                <p className="text-xs text-muted-foreground">
                  Datum: {cupDate}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
