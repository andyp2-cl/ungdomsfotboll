
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityListProps {
  activities: Activity[];
  onSelect?: (activity: Activity) => void;
}

export function ActivityList({ activities, onSelect }: ActivityListProps) {
  if (!activities.length) {
    return <p className="text-muted-foreground text-center p-4">Inga aktiviteter hittades</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              {activity.name}
              <Badge 
                variant={activity.type === "match" ? "default" : "secondary"}
                className="ml-2"
              >
                {activity.type === "match" ? "Match" : "Cup"}
              </Badge>
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {new Date(activity.date).toLocaleDateString('sv-SE')}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {activity.participants && activity.participants.length > 0 
                ? `${activity.participants.length} deltagare`
                : "Inga deltagare"}
            </p>
            {activity.kioskScheduleId && (
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Har kioskschema</span>
              </div>
            )}
          </CardContent>
          {onSelect && (
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSelect(activity)}
                className="w-full"
              >
                Visa detaljer
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
