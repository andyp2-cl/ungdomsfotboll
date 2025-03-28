
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";

interface ActivityListProps {
  activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
