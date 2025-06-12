import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface PlayerMultiSelectProps {
  availablePlayers: Player[];
  selectedPlayerIds: string[];
  onPlayerToggle: (playerId: string) => void;
  selectedPlayers: Player[];
  onAddPlayers: () => void;
  isProcessing?: boolean;
}

export function PlayerMultiSelect({
  availablePlayers,
  selectedPlayerIds,
  onPlayerToggle,
  selectedPlayers,
  onAddPlayers,
  isProcessing = false
}: PlayerMultiSelectProps) {
  // Sort and enrich players
  const gradeOrder = ['A', 'B', 'C', 'D'];
  const players = availablePlayers
    .map(player => {
      let reason = '';
      let disabled = false;
      if (player.isActive === false) {
        reason = 'Inaktiv';
        disabled = true;
      } else if (player.thisWeekCount >= 2) {
        reason = '2 matcher denna vecka';
        disabled = true;
      } else if (player.hasSameDayMatch) {
        reason = 'Match samma dag';
        disabled = true;
      }
      return {
        ...player,
        reason,
        disabled
      };
    })
    .sort((a, b) => {
      const gradeA = gradeOrder.indexOf(a.grade);
      const gradeB = gradeOrder.indexOf(b.grade);
      if (gradeA !== gradeB) return gradeA - gradeB;
      return (b.trainingRatio || 0) - (a.trainingRatio || 0);
    });

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Välj spelare att lägga till</h4>
      <div className="border rounded-md p-2 h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Namn</TableHead>
              <TableHead>Nivå</TableHead>
              <TableHead>Aktiviteter</TableHead>
              <TableHead>Träningsratio</TableHead>
              <TableHead>Denna vecka</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedPlayerIds.includes(player.id)}
                    onChange={() => onPlayerToggle(player.id)}
                    disabled={player.disabled}
                  />
                </TableCell>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{player.grade}</TableCell>
                <TableCell>{player.activitiesCount}</TableCell>
                <TableCell>{typeof player.trainingRatio === 'number' ? player.trainingRatio.toFixed(2) : '-'}</TableCell>
                <TableCell>{player.thisWeekCount}</TableCell>
                <TableCell>
                  {player.disabled && (
                    <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs" title={player.reason}>{player.reason}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <button 
        onClick={onAddPlayers} 
        disabled={selectedPlayerIds.length === 0 || isProcessing}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        Lägg till {selectedPlayerIds.length} spelare
      </button>
    </div>
  );
}
