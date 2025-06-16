import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { PlayerCard } from "@/components/player-ui/PlayerCard";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface PlayerGridViewProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  activities?: Activity[];
  onSortChange?: (sortField: string) => void;
  sortField?: string;
}

export function PlayerGridView({ 
  players, 
  onPlayerSelect, 
  onPlayerEdit,
  activities = [],
  onSortChange,
  sortField = "activities"
}: PlayerGridViewProps) {
  const sortOptions = [
    { label: "Aktiviteter", value: "activities" },
    { label: "Vinst%", value: "winrate" },
    { label: "Mål/Match", value: "goalsPerGame" },
    { label: "Utveckling", value: "development" },
    { label: "Form", value: "form" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onSelect={() => onPlayerSelect(player)}
          activities={activities}
          action={
            onPlayerEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayerEdit(player);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )
          }
        />
      ))}
    </div>
  );
}
