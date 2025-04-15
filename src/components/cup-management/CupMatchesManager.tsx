
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
import { useToast } from "@/hooks/use-toast";

interface CupMatchesManagerProps {
  cupActivity: Activity;
  matchActivities: Activity[];
  onAddMatches: (newMatches: Omit<Activity, 'id'>[]) => Promise<void>;
  onEditMatch?: (matchId: string) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function CupMatchesManager({
  cupActivity,
  matchActivities,
  onAddMatches,
  onEditMatch,
  onMatchResultUpdate
}: CupMatchesManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMatches, setNewMatches] = useState<CupMatch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

  const updateMatch = (index: number, field: keyof CupMatch, value: string | number | undefined) => {
    const updatedMatches = [...newMatches];
    updatedMatches[index] = {
      ...updatedMatches[index],
      [field]: value,
    };
    
    // If both home and away scores exist, create the result string
    if (field === "homeScore" || field === "awayScore") {
      const homeScore = field === "homeScore" ? value : updatedMatches[index].homeScore;
      const awayScore = field === "awayScore" ? value : updatedMatches[index].awayScore;
      
      if (homeScore !== undefined && awayScore !== undefined) {
        updatedMatches[index].result = `${homeScore}-${awayScore}`;
      } else {
        updatedMatches[index].result = undefined;
      }
    }
    
    setNewMatches(updatedMatches);
  };

  const removeMatch = (index: number) => {
    setNewMatches(newMatches.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (newMatches.length === 0) {
      toast({
        title: "Inga matcher att lägga till",
        description: "Lägg till minst en match innan du sparar",
        variant: "destructive"
      });
      return;
    }
    
    // Validate matches
    const invalidMatches = newMatches.filter(match => !match.name.trim());
    if (invalidMatches.length > 0) {
      toast({
        title: "Ofullständiga matcher",
        description: "Alla matcher måste ha ett namn",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting cup matches:", newMatches);
      
      const newActivities = newMatches.map(match => ({
        name: match.name,
        date: cupActivity.date,
        type: "match" as const,
        time: match.time,
        location: match.location ? {
          name: match.location,
          description: match.locationDescription
        } : undefined,
        cupId: cupActivity.id, // Critical: Set the cupId to link to parent cup
        participants: [],
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        result: match.result,
        // Add isWin if scores are defined
        isWin: match.homeScore !== undefined && match.awayScore !== undefined ? 
          (match.homeScore > match.awayScore) : undefined
      }));
      
      await onAddMatches(newActivities);
      
      toast({
        title: "Matcher tillagda",
        description: `${newMatches.length} matcher har lagts till i cupen.`,
      });
      
      // Clear form and close dialog
      setNewMatches([]);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding matches:", error);
      toast({
        title: "Ett fel inträffade",
        description: "Det gick inte att lägga till matcherna. Försök igen.",
        variant: "destructive"
      });
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
          onMatchResultUpdate={onMatchResultUpdate}
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
