
import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerHeader } from "@/components/PlayerHeader";
import { PlayerMatchHistory } from "@/components/player-match-history";
import { X, Edit } from "lucide-react";
import { EditPlayerDialog } from "./dialogs/EditPlayerDialog";
import { LeaguesStatsCard } from "./player-detail/LeaguesStatsCard";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  );
  
  const playerMatches = playerActivities.filter(activity => 
    activity.type === "match"
  );

  const isCoach = player.positions?.includes('TRÄNARE');

  const handleActivitySelect = (activity: Activity) => {
    console.log("PlayerDetail: Activity selected:", activity.id, activity.name);
    if (onActivitySelect) {
      onActivitySelect(activity);
    } else {
      console.warn("onActivitySelect is not provided to PlayerDetail");
    }
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handlePlayerUpdate = (updatedPlayer: Player) => {
    onPlayerUpdate(updatedPlayer);
  };

  const handleClose = () => {
    console.log("PlayerDetail: Close button clicked - calling onClose()");
    onClose();
  };

  return (
    <Card className="mb-6 relative">
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleEditClick}
          title="Redigera spelare"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <CardHeader className="pb-0">
        <PlayerHeader 
          player={player}
          onPlayerUpdate={onPlayerUpdate}
          onBulkUpdate={onBulkUpdate}
          allPlayers={allPlayers}
        />
      </CardHeader>
      
      <CardContent>
        {player.image && (
          <div className="flex justify-center mb-4">
            <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-primary/20">
              <img 
                src={player.image} 
                alt={player.name} 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
        
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
                {!isCoach && player.grade && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivå:</span>
                    <span className="font-medium">{player.grade}</span>
                  </div>
                )}
                {player.positions && player.positions.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">
                      {isCoach ? "Tränare" : player.positions.filter(p => p !== 'TRÄNARE').join(", ")}
                    </span>
                  </div>
                )}
                {player.jerseyNumber && !isCoach && (
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
              <CardTitle className="text-base">Matcher & Aktiviteter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Totalt aktiviteter:</span>
                  <span className="font-medium">{playerActivities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Matcher:</span>
                  <span className="font-medium">
                    {playerMatches.length}
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
          
          <LeaguesStatsCard 
            player={player}
            activities={activities}
          />
        </div>
        
        <PlayerMatchHistory 
          player={player} 
          activities={activities}
          onActivitySelect={handleActivitySelect}
        />
      </CardContent>
      
      <EditPlayerDialog 
        player={player}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onPlayerUpdate={handlePlayerUpdate}
      />
    </Card>
  );
}
