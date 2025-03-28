
import { Player } from "@/types/player";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PlayerListProps {
  players: Player[];
  onSelect: (player: Player) => void;
}

export function PlayerList({ players, onSelect }: PlayerListProps) {
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

  if (players.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Inga spelare hittades</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Namn</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Nivå</TableHead>
          <TableHead>Aktiviteter</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow 
            key={player.id} 
            onClick={() => onSelect(player)}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell className="font-medium">{player.name}</TableCell>
            <TableCell>{player.position ? formatPosition(player.position) : 'Odefinierad'}</TableCell>
            <TableCell>
              <Badge className={getGradeColor(player.grade)}>
                {getGradeText(player.grade)}
              </Badge>
            </TableCell>
            <TableCell>
              {player.activities && player.activities.length > 0 
                ? `${player.activities.length} aktiviteter`
                : "Inga aktiviteter"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
