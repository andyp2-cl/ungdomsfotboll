import { useState, useEffect, useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { CalendarIcon, X, Users, MapPin, Clock, Edit, UserPlus, Coffee, Trash2, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddPlayersToActivity } from "./AddPlayersToActivity";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { UserCircle, Check } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ActivityResultSection } from "./activity-detail/match-result";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from 'uuid';
import { QuickMatchResult } from "./activity-detail/QuickMatchResult";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onEdit?: (activity: Activity) => void;
  onActivityUpdate?: (updatedActivity: Activity) => void;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => void;
  onActivitySelect?: (activity: Activity | null) => void;
  onDeleteActivity?: (activityId: string) => void;
  allActivities?: Activity[];
  cupMatches?: Activity[];
  onPlayerSelect?: (playerId: string) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivityDetail({ 
  activity, 
  players, 
  onClose, 
  onEdit, 
  onActivityUpdate,
  onKioskAssignmentUpdate,
  onActivitySelect,
  onDeleteActivity,
  allActivities,
  cupMatches = [],
  onPlayerSelect,
  onMatchResultUpdate
}: ActivityDetailProps) {
  const { toast } = useToast();
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isAddingPlayers, setIsAddingPlayers] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [homeScore, setHomeScore] = useState(currentActivity.homeScore || 0);
  const [awayScore, setAwayScore] = useState(currentActivity.awayScore || 0);
  
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  
  const filteredPlayers = useMemo(() => {
    if (!playerSearchQuery) return sortedPlayers;
    return sortedPlayers.filter(player => 
      player.name.toLowerCase().includes(playerSearchQuery.toLowerCase())
    );
  }, [sortedPlayers, playerSearchQuery]);

  const isHomeMatch = () => {
    return currentActivity.type === "match" && 
           currentActivity.name.toLowerCase().startsWith('hässleholms if');
  };
  
  const participatingPlayers = players.filter(
    (player) => currentActivity.participants?.includes(player.id)
  );

  const getKioskPlayerName = () => {
    if (!currentActivity.kioskAssignedPlayerId) return "Ej tilldelad";
    const player = players.find(p => p.id === currentActivity.kioskAssignedPlayerId);
    return player ? player.name : "Okänd spelare";
  };

  const handleAssignKioskPlayer = (playerId: string) => {
    const updatedActivity = {
      ...currentActivity,
      kioskAssignedPlayerId: playerId
    };
    
    setCurrentActivity(updatedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
    
    if (onKioskAssignmentUpdate) {
      onKioskAssignmentUpdate(currentActivity.id, playerId);
    }
    
    const playerName = players.find(p => p.id === playerId)?.name || "Spelare";
    
    toast({
      title: "Kioskpass tilldelat",
      description: `${playerName} har tilldelats kioskpass för denna aktivitet.`,
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleAddPlayers = (playerIds: string[]) => {
    const updatedParticipants = [
      ...(currentActivity.participants || []),
      ...playerIds
    ];
    
    const updatedActivity = {
      ...currentActivity,
      participants: updatedParticipants
    };
    
    setCurrentActivity(updatedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
    
    const playerNames = playerIds.map(id => 
      players.find(p => p.id === id)?.name || "Spelare"
    ).join(", ");
    
    toast({
      title: "Spelare tillagda",
      description: `${playerNames} har lagts till i aktiviteten.`,
    });
  };

  const handleRemovePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const updatedParticipants = (currentActivity.participants || []).filter(
      id => id !== playerId
    );
    
    const updatedActivity = {
      ...currentActivity,
      participants: updatedParticipants
    };
    
    if (currentActivity.kioskAssignedPlayerId === playerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
      
      if (onKioskAssignmentUpdate) {
        onKioskAssignmentUpdate(currentActivity.id, undefined);
      }
    }
    
    setCurrentActivity(updatedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
    
    toast({
      title: "Spelare borttagen",
      description: `${player.name} har tagits bort från aktiviteten.`,
    });
  };

  const handleClearAllParticipants = () => {
    const updatedActivity = {
      ...currentActivity,
      participants: []
    };
    
    if (currentActivity.kioskAssignedPlayerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
      
      if (onKioskAssignmentUpdate) {
        onKioskAssignmentUpdate(currentActivity.id, undefined);
      }
    }
    
    setCurrentActivity(updatedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
      
      console.log("Cleared all participants from activity:", updatedActivity.name);
    }
    
    toast({
      title: "Deltagarlista rensad",
      description: `Alla spelare har tagits bort från aktiviteten.`,
    });
  };

  const handleDeleteActivity = () => {
    if (onDeleteActivity) {
      onDeleteActivity(currentActivity.id);
      onClose();
    }
  };

  const saveMatchResult = () => {
    const resultString = `${homeScore}-${awayScore}`;
    
    const updatedActivity = {
      ...currentActivity,
      result: resultString,
      homeScore: homeScore,
      awayScore: awayScore
    };
    
    setCurrentActivity(updatedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
    
    toast({
      title: "Matchresultat sparat",
      description: `Resultat ${resultString} har sparats för ${currentActivity.name}.`,
    });
  };

  const formatResult = () => {
    if (currentActivity.homeScore !== undefined && currentActivity.awayScore !== undefined) {
      return `${currentActivity.homeScore}-${currentActivity.awayScore}`;
    }
    return currentActivity.result || "";
  };

  const getTotalGoals = () => {
    if (!currentActivity.player_stats?.goals) return 0;
    return Object.values(currentActivity.player_stats.goals).reduce((sum, goals) => sum + (goals as number), 0);
  };

  const getTotalAssists = () => {
    if (!currentActivity.player_stats?.assists) return 0;
    return Object.values(currentActivity.player_stats.assists).reduce((sum, assists) => sum + (assists as number), 0);
  };

  const formattedDate = new Date(activity.date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  const isMatch = activity.type === "match";
  const isHistorical = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));

  const handleQuickResultSave = async (homeScore?: number, awayScore?: number) => {
    if (onMatchResultUpdate) {
      await onMatchResultUpdate(activity.id, homeScore, awayScore);
    }
  };

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-1 flex items-center">
              {currentActivity.name}
              <Badge 
                variant={currentActivity.type === "match" ? "default" : "secondary"}
                className="ml-3"
              >
                {currentActivity.type === "match" ? "Match" : "Cup"}
              </Badge>
              {isHistorical && (
                <Badge variant="outline" className="ml-2">
                  Tidigare
                </Badge>
              )}
              {isHistorical && currentActivity.type === "match" && formatResult() && (
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                  {formatResult()}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {capitalizedDayOfWeek} {formattedDate}
                {currentActivity.time && (
                  <span className="ml-2 flex items-center">
                    <Clock className="h-4 w-4 ml-2 mr-1" />
                    {currentActivity.time}
                  </span>
                )}
              </div>
              
              {currentActivity.location && (
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{currentActivity.location.name}</span>
                  {currentActivity.location.description && (
                    <span className="text-muted-foreground ml-1">({currentActivity.location.description})</span>
                  )}
                  {currentActivity.location.gpsLink && (
                    <a 
                      href={currentActivity.location.gpsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline text-sm"
                    >
                      GPS
                    </a>
                  )}
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="icon" onClick={() => onEdit(currentActivity)}>
                <Edit className="h-5 w-5" />
              </Button>
            )}
            {onDeleteActivity && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Radera aktivitet</AlertDialogTitle>
                    <AlertDialogDescription>
                      Är du säker på att du vill radera "{currentActivity.name}"? 
                      Denna åtgärd kan inte ångras och all information kopplad till aktiviteten kommer att försvinna.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteActivity} 
                      className="bg-red-500 hover:bg-red-700"
                    >
                      Radera
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isMatch && (
          <QuickMatchResult 
            activity={activity}
            onSave={handleQuickResultSave}
            isReadOnly={false}
          />
        )}

        <Accordion type="single" collapsible defaultValue="participants">
          <AccordionItem value="participants">
            <AccordionTrigger className="py-2">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>Deltagare ({participatingPlayers.length})</span>
                {participatingPlayers.length === 0 && (
                  <Badge variant="outline" className="ml-2">
                    Inga deltagare
                  </Badge>
                )}
                {participatingPlayers.length >= 12 && (
                  <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                    Maxantal
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {participatingPlayers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {participatingPlayers.map((player) => (
                    <div 
                      key={player.id} 
                      className="p-2 border rounded-md flex justify-between items-center"
                    >
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
                        onClick={() => onPlayerSelect && onPlayerSelect(player.id)}
                      >
                        {player.image ? (
                          <img 
                            src={player.image} 
                            alt={player.name} 
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle className="h-6 w-6 text-gray-400" />
                        )}
                        <span className="text-foreground">{player.name}</span>
                      </Button>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {player.positions?.includes("TRÄNARE") ? 'Tränare' : `Nivå ${player.grade}`}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemovePlayer(player.id)}
                          title="Ta bort spelare"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">Inga deltagare tillagda än</p>
              )}

              <div className="flex flex-wrap gap-2">
                {participatingPlayers.length < 12 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingPlayers(!isAddingPlayers)}
                    className="flex-grow"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isAddingPlayers ? "Avbryt" : "Lägg till spelare"}
                  </Button>
                )}
                
                {participatingPlayers.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-grow text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Rensa alla
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Detta kommer ta bort alla {participatingPlayers.length} deltagare från aktiviteten. 
                          Denna åtgärd kan inte ångras.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleClearAllParticipants}
                          className="bg-red-500 hover:bg-red-700"
                        >
                          Ta bort alla
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {isAddingPlayers && (
                <AddPlayersToActivity 
                  activity={currentActivity}
                  players={players}
                  onAddPlayers={handleAddPlayers}
                  currentParticipantIds={currentActivity.participants || []}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {isHistorical && isMatch && (
          <ActivityResultSection
            activity={currentActivity}
            isHistorical={isHistorical}
            updateActivity={onActivityUpdate!}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleClose}>Stäng</Button>
      </CardFooter>
    </Card>
  );
}
