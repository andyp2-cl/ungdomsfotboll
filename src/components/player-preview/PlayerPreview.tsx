
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlayerPreviewProps {
  player: Player;
  activities?: Activity[];
  onClose: () => void;
}

interface DevelopmentNote {
  date: string;
  note: string;
}

export function PlayerPreview({ player, activities = [], onClose }: PlayerPreviewProps) {
  const isMobile = useIsMobile();
  
  // Filter activities this player has participated in
  const playerActivities = activities.filter(
    activity => activity.participants?.includes(player.id)
  );
  
  // Check if development exists and is an array
  const developmentNotes: DevelopmentNote[] = Array.isArray(player.development) 
    ? player.development 
    : [];
  
  return (
    <Card className={`relative ${isMobile ? 'fixed inset-x-0 bottom-0 top-16 z-50 rounded-b-none' : 'w-full mb-6'}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="absolute top-2 right-2 z-10"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardHeader className={`${isMobile ? 'py-3 px-4' : ''} pb-0 flex flex-row items-center gap-3`}>
        <Avatar className="h-16 w-16 border shadow">
          <AvatarImage src={player.image} alt={player.name} />
          <AvatarFallback className="bg-muted">
            <UserCircle className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h2 className="text-xl font-bold">{player.name}</h2>
          <div className="flex flex-wrap gap-2 mt-1">
            {player.grade && (
              <Badge variant="outline">{player.grade}</Badge>
            )}
            {player.positions?.map(position => (
              <Badge key={position} variant="secondary">{position}</Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <ScrollArea className={isMobile ? 'h-[calc(100%-70px)]' : ''}>
        <CardContent className={`${isMobile ? 'px-4 py-3' : ''}`}>
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Spelarinformation</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Deltagit i</dt>
                  <dd className="font-medium">{playerActivities.length} aktiviteter</dd>
                </div>
                {player.jerseyNumber && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tröjnummer</dt>
                    <dd className="font-medium">#{player.jerseyNumber}</dd>
                  </div>
                )}
                {player.grade && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Nivå</dt>
                    <dd className="font-medium">{player.grade}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            {playerActivities.length > 0 && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Senaste aktiviteter</h3>
                <div className="space-y-2">
                  {playerActivities.slice(0, 5).map(activity => (
                    <div key={activity.id} className="p-2 bg-muted/50 rounded-md">
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString('sv-SE')}
                        {activity.time && `, ${activity.time}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {developmentNotes.length > 0 && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Utveckling</h3>
                <div className="space-y-2">
                  {developmentNotes.map((dev, index) => (
                    <div key={index} className="p-2 border-l-2 border-primary">
                      <p className="text-sm text-muted-foreground">
                        {new Date(dev.date).toLocaleDateString('sv-SE')}
                      </p>
                      <p>{dev.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
