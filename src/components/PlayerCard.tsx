
import { Player } from "@/types/player";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, UserCircle } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
  onEdit?: (player: Player) => void;
}

export function PlayerCard({ player, onClick, onEdit }: PlayerCardProps) {
  // Get real activity count that excludes kiosk duty assignments
  const getActivityCount = () => {
    if (!player.activities || player.activities.length === 0) return 0;
    return player.activities.length;
  };

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
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatPosition = (position: string) => {
    if (position === 'TRÄNARE') return 'Tränare';
    
    let formattedPosition = position
      .replace('MV', 'Målvakt')
      .replace('BACK', 'Back')
      .replace('MF', 'Mittfält')
      .replace('ANF', 'Anfall');
    
    return formattedPosition;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(player);
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <div className="aspect-[4/3] bg-muted relative">
        {player.image ? (
          <img 
            src={player.image} 
            alt={player.name} 
            className="w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous" // Adding this to help with CORS issues
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <UserCircle className="h-20 w-20 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <Badge className={getGradeColor(player.grade)}>
            Nivå {player.grade}
          </Badge>
        </div>
        
        {onEdit && (
          <div className="absolute bottom-2 right-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">
          {player.name}
          {player.jerseyNumber && (
            <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
              #{player.jerseyNumber}
            </span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground">
          {player.positions && player.positions.length > 0
            ? player.positions.map(formatPosition).join(', ')
            : 'Ingen position definierad'}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <span className="text-xs text-muted-foreground">
          {getActivityCount() === 0
            ? "Inga aktiviteter"
            : `${getActivityCount()} aktiviteter`}
        </span>
      </CardFooter>
    </Card>
  );
}
