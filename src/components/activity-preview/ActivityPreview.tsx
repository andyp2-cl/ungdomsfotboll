
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Calendar, MapPin, Users } from "lucide-react";
import { GradePieChart } from "@/components/activity-detail/match-result/GradePieChart";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayerAvatar } from "@/components/player-selection/PlayerAvatar";

interface ActivityPreviewProps {
  activity: Activity;
  participatingPlayers: Player[];
  onClose: () => void;
  onViewFullActivity?: () => void;
}

export function ActivityPreview({
  activity,
  participatingPlayers,
  onClose,
  onViewFullActivity
}: ActivityPreviewProps) {
  return (
    <Card className="w-full max-w-md mx-auto relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{activity.name}</CardTitle>
          {activity.type && (
            <Badge variant="outline" className="ml-2">
              {activity.type === 'match' ? 'Match' : 
               activity.type === 'cup' ? 'Cup' : 
               activity.type === 'training' ? 'Träning' : 
               activity.type}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <span>{formatDate(activity.date)}</span>
            {activity.time && (
              <span className="ml-1 text-muted-foreground">{activity.time}</span>
            )}
          </div>
          
          {activity.location_name && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
              <span>{activity.location_name}</span>
            </div>
          )}
        </div>
        
        {activity.type === 'match' && (
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">Matchresultat</span>
              {activity.homeScore !== undefined && activity.awayScore !== undefined ? (
                <Badge className={
                  activity.isWin ? "bg-green-100 text-green-800" : 
                  activity.isWin === false ? "bg-red-100 text-red-800" : 
                  "bg-blue-100 text-blue-800"
                }>
                  {activity.homeScore} - {activity.awayScore}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-xs">Inget resultat</span>
              )}
            </div>
          </div>
        )}
        
        <div className="border-t pt-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
              <span className="font-medium text-sm">Deltagare ({participatingPlayers.length})</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <GradePieChart 
              activity={activity}
              participatingPlayers={participatingPlayers}
              compact={true}
            />
            
            <ScrollArea className="h-[80px]">
              <div className="flex flex-wrap gap-2 pt-1">
                {participatingPlayers.map((player) => (
                  <div key={player.id} className="flex flex-col items-center gap-0.5">
                    <PlayerAvatar player={player} size="sm" />
                    <span className="text-xs">{player.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {onViewFullActivity && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={onViewFullActivity}
          >
            Visa full aktivitet
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
