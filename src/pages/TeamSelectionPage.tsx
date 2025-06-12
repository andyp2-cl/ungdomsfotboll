import React, { useState, useEffect } from "react";
import { TrainingStatsUpload } from "@/components/TrainingStatsUpload";
import { UpcomingMatches } from "@/components/UpcomingMatches";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { getLatestTrainingUpload, saveTrainingUpload } from "@/lib/supabase/trainingUploads";
import { PlayerMultiSelectDropdown } from "@/components/player-selection/PlayerMultiSelectDropdown";
import { DialogFooter } from "@/components/ui/dialog";
import { getWeeklyMatchCountForActivity } from "@/utils/weeklyMatchUtils";
import { getAvailablePlayers } from "@/utils/playerAvailability";
import Papa from "papaparse";

interface TrainingStats {
  playerId: string;
  playerName: string;
  level?: string;
  activities?: number;
  trainingSessions: number;
  matchesPlayed: number;
  trainingMatchRatio?: number;
  attendanceRatio?: number;
}

function parseCSV(csvText: string) {
  // Simple CSV parser for demonstration (replace with papaparse or similar for production)
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i]; });
    return obj;
  });
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
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvError, setCsvError] = useState<string | null>(null);

  const {
    filteredActivities,
    activities: activitiesFromHook,
    isLoading,
    handleActivityUpdate
  } = useActivities([], () => {});

  const {
    players: playersFromHook
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: playerDataRaw } = await supabase.from('players').select('*');
      const { data: activityDataRaw } = await supabase.from('activities').select('*');

      // Map players
      const playerData: Player[] = (playerDataRaw || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        grade: (p.grade || 'D') as 'A' | 'B' | 'C' | 'D',
        positions: p.position ? [p.position] : [],
        jerseyNumber: p.jersey_number,
        image: p.image,
        isActive: p.is_active,
        trainingRatio: p.training_ratio,
        activities: p.activities || [],
        // ...add other fields as needed
      }));

      // Map activities
      const activityData: Activity[] = (activityDataRaw || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        date: a.date,
        type: a.type,
        time: a.time,
        location: a.location_name ? { name: a.location_name, description: a.location_description, gpsLink: a.location_gps_link } : undefined,
        participants: a.participants || [],
        leagueId: a.league_id || a.leagueId || '',
        // ...add other fields as needed
      }));

      setPlayers(playerData);
      setActivities(activityData);
      setLoading(false);
    }
    fetchData();
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
  const twoWeeksFromNow = new Date(now);
  twoWeeksFromNow.setDate(now.getDate() + 14);

  const upcomingMatches = filteredActivities.filter((a: any) => 
    a.type === 'match' && 
    new Date(a.date) >= now && 
    new Date(a.date) <= twoWeeksFromNow
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

  // Filtrera bort inaktiva spelare
  const activePlayers = playersFromHook.filter(player => player.isActive !== false);

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

    // Kontrollera om spelaren är aktiv
    const player = players.find(p => p.id === playerId);
    if (!player || player.isActive === false) {
      toast({
        title: "Kan inte lägga till spelare",
        description: "Spelaren är inaktiv",
        variant: "destructive"
      });
      return;
    }

    // Kontrollera om spelaren redan har match samma dag
    const matchDate = new Date(match.date);
    const sameDayMatches = activities.filter(activity => {
      if (activity.type !== 'match' || activity.id === matchId) return false;
      const activityDate = new Date(activity.date);
      return activityDate.toDateString() === matchDate.toDateString() &&
             activity.participants?.includes(playerId);
    });

    if (sameDayMatches.length > 0) {
      toast({
        title: "Kan inte lägga till spelare",
        description: "Spelaren har redan en match samma dag",
        variant: "destructive"
      });
      return;
    }

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

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
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

  const matches = activities.filter(a => a.type === 'match');
  const currentMatch = matches.find(m => m.id === selectedMatchId) || null;

  const availablePlayers = players.filter(player => {
    // Filtrera bort inaktiva spelare
    if (player.isActive === false) return false;

    // Filtrera bort spelare som redan har match samma dag
    if (currentMatch) {
      const matchDate = new Date(currentMatch.date);
      const sameDayMatches = activities.filter(activity => {
        if (activity.type !== 'match' || activity.id === currentMatch.id) return false;
        const activityDate = new Date(activity.date);
        return activityDate.toDateString() === matchDate.toDateString() &&
               activity.participants?.includes(player.id);
      });
      if (sameDayMatches.length > 0) return false;
    }

    return true;
  });

  // Beräkna aktiviteter denna vecka för varje spelare
  const getThisWeekActivities = (playerId: string) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startOfWeek && 
             activityDate < endOfWeek && 
             activity.participants && 
             activity.participants.includes(playerId);
    }).length;
  };

  // Calculate training ratios for players
  const playersWithTrainingRatio = players.map(player => {
    const trainingSessions = activities.filter(a => 
      a.type === 'training' && 
      a.participants?.includes(player.id)
    ).length;

    const matchesPlayed = activities.filter(a => 
      a.type === 'match' && 
      a.participants?.includes(player.id)
    ).length;

    const trainingRatio = trainingSessions > 0 ? matchesPlayed / trainingSessions : 99;

    return {
      ...player,
      trainingRatio
    };
  });

  const activitiesSafe = Array.isArray(activities) ? activities : [];

  // Helper to get available players for the current match in dialog
  const getDialogAllPlayers = () => {
    if (!multiSelectDialog.matchId) return [];
    const currentMatch = sortedMatches.find(m => m.id === multiSelectDialog.matchId);
    if (!currentMatch) return [];
    const matchDate = new Date(currentMatch.date).toDateString();
    const gradeOrder = ['A', 'B', 'C', 'D'];
    return players
      .map(player => {
        // Kontrollera status
        let reason = '';
        let disabled = false;
        if (player.isActive === false) {
          reason = 'Inaktiv';
          disabled = true;
        } else {
          // 2 matcher denna vecka?
          const activityMatch = {
            id: currentMatch.id,
            name: currentMatch.opponent,
            date: currentMatch.date,
            type: 'match' as 'match',
            participants: currentMatch.players || []
          };
          const weekCount = getWeeklyMatchCountForActivity(player.id, activitiesSafe, activityMatch);
          if (weekCount >= 2) {
            reason = '2 matcher denna vecka';
            disabled = true;
          } else {
            // Match samma dag?
            const hasSameDayMatch = activitiesSafe.some(activity =>
              activity.type === 'match' &&
              new Date(activity.date).toDateString() === matchDate &&
              activity.participants?.includes(player.id)
            );
            if (hasSameDayMatch) {
              reason = 'Match samma dag';
              disabled = true;
            }
          }
        }
        const stat = trainingStats.find(s => s.playerId === player.id || s.playerName === player.name);
        const trainingRatio = stat?.trainingMatchRatio ?? 0;
        const activitiesCount = stat?.trainingSessions ?? 0;
        const activityMatch = {
          id: currentMatch.id,
          name: currentMatch.opponent,
          date: currentMatch.date,
          type: 'match' as 'match',
          participants: currentMatch.players || []
        };
        const thisWeekCount = getWeeklyMatchCountForActivity(player.id, activitiesSafe, activityMatch);
        return {
          ...player,
          trainingRatio,
          activitiesCount,
          thisWeekCount,
          reason,
          disabled
        };
      })
      .sort((a, b) => {
        const gradeA = gradeOrder.indexOf(a.grade);
        const gradeB = gradeOrder.indexOf(b.grade);
        if (gradeA !== gradeB) return gradeA - gradeB;
        return b.trainingRatio - a.trainingRatio;
      });
  };

  // CSV upload handler
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (!file.name.endsWith('.csv')) {
        setCsvError("Endast CSV-filer stöds.");
        return;
      }
      const text = await file.text();
      // Hitta raden med kolumnnamn
      const lines = text.split(/\r?\n/);
      let headerIndex = lines.findIndex(line => 
        line.includes('Namn') && line.includes('Aktiviteter kallad till')
      );
      if (headerIndex === -1) {
        setCsvError("Kunde inte hitta kolumnnamn i CSV-filen.");
        return;
      }
      const csvContent = lines.slice(headerIndex).join('\n');
      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
      });
      if (result.errors.length > 0) {
        setCsvError("Fel vid tolkning av CSV: " + result.errors[0].message);
        return;
      }
      // Filtrera bort rader utan namn
      const stats: TrainingStats[] = (result.data as any[])
        .filter(row => row["Namn"] && row["Aktiviteter kallad till"])
        .map(row => {
          // Matcha mot spelare för nivå och aktiviteter
          const player = players.find(p => p.name.trim().toLowerCase() === row["Namn"].trim().toLowerCase());
          const trainingSessions = Number(row["Aktiviteter kallad till"] || 0);
          const matchesPlayed = Number(row["Aktiviteter deltagit i"] || 0);
          const attendanceRatio = row["Andel"] ? parseFloat(row["Andel"].replace('%',''))/100 : (trainingSessions > 0 ? matchesPlayed / trainingSessions : undefined);
          return {
            playerId: player?.id || row["Namn"],
            playerName: row["Namn"],
            level: player?.grade || row["Nivå"] || '',
            activities: player?.activities?.length || Number(row["Aktiviteter"] || 0),
            trainingSessions,
            matchesPlayed,
            trainingMatchRatio: trainingSessions > 0 ? matchesPlayed / trainingSessions : undefined,
            attendanceRatio
          };
        });
      if (stats.length === 0) {
        setCsvError("Ingen giltig närvarodata hittades i filen.");
        return;
      }
      // Spara till Supabase
      await saveTrainingUpload(file.name, stats);
      setTrainingStats(stats);
      toast({
        title: "Träningsstatistik uppladdad",
        description: `${stats.length} spelares statistik har sparats.`
      });
    } catch (err) {
      setCsvError("Kunde inte läsa CSV-filen. Kontrollera formatet.");
      toast({
        title: "Uppladdning misslyckades",
        description: "Kunde inte spara träningsstatistiken.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Laddar spelare och matcher...</div>;
  }

  if (matches.length === 0) {
    return <div className="p-8 text-center text-red-500">Inga matcher finns tillgängliga för de kommande två veckorna.</div>;
  }

  // Match overview table
  return (
    <div className="container mx-auto p-6">
      <h1 className="font-bold mb-6 text-lg">Laguttagning (kommande 2 veckor)</h1>
      <div className="mb-4 flex flex-col gap-2">
        <label className="font-medium">Ladda upp träningsstatistik (CSV):</label>
        <input type="file" accept=".csv" onChange={handleCSVUpload} />
        {csvError && <div className="text-red-500 text-sm">{csvError}</div>}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Tid</TableHead>
            <TableHead>Motståndare</TableHead>
            <TableHead>Plats</TableHead>
            <TableHead>Liga</TableHead>
            <TableHead>Uttagna spelare</TableHead>
            <TableHead>Antal</TableHead>
            <TableHead>Åtgärd</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMatches.map(match => {
            const selectedPlayers = players.filter(p => match.players.includes(p.id));
            return (
              <TableRow key={match.id}>
                <TableCell>{new Date(match.date).toLocaleDateString('sv-SE')}</TableCell>
                <TableCell>{match.time || '-'}</TableCell>
                <TableCell>{match.opponent}</TableCell>
                <TableCell>{match.location || '-'}</TableCell>
                <TableCell>{match.league || '-'}</TableCell>
                <TableCell>
                  {selectedPlayers.length === 0 ? (
                    <span className="text-gray-400">Inga spelare uttagna</span>
                  ) : (
                    <ul className="text-xs">
                      {selectedPlayers.map(p => (
                        <li key={p.id}>
                          {p.name} ({p.grade || '-'}, {typeof p.trainingRatio === 'number' ? (p.trainingRatio * 100).toFixed(0) + '%' : '-'}, {p.matchesCount ?? '-'})
                        </li>
                      ))}
                    </ul>
                  )}
                </TableCell>
                <TableCell>{selectedPlayers.length}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => setSelectedMatchId(match.id)}>
                    Lägg till spelare
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {/* Statistik-tabell */}
      <div className="mt-8">
        <h2 className="font-bold mb-2 text-base">Närvarostatistik</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>Nivå</TableHead>
              <TableHead>Aktiviteter</TableHead>
              <TableHead>Aktiviteter kallad till</TableHead>
              <TableHead>Aktiviteter deltagit i</TableHead>
              <TableHead>Andel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingStats.map(stat => (
              <TableRow key={stat.playerId || stat.playerName}>
                <TableCell>{stat.playerName}</TableCell>
                <TableCell>{stat.level || '-'}</TableCell>
                <TableCell>{stat.activities || '-'}</TableCell>
                <TableCell>{stat.trainingSessions}</TableCell>
                <TableCell>{stat.matchesPlayed}</TableCell>
                <TableCell>{typeof stat.attendanceRatio === 'number' ? (stat.attendanceRatio * 100).toFixed(0) + '%' : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
