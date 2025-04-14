
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatDate";

export interface CupMatch {
  id: string;
  name: string;
  time: string;
  location?: string;
  locationDescription?: string;
}

interface CupMatchesManagerProps {
  cupActivity: Activity;
  matchActivities: Activity[];
  onAddMatches: (newMatches: Omit<Activity, 'id'>[]) => Promise<void>;
  onEditMatch?: (matchId: string) => void;
}

export function CupMatchesManager({
  cupActivity,
  matchActivities,
  onAddMatches,
  onEditMatch
}: CupMatchesManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMatches, setNewMatches] = useState<CupMatch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMatch = () => {
    const newMatch: CupMatch = {
      id: uuidv4(),
      name: "",
      time: "",
      location: "",
      locationDescription: "",
    };
    
    setNewMatches([...newMatches, newMatch]);
  };

  const updateMatch = (index: number, field: keyof CupMatch, value: string) => {
    const updatedMatches = [...newMatches];
    updatedMatches[index] = {
      ...updatedMatches[index],
      [field]: value,
    };
    
    setNewMatches(updatedMatches);
  };

  const removeMatch = (index: number) => {
    setNewMatches(newMatches.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (newMatches.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Transform CupMatch objects to Activity objects
      const newActivities = newMatches.map(match => ({
        name: match.name,
        date: cupActivity.date,
        type: "match" as const,
        time: match.time,
        location: match.location ? {
          name: match.location,
          description: match.locationDescription
        } : undefined,
        cupId: cupActivity.id,
        participants: [],
      }));
      
      await onAddMatches(newActivities);
      
      // Reset and close dialog
      setNewMatches([]);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding matches:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Cupmatcher</h3>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Lägg till matcher
        </Button>
      </div>
      
      {matchActivities.length > 0 ? (
        <div className="space-y-2">
          {matchActivities.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{match.name}</div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                      <span>{formatDate(match.date)}</span>
                      {match.time && <Badge variant="outline" className="font-normal">{match.time}</Badge>}
                      {match.location?.name && (
                        <Badge variant="outline" className="font-normal">
                          {match.location.name}
                          {match.location.description && ` - ${match.location.description}`}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditMatch && onEditMatch(match.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Redigera
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">
            Inga matcher tillagda i denna cup ännu.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Lägg till matcher nu
          </Button>
        </div>
      )}
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Lägg till matcher i {cupActivity.name}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Nya matcher</h4>
                <Button 
                  type="button" 
                  onClick={handleAddMatch} 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Lägg till match
                </Button>
              </div>
              
              {newMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Inga matcher tillagda ännu. Klicka på "Lägg till match" för att lägga till matcher.
                </p>
              ) : (
                <div className="space-y-4">
                  {newMatches.map((match, index) => (
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={newMatches.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Sparar..." : `Lägg till ${newMatches.length} matcher`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
