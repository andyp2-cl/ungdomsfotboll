import { useState, useEffect, useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid';

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
  onPlayerSelect
}: ActivityDetailProps) {
  const { toast } = useToast();
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isAddingPlayers, setIsAddingPlayers] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [matchResult, setMatchResult] = useState(currentActivity.result || "");
  
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

  const handleMatchResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMatchResult(e.target.value);
  };

  const saveMatchResult = () => {
    const updatedActivity = {
      ...currentActivity,
      result: matchResult
    };
    
    setCurrentActivity(updatedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
    
    toast({
      title: "Matchresultat sparat",
      description: `Resultat ${matchResult} har sparats för ${currentActivity.name}.`,
    });
  };

  const formattedDate = new Date(activity.date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  const isHistorical = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));

  const getTotalGoals = () => {
    if (!currentActivity.playerStats?.goals) return 0;
    return Object.values(currentActivity.playerStats.goals).reduce((sum, goals) => sum + goals, 0);
  };

  const getTotalAssists = () => {
    if (!currentActivity.playerStats?.assists) return 0;
    return Object.values(currentActivity.playerStats.assists).reduce((sum, assists) => sum + assists, 0);
  };

  const renderPlayerStatistics = () => {
    if (!activities || activities.length === 0) {
      return (
        <div className="text-muted-foreground text-center py-4">
          Ingen statistik tillgänglig
        </div>
      );
    }
    
    const stats = calculatePlayerStatistics(player, activities);
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <div className="text-xs text-muted-foreground">Matcher</div>
          </div>
          <div className="bg-background border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalGoals}</div>
            <div className="text-xs text-muted-foreground">Mål</div>
          </div>
          <div className="bg-background border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAssists}</div>
            <div className="text-xs text-muted-foreground">Assist</div>
          </div>
        </div>
        
        {stats.goalsByActivity.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Målstatistik</h4>
            <div className="space-y-2">
              {stats.goalsByActivity.map((activityStat, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded text-sm">
                  <div>
                    <div className="font-medium">{activityStat.activityName}</div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(activityStat.activityDate).toLocaleDateString('sv-SE')}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {activityStat.goals} {activityStat.goals === 1 ? 'mål' : 'mål'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {stats.assistsByActivity.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Assiststatistik</h4>
            <div className="space-y-2">
              {stats.assistsByActivity.map((activityStat, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded text-sm">
                  <div>
                    <div className="font-medium">{activityStat.activityName}</div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(activityStat.activityDate).toLocaleDateString('sv-SE')}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {activityStat.assists} {activityStat.assists === 1 ? 'assist' : 'assist'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
              {isHistorical && currentActivity.type === "match" && currentActivity.result && (
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                  {currentActivity.result}
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

        {isHistorical && currentActivity.type === "match" && (
          <>
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="t.ex. 2-1"
                  value={matchResult}
                  onChange={handleMatchResultChange}
                  className="max-w-[120px]"
                />
                <Button size="sm" onClick={saveMatchResult}>Spara</Button>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-semibold mb-3">Matchstatistik</h3>
              {participatingPlayers.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-2">Anteckna hur många mål och assist varje spelare har gjort:</p>
                  {participatingPlayers.map(player => {
                    const goals = currentActivity.playerStats?.goals?.[player.id] || 0;
                    const assists = currentActivity.playerStats?.assists?.[player.id] || 0;
                    
                    return (
                      <div key={player.id} className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">{player.name}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <span className="text-xs mr-2">Mål:</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7 rounded-full"
                              onClick={() => {
                                const updatedActivity = {...currentActivity};
                                if (!updatedActivity.playerStats) {
                                  updatedActivity.playerStats = { goals: {} };
                                }
                                if (!updatedActivity.playerStats.goals) {
                                  updatedActivity.playerStats.goals = {};
                                }
                                if (goals > 0) {
                                  updatedActivity.playerStats.goals[player.id] = goals - 1;
                                }
                                setCurrentActivity(updatedActivity);
                                if (onActivityUpdate) {
                                  onActivityUpdate(updatedActivity);
                                }
                              }}
                              disabled={goals === 0}
                            >
                              -
                            </Button>
                            <span className="mx-2 w-6 text-center">{goals}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7 rounded-full"
                              onClick={() => {
                                const updatedActivity = {...currentActivity};
                                if (!updatedActivity.playerStats) {
                                  updatedActivity.playerStats = { goals: {}, assists: {} };
                                }
                                if (!updatedActivity.playerStats.goals) {
                                  updatedActivity.playerStats.goals = {};
                                }
                                updatedActivity.playerStats.goals[player.id] = (goals || 0) + 1;
                                setCurrentActivity(updatedActivity);
                                if (onActivityUpdate) {
                                  onActivityUpdate(updatedActivity);
                                }
                              }}
                            >
                              +
                            </Button>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-xs mr-2">Assist:</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7 rounded-full"
                              onClick={() => {
                                const updatedActivity = {...currentActivity};
                                if (!updatedActivity.playerStats) {
                                  updatedActivity.playerStats = { goals: {}, assists: {} };
                                }
                                if (!updatedActivity.playerStats.assists) {
                                  updatedActivity.playerStats.assists = {};
                                }
                                if (assists > 0) {
                                  updatedActivity.playerStats.assists[player.id] = assists - 1;
                                }
                                setCurrentActivity(updatedActivity);
                                if (onActivityUpdate) {
                                  onActivityUpdate(updatedActivity);
                                }
                              }}
                              disabled={assists === 0}
                            >
                              -
                            </Button>
                            <span className="mx-2 w-6 text-center">{assists}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7 rounded-full"
                              onClick={() => {
                                const updatedActivity = {...currentActivity};
                                if (!updatedActivity.playerStats) {
                                  updatedActivity.playerStats = { goals: {}, assists: {} };
                                }
                                if (!updatedActivity.playerStats.assists) {
                                  updatedActivity.playerStats.assists = {};
                                }
                                updatedActivity.playerStats.assists[player.id] = (assists || 0) + 1;
                                setCurrentActivity(updatedActivity);
                                if (onActivityUpdate) {
                                  onActivityUpdate(updatedActivity);
                                }
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-4 flex gap-4 justify-center">
                    <Badge variant="outline" className="text-sm px-3 py-1 bg-green-50 text-green-700 border-green-200">
                      Mål: {getTotalGoals()}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                      Assist: {getTotalAssists()}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Lägg till spelare för att registrera mål och assist.</p>
              )}
            </div>
          </>
        )}

        {currentActivity.type === "match" && (
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-semibold flex items-center mb-3">
              <Coffee className="h-5 w-5 mr-2" />
              Kioskansvarig
              {isHomeMatch() && (
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">
                  Hemmaplan
                </Badge>
              )}
            </h3>
            
            <div className="flex justify-between items-center">
              <Badge variant={currentActivity.kioskAssignedPlayerId ? "default" : "outline"} className="mr-2">
                {getKioskPlayerName()}
              </Badge>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="h-8 px-3"
                  >
                    {currentActivity.kioskAssignedPlayerId ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Ändra
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Tilldela
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end" side="top">
                  <Command>
                    <CommandInput 
                      placeholder="Sök spelare..." 
                      value={playerSearchQuery}
                      onValueChange={setPlayerSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>Inga spelare hittades.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-auto">
                        {filteredPlayers.map((player) => (
                          <CommandItem
                            key={player.id}
                            onSelect={() => handleAssignKioskPlayer(player.id)}
                            className="flex items-center justify-between"
                          >
                            <span>{player.name}</span>
                            {player.id === currentActivity.kioskAssignedPlayerId && (
                              <Check className="h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {currentActivity.type === "cup" && (
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-semibold mb-3">Matcher i cupen</h3>
            
            {cupMatches && cupMatches.length > 0 ? (
              <div className="space-y-2">
                {cupMatches.map(match => (
                  <div key={match.id} className="p-2 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{match.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {match.time || "Tid ej satt"}
                          {match.location && (
                            <span className="ml-2">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {match.location.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8"
                        onClick={() => {
                          if (onActivitySelect) {
                            onActivitySelect(match);
                          }
                        }}
                      >
                        Visa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Inga matcher tillagda i denna cup ännu.</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleClose}>Stäng</Button>
      </CardFooter>
    </Card>
  );
}
