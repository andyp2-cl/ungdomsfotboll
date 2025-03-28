
import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
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

  return (
    <Card 
      className="h-full cursor-pointer hover:shadow-md transition-all" 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          {player.name}
          <Badge className={`ml-2 ${getGradeColor(player.grade)}`}>
            {getGradeText(player.grade)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-2">
          {player.position ? formatPosition(player.position) : 'Odefinierad position'}
        </p>
        <p className="text-sm text-muted-foreground">
          {player.activities && player.activities.length > 0 
            ? `${player.activities.length} aktiviteter`
            : "Inga aktiviteter"}
        </p>
      </CardContent>
    </Card>
  );
}
