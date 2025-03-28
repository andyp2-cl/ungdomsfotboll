
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
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
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
            Nivå {player.grade}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-2">
          {player.position || 'Odefinierad position'}
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
