
import React, { useEffect } from "react";
import { Activity } from "@/types/player";
import { toast } from "sonner";
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
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["activities"],
    queryFn: getStoredActivities,
  });
  
  // Make sure to filter by type AND verify cups have correct fields
  const cups = activities?.filter(act => 
    act.type === "cup" && 
    act.id && // Ensure we have a valid ID
    act.name // Ensure the cup has a name
  ) || [];
  
  // Debug logging
  useEffect(() => {
    if (activities) {
      const allCups = activities.filter(act => act.type === "cup");
      console.log(`Found ${allCups.length} cups in total, ${cups.length} valid cups for selection`);
      
      // Log details about any malformed cups
      if (allCups.length > cups.length) {
        console.warn("Some cups may be malformed:", 
          allCups.filter(act => !act.id || !act.name).map(c => ({
            id: c.id, 
            name: c.name, 
            dateCreated: c.date
          }))
        );
      }
      
      // Log all valid cups
      cups.forEach(cup => {
        console.log(`Cup ${cup.name} (${cup.id}) has ${cup.participants?.length || 0} participants`);
      });
    }
  }, [activities, cups]);
  
  const handleCupSelect = (cupId: string) => {
    console.log(`Cup selected: ${cupId}`);
    onCupSelect(cupId);
    
    if (cupId === "no-cup") {
      return;
    }
    
    const selectedCupActivity = cups.find(cup => cup.id === cupId);
    
    if (!selectedCupActivity) {
      console.error(`Failed to find cup with ID: ${cupId}`);
      toast.error("Kunde inte hitta den valda cupen.");
      return;
    }
    
    console.log(`Selected cup: ${selectedCupActivity.name} with ${selectedCupActivity.participants?.length || 0} participants`);
    
    if (selectedCupActivity?.participants?.length) {
      const newParticipants = selectedCupActivity.participants.filter(
        participantId => !currentParticipantIds.includes(participantId)
      );
      
      console.log(`Found ${newParticipants.length} new participants to add`);
      
      if (newParticipants.length > 0) {
        onAddPlayers(newParticipants);
        toast.success(`${newParticipants.length} deltagare från ${selectedCupActivity.name} har lagts till.`);
      } else {
        toast.info("Alla deltagare från denna cup är redan tillagda i matchen.");
      }
    } else {
      console.log(`Cup ${selectedCupActivity.name} has no participants`);
      toast.warning("Den valda cupen har inga deltagare.");
    }
  };

  if (isLoading) return <div>Laddar cuper...</div>;
  if (error) return <div>Kunde inte hämta cuper</div>;
  if (!cups.length) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="cup-select">Välj cup för att lägga till alla deltagare</Label>
      <Select 
        onValueChange={handleCupSelect} 
        value={selectedCup}
      >
        <SelectTrigger className="w-full" id="cup-select">
          <SelectValue placeholder="Välj en cup" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="no-cup">Ingen cup</SelectItem>
          {cups.map((cup) => (
            <SelectItem key={cup.id} value={cup.id}>
              {cup.name} ({cup.participants?.length || 0} deltagare)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
