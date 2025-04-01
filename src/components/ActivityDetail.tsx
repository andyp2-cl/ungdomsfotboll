
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Check, Clock, MapPin, Trophy, Users, X } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { PlayerAvatar } from "@/components/player-selection/PlayerAvatar";

interface ActivityDetailProps {
  activity: Activity | null;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
  players: Player[];
  onAssignKiosk: (activityId: string, playerId?: string) => void;
  onRemoveKioskAssignment: (activityId: string) => void;
}

export function ActivityDetail({
  activity,
  onClose,
  onEdit,
  players,
  onAssignKiosk,
  onRemoveKioskAssignment
}: ActivityDetailProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [kioskPlayerId, setKioskPlayerId] = useState<string | undefined>(activity?.kioskAssignedPlayerId);
  const [isKioskDialogOpen, setIsKioskDialogOpen] = useState(false);
  const [isCupMatchesDialogOpen, setIsCupMatchesDialogOpen] = useState(false);
  const [homeScore, setHomeScore] = useState<number | undefined>(activity?.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity?.awayScore);
  const [isWin, setIsWin] = useState<boolean | undefined>(activity?.isWin);

  useEffect(() => {
    if (activity) {
      setSelectedPlayers(activity.participants || []);
      setKioskPlayerId(activity.kioskAssignedPlayerId);
      setHomeScore(activity.homeScore);
      setAwayScore(activity.awayScore);
      setIsWin(activity.isWin);
    }
  }, [activity]);

  const handleClose = () => {
    onClose();
  };

  const handleEdit = () => {
    if (activity) {
      onEdit(activity);
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Okänt datum";
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) return "Ogiltigt datum";
    return format(parsedDate, "EEEE d MMMM yyyy", { locale: sv });
  };

  const formatTime = (timeString: string | undefined): string => {
    return timeString ? timeString : "Ingen tid angiven";
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((prevPlayers) => {
      if (prevPlayers.includes(playerId)) {
        return prevPlayers.filter((id) => id !== playerId);
      } else {
        return [...prevPlayers, playerId];
      }
    });
  };

  const handleKioskAssignment = (playerId?: string) => {
    if (activity) {
      if (playerId) {
        onAssignKiosk(activity.id, playerId);
        setKioskPlayerId(playerId);
      } else {
        onRemoveKioskAssignment(activity.id);
        setKioskPlayerId(undefined);
      }
      setIsKioskDialogOpen(false);
    }
  };

  const renderLocationInfo = () => {
    if (!activity?.location) {
      return <p>Ingen platsinformation tillgänglig.</p>;
    }

    return (
      <div className="space-y-2">
        <p className="font-medium">{activity.location.name}</p>
        {activity.location.description && <p className="text-sm text-muted-foreground">{activity.location.description}</p>}
        {activity.location.gpsLink && (
          <a href={activity.location.gpsLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
            Visa på karta
          </a>
        )}
      </div>
    );
  };

  const renderParticipants = () => {
    if (!players || players.length === 0) {
      return <p>Inga spelare tillgängliga.</p>;
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {players.map((player) => (
          <div key={player.id} className="flex flex-col items-center">
            <PlayerAvatar player={player} size="sm" />
            <label
              htmlFor={`player-${player.id}`}
              className="text-sm text-center cursor-pointer hover:underline"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`player-${player.id}`}
                  checked={selectedPlayers.includes(player.id)}
                  onCheckedChange={() => handlePlayerToggle(player.id)}
                />
                <span>{player.name}</span>
              </div>
            </label>
          </div>
        ))}
      </div>
    );
  };

  const renderKioskAssignment = () => {
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          Tilldela en spelare som ansvarig för kiosken under denna aktivitet.
        </p>
        <Button size="sm" onClick={() => setIsKioskDialogOpen(true)}>
          {kioskPlayerId
            ? `Ändra kioskansvarig`
            : `Välj kioskansvarig`}
        </Button>

        {kioskPlayerId && (
          <div className="mt-2 flex items-center space-x-2">
            <p className="text-sm">
              Kioskansvarig:{" "}
              {players.find((p) => p.id === kioskPlayerId)?.name || "Okänd"}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleKioskAssignment(undefined)}
            >
              Ta bort
            </Button>
          </div>
        )}

        <Dialog open={isKioskDialogOpen} onOpenChange={setIsKioskDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Välj kioskansvarig</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {players.map((player) => (
                <Button
                  key={player.id}
                  variant={kioskPlayerId === player.id ? "default" : "outline"}
                  onClick={() => handleKioskAssignment(player.id)}
                >
                  {player.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderCupMatches = () => {
    if (!activity?.matches || activity.matches.length === 0) {
      return <p>Inga matcher kopplade till denna cup.</p>;
    }

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Matcher kopplade till denna cup:
        </p>
        <ul>
          {activity.matches.map((matchId) => {
            const match = players.find((p) => p.id === matchId);
            return (
              <li key={matchId} className="text-sm">
                {match ? match.name : "Okänd match"}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderMatchResult = () => {
    const handleScoreChange = () => {
      if (activity) {
        const updatedActivity = {
          ...activity,
          homeScore: homeScore !== undefined ? homeScore : null,
          awayScore: awayScore !== undefined ? awayScore : null,
          isWin: isWin !== undefined ? isWin : null,
        };
        onEdit(updatedActivity);
      }
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="homeScore">Hemma</Label>
            <Input
              type="number"
              id="homeScore"
              value={homeScore !== undefined ? homeScore.toString() : ""}
              onChange={(e) => setHomeScore(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          <div>
            <Label htmlFor="awayScore">Borta</Label>
            <Input
              type="number"
              id="awayScore"
              value={awayScore !== undefined ? awayScore.toString() : ""}
              onChange={(e) => setAwayScore(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isWin"
            checked={isWin === true}
            onCheckedChange={(checked) => {
              // Fix: Handle the CheckedState type properly
              setIsWin(checked === true);
            }}
          />
          <Label htmlFor="isWin">Vinst för Hässleholms IF</Label>
        </div>
        <Button size="sm" onClick={handleScoreChange}>
          Spara resultat
        </Button>
      </div>
    );
  };

  if (!activity) {
    return null;
  }

  return (
    <Dialog open={!!activity} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex justify-between items-center">
              <span>{activity.name}</span>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Detaljer</TabsTrigger>
            <TabsTrigger value="participants">Deltagare</TabsTrigger>
            {activity.type === "cup" && <TabsTrigger value="cup-matches">Cupmatcher</TabsTrigger>}
            {activity.type === "match" && <TabsTrigger value="match-result">Matchresultat</TabsTrigger>}
            <TabsTrigger value="kiosk">Kiosk</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-2">
            <Card>
              <CardContent className="pl-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>Datum:</span>
                    </div>
                    <p>{formatDate(activity.date)}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Tid:</span>
                    </div>
                    <p>{formatTime(activity.time)}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Plats:</span>
                    </div>
                    {renderLocationInfo()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4" />
                      <span>Typ:</span>
                    </div>
                    <p>{activity.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="participants" className="space-y-2">
            <Card>
              <CardContent>
                <ScrollArea className="h-[300px] w-full">
                  {renderParticipants()}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          {activity.type === "cup" && (
            <TabsContent value="cup-matches" className="space-y-2">
              <Card>
                <CardContent>
                  {renderCupMatches()}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {activity.type === "match" && (
            <TabsContent value="match-result" className="space-y-2">
              <Card>
                <CardContent>
                  {renderMatchResult()}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          <TabsContent value="kiosk" className="space-y-2">
            <Card>
              <CardContent>
                {renderKioskAssignment()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={handleClose}>
            Stäng
          </Button>
          <Button onClick={handleEdit}>Redigera</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
