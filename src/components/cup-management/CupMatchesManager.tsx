import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { CupMatch } from "./types";
import { 
  MatchDialog, 
  MatchListView,
  EmptyMatchesView
} from "./components";

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
        <MatchListView 
          matches={matchActivities} 
          onEditMatch={onEditMatch} 
        />
      ) : (
        <EmptyMatchesView onAddClick={() => setIsAddDialogOpen(true)} />
      )}
      
      <MatchDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        cupName={cupActivity.name}
        newMatches={newMatches}
        onAddMatch={handleAddMatch}
        updateMatch={updateMatch}
        removeMatch={removeMatch}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
