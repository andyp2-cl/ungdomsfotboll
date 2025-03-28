
import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, UserCircle } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  onEdit?: (player: Player) => void;
}

export function PlayerCard({ player, onClick, onEdit }: PlayerCardProps) {
  // Funktion för att visa färg baserat på spelarens nivå
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500 hover:bg-green-600';
      case 'B':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'C':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'D':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'TRÄNARE':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
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

  // Format positions array to readable string
  const formatPositions = (positions: string[] | undefined) => {
    if (!positions || positions.length === 0) return 'Odefinierad position';
    return positions.map(formatPosition).join(', ');
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(player);
    }
  };

  return (
    <Card 
      className="h-full cursor-pointer hover:shadow-md transition-all relative group" 
      onClick={onClick}
    >
      {onEdit && (
        <Button 
          variant="outline"
          size="icon" 
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm z-10" 
          onClick={handleEditClick}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center">
            {player.name}
            {player.jerseyNumber && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
                #{player.jerseyNumber}
              </span>
            )}
          </div>
          <Badge className={`ml-2 ${getGradeColor(player.grade)}`}>
            {getGradeText(player.grade)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              {formatPositions(player.positions)}
            </p>
            <p className="text-sm text-muted-foreground">
              {player.activities && player.activities.length > 0 
                ? `${player.activities.length} aktiviteter`
                : "Inga aktiviteter"}
            </p>
          </div>
          <div className="flex-shrink-0 ml-2">
            {player.image ? (
              <img 
                src={player.image} 
                alt={player.name} 
                className="h-12 w-12 rounded-full object-cover"
                loading="lazy"
                crossOrigin="anonymous" // Adding this to help with CORS issues
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
