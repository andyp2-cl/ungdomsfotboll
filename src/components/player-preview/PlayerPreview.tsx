
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, Users, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { formatDate } from "@/utils/formatDate";

interface PlayerPreviewProps {
  player: Player;
  activities: Activity[];
  onClose: () => void;
}

export function PlayerPreview({ player, activities, onClose }: PlayerPreviewProps) {
  // Get this player's activities, sort by date (newest first)
  const playerActivities = activities
    .filter(activity => activity.participants?.includes(player.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate player stats
  const stats = calculatePlayerStats(player, playerActivities);
  
  // Get unique leagues the player has participated in
  const leagues = playerActivities
    .filter(activity => activity.leagueId)
    .map(activity => activity.leagueId)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Get initials for avatar fallback
  const getInitials = () => {
    return player.name ? player.name.substring(0, 2).toUpperCase() : "??";
  };

  // Format player name
  const fullName = player.name || "Okänt namn";
  
  // Split activities into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of today
  
  const upcomingActivities = playerActivities.filter(
    activity => new Date(activity.date) >= today
  ).slice(0, 3); // Show just the next 3
  
  const pastActivities = playerActivities.filter(
    activity => new Date(activity.date) < today
  );
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Top section - Player profile */}
        <div className="flex items-center space-x-4 p-4 border-b">
          <Avatar className="h-16 w-16">
            <AvatarImage src={player.image || ""} alt={fullName} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{fullName}</h3>
            <div className="flex items-center space-x-2 mt-1">
              {player.grade && (
                <Badge variant="outline">{player.grade}</Badge>
              )}
              {player.positions && player.positions.map(position => (
                <Badge key={position} variant="secondary">{position}</Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Middle section - Stats and leagues */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="border rounded p-2 text-center">
              <div className="text-2xl font-semibold">{playerActivities.length}</div>
              <div className="text-xs text-muted-foreground">Aktiviteter</div>
            </div>
            <div className="border rounded p-2 text-center">
              <div className="text-2xl font-semibold">{stats.totalGoals || 0}</div>
              <div className="text-xs text-muted-foreground">Mål</div>
            </div>
            <div className="border rounded p-2 text-center">
              <div className="text-2xl font-semibold">{stats.wins || 0}</div>
              <div className="text-xs text-muted-foreground">Vinster</div>
            </div>
          </div>
          
          {/* Leagues section */}
          {leagues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Award className="h-4 w-4 mr-1" />
                Ligor ({leagues.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {leagues.map(leagueId => (
                  <Badge 
                    key={leagueId} 
                    variant="outline" 
                    title={`Liga ID: ${leagueId}`} 
                    className="cursor-help"
                  >
                    Liga
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Upcoming activities section */}
          {upcomingActivities.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Kommande aktiviteter
              </h4>
              <div className="space-y-2">
                {upcomingActivities.map(activity => (
                  <div 
                    key={activity.id} 
                    className="p-2 border rounded-md flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(activity.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom section - Match history (scrollable) */}
        <div className="p-4 pt-0 border-t">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Matchhistorik ({pastActivities.length})
          </h4>
          <ScrollArea className="h-[180px]">
            <div className="space-y-2 pr-4">
              {pastActivities.map(activity => (
                <div 
                  key={activity.id} 
                  className="p-2 border rounded-md flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(activity.date)}
                    </div>
                  </div>
                  {(activity.homeScore !== undefined && activity.awayScore !== undefined) && (
                    <div 
                      className={`font-medium ${
                        activity.isWin === true ? 'text-green-600' : 
                        activity.isWin === false ? 'text-red-600' : 
                        'text-gray-600'
                      }`}
                    >
                      {activity.homeScore}-{activity.awayScore}
                    </div>
                  )}
                </div>
              ))}
              
              {pastActivities.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  Ingen matchhistorik
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
