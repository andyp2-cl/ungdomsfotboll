
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity } from "@/types/player";
import { v4 as uuidv4 } from 'uuid';

export interface CupMatch {
  id: string;
  name: string;
  time?: string;
  location?: string;
  locationDescription?: string;
}

interface CupMatchesFormProps {
  cupDate: string;
  onMatchesChange: (matches: CupMatch[]) => void;
}

export function CupMatchesForm({ cupDate, onMatchesChange }: CupMatchesFormProps) {
  const [matches, setMatches] = useState<CupMatch[]>([]);
  const [newMatch, setNewMatch] = useState<{
    name: string;
    time: string;
    location: string;
    locationDescription: string;
  }>({
    name: "",
    time: "",
    location: "",
    locationDescription: ""
  });

  const addMatch = () => {
    if (!newMatch.name.trim()) return;
    
    const match: CupMatch = {
      id: uuidv4(),
      name: newMatch.name,
      time: newMatch.time || undefined,
      location: newMatch.location || undefined,
      locationDescription: newMatch.locationDescription || undefined
    };
    
    const updatedMatches = [...matches, match];
    setMatches(updatedMatches);
    onMatchesChange(updatedMatches);
    
    // Reset the form
    setNewMatch({
      name: "",
      time: "",
      location: "",
      locationDescription: ""
    });
  };

  const removeMatch = (id: string) => {
    const updatedMatches = matches.filter(match => match.id !== id);
    setMatches(updatedMatches);
    onMatchesChange(updatedMatches);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Lägg till matcher i cupen</h3>
        
        {matches.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matchnamn</TableHead>
                  <TableHead>Tid</TableHead>
                  <TableHead>Plats</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.name}</TableCell>
                    <TableCell>{match.time || "-"}</TableCell>
                    <TableCell>
                      {match.location || "-"}
                      {match.locationDescription && (
                        <span className="text-xs text-muted-foreground block">
                          {match.locationDescription}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeMatch(match.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="space-y-4 border rounded-md p-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="matchName">Matchnamn</Label>
              <Input
                id="matchName"
                value={newMatch.name}
                onChange={(e) => setNewMatch({...newMatch, name: e.target.value})}
                placeholder="t.ex. HIF - Vinslöv"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="matchTime">Tid</Label>
                <Input
                  id="matchTime"
                  value={newMatch.time}
                  onChange={(e) => setNewMatch({...newMatch, time: e.target.value})}
                  placeholder="t.ex. 09:30"
                />
              </div>
              
              <div className="sm:col-span-2">
                <Label htmlFor="matchLocation">Plats</Label>
                <Input
                  id="matchLocation"
                  value={newMatch.location}
                  onChange={(e) => setNewMatch({...newMatch, location: e.target.value})}
                  placeholder="t.ex. Österås IP"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="locationDescription">Platsbeskrivning</Label>
              <Input
                id="locationDescription"
                value={newMatch.locationDescription}
                onChange={(e) => setNewMatch({...newMatch, locationDescription: e.target.value})}
                placeholder="t.ex. Plan 4, 7-manna"
              />
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={addMatch}
            disabled={!newMatch.name.trim()}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Lägg till match
          </Button>
        </div>
      </div>
    </div>
  );
}
