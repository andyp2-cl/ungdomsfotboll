
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface KioskAssignmentProps {
  activity: Activity;
  players: Player[];
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
}

export function KioskAssignment({ activity, players, onKioskAssignmentUpdate }: KioskAssignmentProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(
    activity.kioskAssignedPlayerId || undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Get the currently assigned player (if any)
  const assignedPlayer = players.find(p => p.id === activity.kioskAssignedPlayerId);

  const handleAssign = async () => {
    setIsLoading(true);
    try {
      const success = await onKioskAssignmentUpdate(activity.id, selectedPlayerId);
      
      if (success) {
        toast({
          title: "Kioskansvar uppdaterat",
          description: selectedPlayerId 
            ? `Kioskansvar tilldelat till spelare` 
            : "Kioskansvar borttaget",
        });
      } else {
        toast({
          title: "Fel",
          description: "Kunde inte uppdatera kioskansvar",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating kiosk assignment:", error);
      toast({
        title: "Fel",
        description: "Ett fel uppstod vid uppdatering av kioskansvar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Kioskansvar</h3>
      
      {assignedPlayer && (
        <div className="mb-2 p-2 bg-green-50 border border-green-100 rounded-md">
          <p className="text-green-800 flex items-center">
            <span className="font-medium">{assignedPlayer.name}</span>
            <span className="ml-1 text-sm">är ansvarig för kiosken</span>
          </p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Select
            value={selectedPlayerId || ""}
            onValueChange={setSelectedPlayerId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Välj spelare för kioskansvar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Ingen spelare vald</SelectItem>
              {players
                .filter(player => !player.positions?.includes("TRÄNARE"))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleAssign}
          disabled={isLoading || selectedPlayerId === activity.kioskAssignedPlayerId}
        >
          {isLoading ? "Uppdaterar..." : "Uppdatera kioskansvar"}
        </Button>
      </div>
    </div>
  );
}
