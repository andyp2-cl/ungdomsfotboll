
import { Player } from "@/types/player";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";
import { GradePieChart } from "@/components/activity-detail/match-result/GradePieChart";
import { formatPositions, isTrainer } from "@/utils/positionUtils";

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

  const isCoach = isTrainer(player.positions);

  // Handle click to navigate to player view
  const handleCardClick = () => {
    console.log("PlayerCard: Card clicked for player:", player.name);
    onClick();
  };

  return (
    <Card 
      className={`overflow-hidden cursor-pointer hover:border-primary transition-colors ${isCoach ? 'border-amber-300' : ''}`}
      onClick={handleCardClick}
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
            <UserCircle className="h-30 w-30 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isCoach ? (
            <Badge className="bg-amber-500 hover:bg-amber-600">
              Tränare
            </Badge>
          ) : (
            <Badge className={getGradeColor(player.grade || '')}>
              Nivå {player.grade}
            </Badge>
          )}
          
          {/* Add position badges with international abbreviations */}
          {!isCoach && player.positions && player.positions.length > 0 && (
            <Badge variant="outline" className="bg-white/80">
              {formatPositions(player.positions, true)}
            </Badge>
          )}
        </div>

        {/* Add pie chart in bottom left corner - only for non-coaches */}
        {!isCoach && player.grade && (
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-white/90 rounded-full p-1">
            <GradePieChart 
              activity={{
                id: `player-card-${player.id}`,
                name: 'Player Grade Distribution',
                type: 'match' as const,
                date: new Date().toISOString(),
                participants: [player.id]
              }} 
              participatingPlayers={[player]} 
              compact={true}
            />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">
          {player.name}
          {player.jerseyNumber && !isCoach && (
            <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
              #{player.jerseyNumber}
            </span>
          )}
        </h3>
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
