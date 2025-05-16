
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
import { X, User, CalendarDays, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { formatDate } from "@/components/player-match-history/utils/date-formatter";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  if (!player) return null;

  // Filter activities this player has participated in
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  ).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get player statistics
  const stats = calculatePlayerStats(player, playerActivities);
  
  // Player name handling based on available properties
  const playerName = player.name || player.id;

  // Navigate to player detail page
  const handleViewPlayerDetail = () => {
    navigate('/players', { 
      state: { 
        selectedPlayerId: player.id,
        returnToActivity: true
      }
    });
    onClose();
  };

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

            <Button 
              variant="outline"
              className="mt-4 w-full flex items-center justify-center"
              onClick={handleViewPlayerDetail}
            >
              Visa spelarprofil <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Player Statistics */}
          <div className="col-span-2">
            <Card>
              <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <div className="text-sm text-muted-foreground">Matcher</div>
                  <div className="text-lg font-bold">{stats.matches}</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <div className="text-sm text-muted-foreground">Mål</div>
                  <div className="text-lg font-bold">{stats.totalGoals}</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <div className="text-sm text-muted-foreground">Vinster</div>
                  <div className="text-lg font-bold">{stats.wins}</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <div className="text-sm text-muted-foreground">Förluster</div>
                  <div className="text-lg font-bold">{stats.losses}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="mt-4 max-h-[350px] overflow-y-auto pr-1">
          <h3 className="font-semibold mb-2">Alla aktiviteter</h3>
          {playerActivities.length === 0 ? (
            <p className="text-muted-foreground text-sm">Inga aktiviteter hittades</p>
          ) : (
            <div className="space-y-2">
              {playerActivities.map((activity) => {
                // Determine result color
                let resultTextColor = "";
                if (activity.isWin === true) {
                  resultTextColor = "text-green-600";
                } else if (activity.isWin === false) {
                  resultTextColor = "text-red-600";
                } else if (activity.homeScore === activity.awayScore && 
                         activity.homeScore !== undefined && 
                         activity.awayScore !== undefined) {
                  resultTextColor = "text-gray-600";
                }
                
                return (
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
                      {(activity.result || (activity.homeScore !== undefined && activity.awayScore !== undefined)) && (
                        <div className={`px-2 py-1 rounded font-medium ${resultTextColor}`}>
                          {activity.result ? activity.result : `${activity.homeScore}-${activity.awayScore}`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
