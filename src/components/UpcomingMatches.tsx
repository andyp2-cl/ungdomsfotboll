import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Match } from "@/types/match";
import { Player, Activity } from "@/types/player";
import { Plus, Users, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { getAvailablePlayers } from "@/utils/playerAvailability";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface UpcomingMatchesProps {
  matches: Match[];
  players: Player[];
  activities: Activity[];
  onPlayerAssignment: (matchId: string, playerId: string) => void;
  onPlayerRemoval: (matchId: string, playerId: string) => void;
  renderExtraActions?: (match: Match) => React.ReactNode;
  onMultiPlayerAdd?: (matchId: string) => void;
}

export function UpcomingMatches({
  matches,
  players,
  activities,
  onPlayerAssignment,
  onPlayerRemoval,
  renderExtraActions,
  onMultiPlayerAdd
}: UpcomingMatchesProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const sortedMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handlePlayerAssignment = async (matchId: string, playerId: string) => {
    setLoading(true);
    try {
      await onPlayerAssignment(matchId, playerId);
      toast({ title: "Spelare tillagd", description: "Spelaren har lagts till i matchen" });
    } catch (e) {
      setError("Kunde inte lägga till spelare");
      toast({ title: "Fel", description: "Kunde inte lägga till spelare", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerRemoval = async (matchId: string, playerId: string) => {
    setLoading(true);
    try {
      await onPlayerRemoval(matchId, playerId);
      toast({ title: "Spelare borttagen", description: "Spelaren har tagits bort från matchen" });
    } catch (e) {
      setError("Kunde inte ta bort spelare");
      toast({ title: "Fel", description: "Kunde inte ta bort spelare", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getLeagueBadgeColor = (league: string) => {
    return "bg-gray-500";
  };

  const getPlayerCountDisplay = (match: Match) => {
    const currentCount = match.players.length;
    
    return (
      <div className="flex items-center gap-1 text-foreground">
        <Users className="h-4 w-4" />
        <span className="font-medium">{currentCount}</span>
      </div>
    );
  };

  const getDialogAllPlayers = () => {
    // Implement the logic to fetch all players for the dialog
    return [];
  };

  if (loading) return <div className="py-8 text-center">Laddar...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Kommande matcher</h2>
      <input
        className="mb-2 p-2 border rounded w-full"
        placeholder="Sök spelare..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse sticky top-0 bg-white z-10">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="px-4 py-2">Datum</th>
              <th className="px-4 py-2">Tid</th>
              <th className="px-4 py-2">Motståndare</th>
              <th className="px-4 py-2">Liga</th>
              <th className="px-4 py-2">Plats</th>
              <th className="px-4 py-2">Spelare</th>
              <th className="px-4 py-2">Antal</th>
              <th className="px-4 py-2">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {sortedMatches.flatMap(match => {
              const available = getAvailablePlayers(players, activities, match)
                .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
              const unavailable = players.filter(player =>
                !available.includes(player)
              );
              const rows = [
                <tr key={match.id} className="border-b">
                  <td className="px-4 py-2">{new Date(match.date).toLocaleDateString('sv-SE')}</td>
                  <td className="px-4 py-2">{new Date(match.date).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2">{match.opponent}</td>
                  <td className="px-4 py-2"><span className="bg-gray-200 rounded px-2 py-1 text-xs">{match.league}</span></td>
                  <td className="px-4 py-2">{match.location}</td>
                  <td className="px-4 py-2">
                    {match.players.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      if (!player) return null;
                      return (
                        <span key={playerId} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 mb-1">
                          {player.name}
                        </span>
                      );
                    })}
                  </td>
                  <td className="px-4 py-2">👥 {match.players.length}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-xl"
                      onClick={() => setExpanded(expanded === match.id ? null : match.id)}
                      title="Visa mer info"
                    >
                      {expanded === match.id ? "−" : "+"}
                    </button>
                  </td>
                </tr>
              ];
              if (expanded === match.id) {
                rows.push(
                  <tr key={match.id + "-expand"}>
                    <td colSpan={8} className="bg-gray-50">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="mb-2 font-semibold">Tillgängliga spelare <span className="text-xs">({available.length})</span></div>
                          <div className="flex flex-wrap gap-2">
                            {available.length === 0 && <span className="text-gray-400">Inga spelare tillgängliga</span>}
                            {available.map(player => (
                              <span key={player.id} className="inline-flex items-center bg-green-100 text-green-800 rounded px-2 py-1 text-xs">
                                {player.name}
                                <button
                                  className="ml-2 text-green-600 hover:text-green-900"
                                  onClick={() => handlePlayerAssignment(match.id, player.id)}
                                  title="Lägg till spelare"
                                >
                                  <Plus size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 font-semibold">Ej tillgängliga spelare <span className="text-xs">({unavailable.length})</span></div>
                          <div className="flex flex-wrap gap-2">
                            {unavailable.length === 0 && <span className="text-gray-400">Alla spelare är tillgängliga</span>}
                            {unavailable.map(player => {
                              let reason = "";
                              if (player.isActive === false) reason = "Inaktiv";
                              else {
                                const matchDate = new Date(match.date).toDateString();
                                const hasSameDayMatch = activities.some(activity =>
                                  activity.type === 'match' &&
                                  activity.id !== match.id &&
                                  new Date(activity.date).toDateString() === matchDate &&
                                  activity.participants?.includes(player.id)
                                );
                                if (hasSameDayMatch) reason = "Har redan match denna dag";
                              }
                              return (
                                <span key={player.id} className="inline-flex items-center bg-red-100 text-red-800 rounded px-2 py-1 text-xs" title={reason}>
                                  {player.name}
                                  <span className="ml-2 text-red-500" title={reason}>⛔</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }
              return rows;
            })}
          </tbody>
        </table>
      </div>
      {expanded === null && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-lg font-semibold mb-4">Lägg till spelare</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Namn</TableHead>
                <TableHead>Nivå</TableHead>
                <TableHead>Aktiviteter</TableHead>
                <TableHead>Träningsratio</TableHead>
                <TableHead>Denna vecka</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getDialogAllPlayers().map(player => (
                <TableRow key={player.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPlayerIds.includes(player.id)}
                      onCheckedChange={() => {
                        if (selectedPlayerIds.includes(player.id)) {
                          setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== player.id));
                        } else {
                          setSelectedPlayerIds([...selectedPlayerIds, player.id]);
                        }
                      }}
                      disabled={player.disabled}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.grade}</TableCell>
                  <TableCell>{player.activitiesCount}</TableCell>
                  <TableCell>{typeof player.trainingRatio === 'number' ? player.trainingRatio.toFixed(2) : '-'}</TableCell>
                  <TableCell>{player.thisWeekCount}</TableCell>
                  <TableCell>
                    {player.disabled && (
                      <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs" title={player.reason}>{player.reason}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
