
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityList } from "./ActivityList";
import { X } from "lucide-react";

interface PlayerDetailProps {
  player: Player;
  activities: Activity[];
  onClose: () => void;
}

export function PlayerDetail({ player, activities, onClose }: PlayerDetailProps) {
  // Filtrera aktiviteter som spelaren deltar i
  const playerActivities = activities.filter(
    (activity) => player.activities?.includes(activity.id)
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
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-1 flex items-center">
              {player.name}
              <Badge className={`ml-3 ${getGradeColor(player.grade)}`}>
                Nivå {player.grade}
              </Badge>
            </CardTitle>
            <CardDescription>
              {player.position ? `Position: ${player.position}` : "Ingen position definierad"}
            </CardDescription>
            <CardDescription className="mt-1">
              {playerActivities.length > 0 
                ? `Deltar i ${playerActivities.length} aktiviteter`
                : "Deltar inte i några aktiviteter"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">Aktiviteter</h3>
        <ActivityList activities={playerActivities} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Stäng</Button>
      </CardFooter>
    </Card>
  );
}
