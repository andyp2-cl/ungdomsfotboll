
import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerHeader } from "@/components/PlayerHeader";
import { PlayerMatchHistory } from "@/components/player-match-history";
import { X, Edit, User, Calendar, Shirt, Target } from "lucide-react";
import { EditPlayerDialog } from "./dialogs/EditPlayerDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
  
  // Find activities this player is participating in
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  );
  
  // Count matches specifically
  const playerMatches = playerActivities.filter(activity => 
    activity.type === "match"
  );

  const handleActivitySelect = (activity: Activity) => {
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handlePlayerUpdate = (updatedPlayer: Player) => {
    onPlayerUpdate(updatedPlayer);
  };

  // Get position color
  const getPositionColor = (position: string) => {
    switch(position) {
      case "MV": return "bg-blue-100 text-blue-800 border-blue-200";
      case "BACK": return "bg-green-100 text-green-800 border-green-200";
      case "MF": return "bg-amber-100 text-amber-800 border-amber-200";
      case "ANF": return "bg-red-100 text-red-800 border-red-200";
      case "TRÄNARE": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="mb-6 relative overflow-visible shadow-md border-t-4 border-t-primary">
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleEditClick}
          title="Redigera spelare"
          className="hover:bg-gray-100"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <CardHeader className="pb-0">
        <div className="flex items-start">
          <div className="mr-4 flex-shrink-0">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className="text-lg bg-primary/10">
                  {getInitials(player.name)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">{player.name}</CardTitle>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {player.positions?.map((position) => (
                <Badge 
                  key={position} 
                  variant="outline" 
                  className={`${getPositionColor(position)} font-medium`}
                >
                  {position}
                </Badge>
              ))}
            </div>
            
            {player.grade && !player.positions?.includes("TRÄNARE") && (
              <Badge className="mt-2 bg-primary/20 text-primary-foreground hover:bg-primary/30 border border-primary/30">
                Nivå {player.grade}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Basic player information cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center text-primary mb-2">
                <User className="h-4 w-4 mr-2" />
                <h3 className="font-semibold">Grundinformation</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Namn:</span>
                  <span className="font-medium">{player.name}</span>
                </div>
                {!player.positions?.includes("TRÄNARE") && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivå:</span>
                    <span className="font-medium">{player.grade}</span>
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
          
          <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center text-primary mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <h3 className="font-semibold">Matcher & Aktiviteter</h3>
              </div>
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
          
          <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center text-primary mb-2">
                <Target className="h-4 w-4 mr-2" />
                <h3 className="font-semibold">Position</h3>
              </div>
              <div className="space-y-2">
                {player.positions && player.positions.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {player.positions.map(position => (
                      <div key={position} className={`px-3 py-1.5 rounded-md text-center ${getPositionColor(position)}`}>
                        {position}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center italic">Ingen position registrerad</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Player match history component */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Matchhistorik</h3>
          <PlayerMatchHistory 
            player={player} 
            activities={activities}
            onActivitySelect={handleActivitySelect}
          />
        </div>
      </CardContent>
      
      {/* Edit player dialog */}
      <EditPlayerDialog 
        player={player}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onPlayerUpdate={handlePlayerUpdate}
      />
    </Card>
  );
}
