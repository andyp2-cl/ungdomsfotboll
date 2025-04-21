
import { Player } from "@/types/player";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
  onEdit?: (player: Player) => void;
}

export function PlayerCard({ player, onClick, onEdit }: PlayerCardProps) {
  // Get real activity count that excludes kiosk duty assignments
  const getActivityCount = () => {
    if (!player.activities) return 0;
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

  const isCoach = player.position?.includes('TRÄNARE');

  return (
    <Card 
      className={`overflow-hidden cursor-pointer hover:border-primary transition-colors ${isCoach ? 'border-amber-300' : ''}`}
      onClick={onClick}
    >
      <div className="aspect-[4/3] bg-muted relative">
        {player.image ? (
          <img 
            src={player.image} 
            alt={player.name} 
            className="w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <UserCircle className="h-20 w-20 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          {isCoach ? (
            <Badge className="bg-amber-500 hover:bg-amber-600">
              Tränare
            </Badge>
          ) : (
            <Badge className={getGradeColor(player.grade)}>
              Nivå {player.grade}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">
          {player.name}
          {player.jersey_number && !isCoach && (
            <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
              #{player.jersey_number}
            </span>
          )}
        </h3>
        {!isCoach && (
          <p className="text-sm text-muted-foreground">
            {player.position && player.position.length > 0
              ? player.position
                  .filter(pos => pos !== 'TRÄNARE')
                  .map(formatPosition)
                  .join(', ')
              : 'Ingen position definierad'}
          </p>
        )}
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
