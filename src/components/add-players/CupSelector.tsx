
import React from "react";
import { Activity } from "@/types/player";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getStoredActivities } from "@/utils/storage/activity/fetch";

interface CupSelectorProps {
  selectedCup: string;
  onCupSelect: (cupId: string) => void;
  currentParticipantIds: string[];
  onAddPlayers: (playerIds: string[]) => void;
}

export function CupSelector({
  selectedCup,
  onCupSelect,
  currentParticipantIds,
  onAddPlayers
}: CupSelectorProps) {
  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: getStoredActivities,
  });
  
  const cups = activities?.filter(act => act.type === "cup") || [];
  
  const handleCupSelect = (cupId: string) => {
    onCupSelect(cupId);
    
    if (cupId === "no-cup") {
      return;
    }
    
    const selectedCupActivity = cups.find(cup => cup.id === cupId);
    
    if (selectedCupActivity?.participants?.length) {
      const newParticipants = selectedCupActivity.participants.filter(
        participantId => !currentParticipantIds.includes(participantId)
      );
      
      if (newParticipants.length > 0) {
        onAddPlayers(newParticipants);
        toast({
          title: "Deltagare tillagda",
          description: `${newParticipants.length} deltagare från ${selectedCupActivity.name} har lagts till.`,
        });
      } else {
        toast({
          title: "Inga nya deltagare",
          description: "Alla deltagare från denna cup är redan tillagda i matchen.",
        });
      }
    } else {
      toast({
        title: "Inga deltagare",
        description: "Den valda cupen har inga deltagare.",
      });
    }
  };

  if (!cups.length) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="cup-select">Välj cup för att lägga till alla deltagare</Label>
      <Select 
        onValueChange={handleCupSelect} 
        value={selectedCup}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Välj en cup" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="no-cup">Ingen cup</SelectItem>
          {cups.map((cup) => (
            <SelectItem key={cup.id} value={cup.id}>
              {cup.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
