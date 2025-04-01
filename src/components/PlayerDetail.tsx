
import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerHeader } from "@/components/PlayerHeader";
import { PlayerMatchHistory } from "@/components/player-match-history";
import { X } from "lucide-react";

interface PlayerDetailProps {
  player: Player;
  activities: Activity[];
  onClose: () => void;
  onEdit: (player: Player) => void;
  onPlayerUpdate: (player: Player) => void;
  onBulkUpdate?: (player: Player) => void;
  allPlayers?: Player[];
  onActivitySelect?: (activity: Activity) => void;
}

export function PlayerDetail({
  player,
  activities,
  onClose,
  onEdit,
  onPlayerUpdate,
  onBulkUpdate,
  allPlayers,
  onActivitySelect
}: PlayerDetailProps) {
  // Find activities this player is participating in
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  );

  const handleActivitySelect = (activity: Activity) => {
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  };

  return (
    <Card className="mb-6 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 z-10" 
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardHeader className="pb-0">
        <PlayerHeader 
          player={player} 
          onEdit={() => onEdit(player)}
          onPlayerUpdate={onPlayerUpdate}
          onBulkUpdate={onBulkUpdate}
          allPlayers={allPlayers}
        />
      </CardHeader>
      
      <CardContent>
        {/* Basic player information cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Grundinformation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Namn:</span>
                  <span className="font-medium">{player.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Årskull:</span>
                  <span className="font-medium">{player.grade}</span>
                </div>
                {player.positions && player.positions.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">{player.positions.join(", ")}</span>
                  </div>
                )}
                {player.jerseyNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tröjnummer:</span>
                    <span className="font-medium">{player.jerseyNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Aktiviteter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Totalt:</span>
                  <span className="font-medium">{playerActivities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Matcher:</span>
                  <span className="font-medium">
                    {playerActivities.filter(a => a.type === "match").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cuper:</span>
                  <span className="font-medium">
                    {playerActivities.filter(a => a.type === "cup").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Player match history component */}
        <PlayerMatchHistory 
          player={player} 
          activities={activities}
          onActivitySelect={handleActivitySelect}
        />
      </CardContent>
    </Card>
  );
}
