
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayerStatisticsCard } from "./PlayerStatisticsCard";
import { PlayerDevelopmentCard } from "./PlayerDevelopmentCard";
import { RecentMatchesCard } from "./RecentMatchesCard";

interface PlayerPreviewProps {
  player: Player;
  activities?: Activity[];
  onClose: () => void;
}

export function PlayerPreview({ player, activities = [], onClose }: PlayerPreviewProps) {
  const isMobile = useIsMobile();
  
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
      
      <CardHeader className={`${isMobile ? 'py-3 px-4' : ''} pb-0`}>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 shadow-lg">
            <AvatarImage src={player.image} alt={player.name} />
            <AvatarFallback className="bg-muted">
              <UserCircle className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{player.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {player.grade && (
                <Badge variant="outline" className="bg-primary/10 text-primary">{player.grade}</Badge>
              )}
              {player.positions?.map(position => (
                <Badge key={position} variant="secondary">{position}</Badge>
              ))}
              {player.jerseyNumber && (
                <Badge variant="outline">#{player.jerseyNumber}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <ScrollArea className={isMobile ? 'h-[calc(100%-150px)]' : 'max-h-[70vh]'}>
        <CardContent className={`${isMobile ? 'px-4 py-3' : 'p-6'}`}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Statistics Card */}
            <div className="md:col-span-1">
              <PlayerStatisticsCard player={player} activities={activities} />
            </div>
            
            {/* Development Card */}
            <div className="md:col-span-1">
              <PlayerDevelopmentCard player={player} />
            </div>
            
            {/* Recent Matches Card - Full width */}
            <div className="md:col-span-2">
              <RecentMatchesCard player={player} activities={activities} />
            </div>
          </div>
        </CardContent>
      </ScrollArea>
      
      <CardFooter className={`${isMobile ? 'px-4 py-3 mt-auto border-t' : 'p-6 pt-0'}`}>
        <Button 
          variant="outline" 
          onClick={onClose}
          className="w-full"
        >
          Stäng
        </Button>
      </CardFooter>
    </Card>
  );
}
