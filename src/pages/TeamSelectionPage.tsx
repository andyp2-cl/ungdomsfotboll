import React, { useState, useEffect } from "react";
import { TrainingStatsUpload } from "@/components/TrainingStatsUpload";
import { UpcomingMatches } from "@/components/UpcomingMatches";
import { PlayerMultiSelectDropdown } from "@/components/player-selection/PlayerMultiSelectDropdown";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Plus, X } from "lucide-react";
import { Player, Activity } from "@/types/player";
import { Match } from "@/types/match";
import { useActivities } from "@/hooks/activities";
import { usePlayers } from "@/hooks/players";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { getStoredActivities } from "@/utils/storage/activity/fetch";
import { getActiveTab } from "@/utils/storage/tabs";
import { getLatestTrainingUpload } from "@/lib/supabase/trainingUploads";

interface TrainingStats {
  playerId: string;
  playerName: string;
  trainingSessions: number;
  matchesPlayed: number;
  trainingMatchRatio: number;
}

export default function TeamSelectionPage() {
  const [trainingStats, setTrainingStats] = useState<TrainingStats[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('playerName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [leagues, setLeagues] = useState<any[]>([]);
  const [leagueMap, setLeagueMap] = useState<Record<string, string>>({});
  const [sortedMatches, setSortedMatches] = useState<Match[]>([]);
  const [multiSelectDialog, setMultiSelectDialog] = useState<{
    open: boolean;
    matchId: string | null;
  }>({ open: false, matchId: null });
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const {
    filteredActivities,
    activities,
    isLoading,
    handleActivityUpdate
  } = useActivities([], () => {});

  const {
    players
  } = usePlayers();

  useEffect(() => {
    async function fetchLeagues() {
      const { data, error } = await supabase.from("leagues").select("*");
      if (data) {
        setLeagues(data);
        const map: Record<string, string> = {};
        data.forEach((l: any) => {
          let displayName = l.name;
          const yearStr = l.year?.toString() || "";
          if (displayName.startsWith(yearStr)) {
            displayName = displayName.replace(new RegExp(`^${yearStr}\\s+${yearStr}\\s+`), '');
            displayName = displayName.replace(new RegExp(`^${yearStr}\\s+`), '');
          }
          map[l.id] = `${displayName} ${l.year} ${l.division}`.trim();
        });
        setLeagueMap(map);
      }
    }
    fetchLeagues();
  }, []);

  // Ladda träningsstatistik från Supabase vid sidladdning
  useEffect(() => {
    async function loadTrainingStats() {
      try {
        const latestUpload = await getLatestTrainingUpload();
        if (latestUpload && latestUpload.stats_data) {
          setTrainingStats(latestUpload.stats_data);
        }
      } catch (error) {
        console.error('Error loading training stats:', error);
      }
    }
    loadTrainingStats();
  }, []);

  function extractOpponent(matchName: string) {
    if (!matchName) return '';
    const parts = matchName.split(' - ');
    if (parts.length === 2) {
      if (parts[0].toLowerCase().includes('hässleholms if')) return parts[1].trim();
      if (parts[1].toLowerCase().includes('hässleholms if')) return parts[0].trim();
      return parts[1].trim();
    }
    return matchName;
  }

  function getPrettyLeagueName(league: string) {
    if (league.includes("2013 A")) return "2013 A";
    if (league.includes("2014 A1")) return "2014 A1";
    if (league.includes("2014 A2")) return "2014 A2";
    if (league.includes("2014 B1")) return "2014 B1";
    return league;
  }

  const now = new Date();
  const upcomingMatches = filteredActivities.filter((a: any) => 
    a.type === 'match' && new Date(a.date) >= now
  );

  const mappedUpcomingMatches = upcomingMatches.map((a: any) => {
    let leagueName = '';
    if (a.leagueId && leagueMap[a.leagueId]) leagueName = leagueMap[a.leagueId];
    else if (a.league_id && leagueMap[a.league_id]) leagueName = leagueMap[a.league_id];
    else leagueName = a.leagueId || a.league_id || '';
    
    return {
      id: a.id,
      date: a.date,
      time: a.time || '',
      opponent: extractOpponent(a.name || ''),
      location: a.location?.name || '',
      league: getPrettyLeagueName(leagueName),
      players: a.participants || [],
      requiredPlayers: 11,
      status: a.status as 'scheduled' | 'completed' | 'cancelled' || 'scheduled',
      rawActivity: a
    };
  });

  useEffect(() => {
    const sorted = mappedUpcomingMatches.slice().sort((a, b) => {
      const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
      const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
      return dateA.getTime() - dateB.getTime();
    });
    setSortedMatches(sorted);
  }, [mappedUpcomingMatches]);

  const handleStatsUploaded = (stats: TrainingStats[]) => {
    const statsWithRatio = stats.map(s => ({
      ...s,
      trainingMatchRatio: s.trainingSessions > 0 ? s.matchesPlayed / s.trainingSessions : 99
    }));
    setTrainingStats(statsWithRatio);
  };

  const handlePlayerAssignment = async (matchId: string, playerId: string) => {
    const match = sortedMatches.find(m => m.id === matchId);
    if (!match) return;

    setSortedMatches(prevMatches => 
      prevMatches.map(m => 
        m.id === matchId 
          ? { ...m, players: [...m.players, playerId] }
          : m
      )
    );

    const { error } = await supabase
      .from('player_activities')
      .insert({
        id: crypto.randomUUID(),
        player_id: playerId,
        activity_id: matchId
      });

    if (error) {
      setSortedMatches(prevMatches => 
        prevMatches.map(m => 
          m.id === matchId 
            ? { ...m, players: m.players.filter(id => id !== playerId) }
            : m
        )
      );
      toast({
        title: "Kunde inte lägga till spelare",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Spelare tillagd",
      description: "Spelaren har lagts till i matchen"
    });
  };

  const handlePlayerRemoval = async (matchId: string, playerId: string) => {
    const match = sortedMatches.find(m => m.id === matchId);
    if (!match) return;

    setSortedMatches(prevMatches => 
      prevMatches.map(m => 
        m.id === matchId 
          ? { ...m, players: m.players.filter(id => id !== playerId) }
          : m
      )
    );

    const { error } = await supabase
      .from('player_activities')
      .delete()
      .eq('activity_id', matchId)
      .eq('player_id', playerId);

    if (error) {
      setSortedMatches(prevMatches => 
        prevMatches.map(m => 
          m.id === matchId 
            ? { ...m, players: [...m.players, playerId] }
            : m
        )
      );
      toast({
        title: "Kunde inte ta bort spelare",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Spelare borttagen",
      description: "Spelaren har tagits bort från matchen"
    });
  };

  const handleMultiPlayerAdd = (matchId: string) => {
    setMultiSelectDialog({ open: true, matchId });
    setSelectedPlayerIds([]);
  };

  const handleMultiPlayerSave = async () => {
    if (!multiSelectDialog.matchId || selectedPlayerIds.length === 0) {
      setMultiSelectDialog({ open: false, matchId: null });
      return;
    }

    const matchId = multiSelectDialog.matchId;
    let successCount = 0;

    for (const playerId of selectedPlayerIds) {
      try {
        await handlePlayerAssignment(matchId, playerId);
        successCount++;
      } catch (error) {
        console.error('Error adding player:', error);
      }
    }

    toast({
      title: "Spelare tillagda",
      description: `${successCount} av ${selectedPlayerIds.length} spelare har lagts till.`
    });

    setMultiSelectDialog({ open: false, matchId: null });
    setSelectedPlayerIds([]);
  };

  const sortedTrainingStats = [...trainingStats].sort((a, b) => {
    let valA = a[sortColumn as keyof TrainingStats];
    let valB = b[sortColumn as keyof TrainingStats];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const currentMatch = multiSelectDialog.matchId 
    ? sortedMatches.find(m => m.id === multiSelectDialog.matchId)
    : null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="font-bold mb-6 text-lg">Laguttagning</h1>
      
      <div className="grid gap-6">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <TrainingStatsUpload onStatsUploaded={handleStatsUploaded} />
        </div>

        {warnings.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul>
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <UpcomingMatches 
          matches={sortedMatches} 
          players={players} 
          onPlayerAssignment={handlePlayerAssignment}
          onPlayerRemoval={handlePlayerRemoval}
          onMultiPlayerAdd={handleMultiPlayerAdd}
          renderExtraActions={match => (
            <button
              onClick={() => handleMultiPlayerAdd(match.id)}
              className="p-1 hover:bg-muted rounded-full"
              title="Lägg till flera spelare"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        />

        {/* Multi-select dialog */}
        <Dialog open={multiSelectDialog.open} onOpenChange={(open) => 
          setMultiSelectDialog({ open, matchId: multiSelectDialog.matchId })
        }>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Lägg till spelare - {currentMatch?.opponent}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <PlayerMultiSelectDropdown
                players={players}
                selectedPlayerIds={selectedPlayerIds}
                onSelectionChange={setSelectedPlayerIds}
                excludePlayerIds={currentMatch?.players || []}
                placeholder="Välj spelare att lägga till..."
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setMultiSelectDialog({ open: false, matchId: null })}
                >
                  Avbryt
                </Button>
                <Button 
                  onClick={handleMultiPlayerSave}
                  disabled={selectedPlayerIds.length === 0}
                >
                  Lägg till {selectedPlayerIds.length} spelare
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {sortedTrainingStats.length > 0 && (
          <div className="overflow-x-auto mt-8">
            <h2 className="text-xl font-semibold mb-2">Närvarostatistik</h2>
            <table className="min-w-full text-sm border mt-2">
              <thead>
                <tr>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort('playerName')}>Namn</th>
                  <th className="border px-2 py-1">Nivå</th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort('trainingSessions')}>Träning Kallad</th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort('matchesPlayed')}>Träning Deltagit</th>
                  <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort('trainingMatchRatio')}>Träningsratio</th>
                  <th className="border px-2 py-1">Aktiviteter</th>
                </tr>
              </thead>
              <tbody>
                {sortedTrainingStats.map(stat => {
                  const player = players.find(p => p.name === stat.playerName);
                  let activityCount = 0;
                  if (player && Array.isArray(player.activities) && player.activities.length > 0) {
                    activityCount = player.activities.length;
                  } else {
                    activityCount = activities.filter(a => 
                      a.participants && a.participants.includes(stat.playerId)
                    ).length;
                  }
                  
                  return (
                    <tr key={stat.playerId}>
                      <td className="border px-2 py-1">{stat.playerName}</td>
                      <td className="border px-2 py-1 text-center">{player?.grade || '-'}</td>
                      <td className="border px-2 py-1 text-center">{stat.trainingSessions}</td>
                      <td className="border px-2 py-1 text-center">{stat.matchesPlayed}</td>
                      <td className="border px-2 py-1 text-center">
                        {stat.trainingMatchRatio != null ? stat.trainingMatchRatio.toFixed(2) : '-'}
                      </td>
                      <td className="border px-2 py-1 text-center">{activityCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
