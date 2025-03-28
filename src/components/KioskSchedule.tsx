
import { KioskSchedule as KioskScheduleType, KioskSlot, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, UserPlus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AssignKioskPopover } from "./AssignKioskPopover";
import { useState } from "react";

interface KioskScheduleProps {
  schedule: KioskScheduleType;
  players: Player[];
  onAssignPlayer?: (slotId: string, playerId: string) => void;
}

export function KioskSchedule({ schedule, players, onAssignPlayer }: KioskScheduleProps) {
  // Function to find player name based on ID
  const getPlayerName = (playerId?: string) => {
    if (!playerId) return "Ej tilldelad";
    const player = players.find(p => p.id === playerId);
    return player ? player.name : "Okänd spelare";
  };
  
  // Count how many slots are assigned
  const assignedCount = schedule.slots.filter(slot => slot.assignedPlayerId).length;
  const totalSlots = schedule.slots.length;

  if (!schedule || !schedule.slots || schedule.slots.length === 0) {
    return <p className="text-muted-foreground text-center p-4">Inget kioskschema tillgängligt</p>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          Kioskschema
          <Badge variant={assignedCount === totalSlots ? "default" : "outline"}>
            {assignedCount}/{totalSlots} tilldelade
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule.slots.map((slot) => (
            <div 
              key={slot.id} 
              className={`border rounded-md p-3 flex justify-between items-center ${slot.assignedPlayerId ? 'bg-muted/50' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{slot.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={slot.assignedPlayerId ? "default" : "outline"}>
                  {getPlayerName(slot.assignedPlayerId)}
                </Badge>
                {onAssignPlayer && (
                  <AssignKioskPopover 
                    players={players} 
                    slotId={slot.id}
                    onAssignPlayer={onAssignPlayer}
                    currentAssignedId={slot.assignedPlayerId}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
