
import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { CupSelector } from "./add-players/CupSelector";
import { PlayerMultiSelect } from "./add-players/PlayerMultiSelect";
import { PlayerQuickSelect } from "./add-players/PlayerQuickSelect";
import { toast } from "sonner";
import { AlertCircle, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AddPlayersToActivityProps {
  activity: Activity;
  players: Player[];
  onAddPlayers: (playerIds: string[]) => void;
  currentParticipantIds: string[];
}

export function AddPlayersToActivity({ 
  activity, 
  players, 
  onAddPlayers, 
  currentParticipantIds 
}: AddPlayersToActivityProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [selectedCup, setSelectedCup] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Filter out players who are already participating and sort alphabetically
  const availablePlayers = players
    .filter(player => !currentParticipantIds.includes(player.id))
    .filter(player => 
      searchQuery 
        ? player.name.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Get selected players data
  const selectedPlayers = players.filter(player => 
    selectedPlayerIds.includes(player.id)
  );
  
  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };
  
  const handleAddPlayers = () => {
    if (selectedPlayerIds.length === 0) {
      toast.error("Välj minst en spelare att lägga till", {
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }
    
    // Log before saving
    console.log(`Lägger till ${selectedPlayerIds.length} spelare till aktivitet ${activity.id}`);
    
    setIsProcessing(true);
    try {
      onAddPlayers(selectedPlayerIds);
      setSelectedPlayerIds([]);
      
      toast.success(`${selectedPlayerIds.length} spelare tillagda`, {
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      console.error("Error adding players to activity:", error);
      toast.error("Kunde inte lägga till spelare. Försök igen.", {
        icon: <AlertCircle className="h-4 w-4" />
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle keyboard search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && availablePlayers.length > 0) {
      e.preventDefault();
      
      // Quick add the first player in the filtered list if there's a search query
      if (searchQuery && availablePlayers.length > 0) {
        const playerId = availablePlayers[0].id;
        setIsProcessing(true);
        try {
          onAddPlayers([playerId]);
          setSearchQuery("");
          toast.success("Spelare tillagd", {
            icon: <Check className="h-4 w-4" />
          });
        } catch (error) {
          console.error("Error quick-adding player:", error);
          toast.error("Kunde inte lägga till spelare", {
            icon: <AlertCircle className="h-4 w-4" />
          });
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };
  
  // If no available players, show a message
  if (availablePlayers.length === 0 && searchQuery === "") {
    return (
      <div className="text-muted-foreground text-sm mt-4">
        Alla spelare är redan tillagda i denna aktivitet.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Sökfält för att hitta spelare */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Sök spelare..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9"
        />
      </div>

      {/* Cup Selector - show for both match and cup types */}
      <CupSelector
        selectedCup={selectedCup}
        onCupSelect={setSelectedCup}
        currentParticipantIds={currentParticipantIds}
        onAddPlayers={onAddPlayers}
      />

      <PlayerMultiSelect
        availablePlayers={availablePlayers}
        selectedPlayerIds={selectedPlayerIds}
        onPlayerToggle={handlePlayerToggle}
        selectedPlayers={selectedPlayers}
        onAddPlayers={handleAddPlayers}
        isProcessing={isProcessing}
      />
      
      <PlayerQuickSelect
        availablePlayers={availablePlayers}
        onQuickSelect={(playerId) => {
          console.log("Quick selecting player:", playerId);
          setIsProcessing(true);
          try {
            onAddPlayers([playerId]);
            toast.success("Spelare tillagd", {
              icon: <Check className="h-4 w-4" />
            });
          } catch (error) {
            console.error("Error quick-adding player:", error);
            toast.error("Kunde inte lägga till spelare", {
              icon: <AlertCircle className="h-4 w-4" />
            });
          } finally {
            setIsProcessing(false);
          }
        }}
      />
    </div>
  );
}
