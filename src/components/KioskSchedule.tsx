
import { KioskSchedule as KioskScheduleType, KioskSlot, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KioskScheduleProps {
  schedule: KioskScheduleType;
  players: Player[];
}

export function KioskSchedule({ schedule, players }: KioskScheduleProps) {
  // Funktion för att hitta spelarnamn baserat på ID
  const getPlayerName = (playerId?: string) => {
    if (!playerId) return "Ej tilldelad";
    const player = players.find(p => p.id === playerId);
    return player ? player.name : "Okänd spelare";
  };

  if (!schedule || !schedule.slots || schedule.slots.length === 0) {
    return <p className="text-muted-foreground text-center p-4">Inget kioskschema tillgängligt</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Kioskschema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule.slots.map((slot) => (
            <div key={slot.id} className="border rounded-md p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{slot.time}</span>
              </div>
              <Badge variant={slot.assignedPlayerId ? "default" : "outline"}>
                {getPlayerName(slot.assignedPlayerId)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
