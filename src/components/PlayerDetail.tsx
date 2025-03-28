
import { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityList } from "./ActivityList";
import { EditPlayerForm } from "./EditPlayerForm";
import { Edit, X, UserCircle } from "lucide-react";

interface PlayerDetailProps {
  player: Player;
  activities: Activity[];
  onClose: () => void;
  onPlayerUpdate?: (updatedPlayer: Player) => void;
}

export function PlayerDetail({ player, activities, onClose, onPlayerUpdate }: PlayerDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(player);
  
  // Filtrera aktiviteter som spelaren deltar i
  const playerActivities = activities.filter(
    (activity) => currentPlayer.activities?.includes(activity.id)
  );

  // Funktion för att visa färg baserat på spelarens nivå
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500';
      case 'B':
        return 'bg-blue-500';
      case 'C':
        return 'bg-orange-500';
      case 'D':
        return 'bg-purple-500';
      case 'TRÄNARE':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Funktion för att visa nivåtexten
  const getGradeText = (grade: string) => {
    if (grade === 'TRÄNARE') return 'Tränare';
    return `Nivå ${grade}`;
  };

  // Konvertera positionerna till läsbara format
  const formatPosition = (position: string) => {
    if (position === 'TRÄNARE') return 'Tränare';
    
    let formattedPosition = position
      .replace('MV', 'Målvakt')
      .replace('BACK', 'Back')
      .replace('MF', 'Mittfält')
      .replace('ANF', 'Anfall');
    
    return formattedPosition;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedPlayer: Player) => {
    setCurrentPlayer(updatedPlayer);
    setIsEditing(false);
    if (onPlayerUpdate) {
      onPlayerUpdate(updatedPlayer);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      {isEditing ? (
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">Redigera spelare</h2>
          <EditPlayerForm 
            player={currentPlayer} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        </CardContent>
      ) : (
        <>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="flex-shrink-0">
                  {currentPlayer.image ? (
                    <img 
                      src={currentPlayer.image} 
                      alt={currentPlayer.name} 
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircle className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl mb-1 flex items-center">
                    {currentPlayer.name}
                    {currentPlayer.jerseyNumber && (
                      <span className="ml-2 text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                        #{currentPlayer.jerseyNumber}
                      </span>
                    )}
                    <Badge className={`ml-3 ${getGradeColor(currentPlayer.grade)}`}>
                      {getGradeText(currentPlayer.grade)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {currentPlayer.position ? `Position: ${formatPosition(currentPlayer.position)}` : "Ingen position definierad"}
                  </CardDescription>
                  <CardDescription className="mt-1">
                    {playerActivities.length > 0 
                      ? `Deltar i ${playerActivities.length} aktiviteter`
                      : "Deltar inte i några aktiviteter"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleEditClick}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Aktiviteter</h3>
            <ActivityList activities={playerActivities} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Stäng</Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
