
import React from "react";
import { Player, Activity } from "@/types/player";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, User, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { formatDate } from "@/components/player-match-history/utils/date-formatter";

interface PlayerPreviewProps {
  player: Player | null;
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
  onActivitySelect?: (activity: Activity) => void;
}

export function PlayerPreview({
  player,
  activities,
  isOpen,
  onClose,
  onActivitySelect
}: PlayerPreviewProps) {
  if (!player) return null;

  // Filter activities this player has participated in
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  ).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get player statistics
  const stats = getPlayerStats(player.id, activities);
  
  // Player name handling based on available properties
  const playerName = player.name || player.id;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">{playerName}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {/* Player Image and Basic Info */}
          <div className="col-span-1 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-2">
              {player.image ? (
                <AvatarImage src={player.image} alt={playerName} />
              ) : (
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg">{playerName}</h3>
              {player.grade && (
                <div className="mt-1 text-muted-foreground">
                  Årskurs: <span className="font-medium">{player.grade}</span>
                </div>
              )}
              {player.positions && player.positions.length > 0 && (
                <div className="mt-1 text-muted-foreground">
                  Position: <span className="font-medium">{player.positions.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Player Statistics */}
          <div className="col-span-2">
            <Card>
              <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <div className="text-sm text-muted-foreground">Matcher</div>
                  <div className="text-lg font-bold">{stats.matches || 0}</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <div className="text-sm text-muted-foreground">Mål</div>
                  <div className="text-lg font-bold">{stats.goals || 0}</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <div className="text-sm text-muted-foreground">Vinster</div>
                  <div className="text-lg font-bold">{stats.wins || 0}</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <div className="text-sm text-muted-foreground">Förluster</div>
                  <div className="text-lg font-bold">{stats.losses || 0}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Senaste aktiviteter</h3>
          {playerActivities.length === 0 ? (
            <p className="text-muted-foreground text-sm">Inga aktiviteter hittades</p>
          ) : (
            <div className="space-y-2">
              {playerActivities.slice(0, 5).map((activity) => (
                <Card 
                  key={activity.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onActivitySelect && onActivitySelect(activity)}
                >
                  <CardContent className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {formatDate(activity.date)}
                        {activity.time && ` ${activity.time}`}
                      </div>
                    </div>
                    {activity.result && (
                      <div className="bg-primary/10 px-2 py-1 rounded text-primary font-medium">
                        {activity.result}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
