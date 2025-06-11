import React, { useState, useEffect } from "react";
import { TrainingStatsUpload } from "@/components/TrainingStatsUpload";
import { UpcomingMatches } from "@/components/UpcomingMatches";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  // Hämta aktiviteter och spelare via hook
  const {
    filteredActivities,
    activities,
    isLoading,
    handleActivityUpdate,
  } = useActivities([], () => {}); // tomma arrays tills vidare

  // Filtrera ut kommande matcher
  const now = new Date();
  const upcomingMatches = filteredActivities.filter(
    (a: any) => a.type === 'match' && new Date(a.date) >= now
  );

  // Hämta spelare
  const { players } = usePlayers();

  // Hämta ligor vid mount
  useEffect(() => {
    async function fetchLeagues() {
      const { data, error } = await supabase.from("leagues").select("*");
      if (data) {
        setLeagues(data);
        const map: Record<string, string> = {};
        data.forEach((l: any) => {
          // Rensa namn från dubbletter av år
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

  // Ladda träningsstatistik från localStorage vid sidladdning
  useEffect(() => {
    const savedStats = localStorage.getItem('trainingStats');
    if (savedStats) {
      try {
        setTrainingStats(JSON.parse(savedStats));
      } catch {}
    }
  }, []);

  // Hjälpfunktion för att extrahera motståndare
  function extractOpponent(matchName: string) {
    if (!matchName) return '';
    const parts = matchName.split(' - ');
    if (parts.length === 2) {
      // Om Hässleholms IF är först, ta andra parten. Om sist, ta första.
      if (parts[0].toLowerCase().includes('hässleholms if')) return parts[1].trim();
      if (parts[1].toLowerCase().includes('hässleholms if')) return parts[0].trim();
      // Annars ta andra parten som default
      return parts[1].trim();
    }
    return matchName;
  }

  // Hårdkodad liganamn-mappning enligt klubbens standard
  function getPrettyLeagueName(league: string) {
    if (league.includes("2013 A")) return "2013 A";
    if (league.includes("2014 A1")) return "2014 A1";
    if (league.includes("2014 A2")) return "2014 A2";
    if (league.includes("2014 B1")) return "2014 B1";
    return league;
  }

  // Sort leagues in the order: 2014 B1, 2013 A, 2014 A1, 2014 A2
  const leagueSortOrder = [
    '2014 B1',
    '2013 A',
    '2014 A1',
    '2014 A2',
  ];

  // Mappa Activity till Match
  const mappedUpcomingMatches = upcomingMatches.map((a: any) => {
    // Hämta liganamn från map
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
      requiredPlayers: 11, // Just nu default, kan hämtas från Activity om det finns
      status: (a.status as 'scheduled' | 'completed' | 'cancelled') || 'scheduled',
      rawActivity: a, // Spara originalet för vidare användning
    };
  });

  // Initiera sortedMatches endast vid första mount
  useEffect(() => {
    const sorted = mappedUpcomingMatches.slice().sort((a, b) => {
      const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
      const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
      return dateA.getTime() - dateB.getTime();
    });
    setSortedMatches(sorted);
  }, [mappedUpcomingMatches]);

  // Spara träningsstatistik till localStorage när ny fil laddas upp
  const handleStatsUploaded = (stats: TrainingStats[]) => {
    // Beräkna trainingMatchRatio för varje spelare
    const statsWithRatio = stats.map(s => ({
      ...s,
      trainingMatchRatio: s.trainingSessions > 0 ? (s.matchesPlayed / s.trainingSessions) : 99
    }));
    setTrainingStats(statsWithRatio);
    localStorage.setItem('trainingStats', JSON.stringify(statsWithRatio));
  };

  // State för lagförslag
  const [suggestedLineup, setSuggestedLineup] = useState<{matchId: string, playerIds: string[]} | null>(null);
  const [showLineupFor, setShowLineupFor] = useState<string | null>(null);

  // State för "lägg till spelare"-popup
  const [addPlayerMatchId, setAddPlayerMatchId] = useState<string | null>(null);

  // Förbättrad nivå-prio beroende på liga
  function normalizeLeagueName(league: string): string {
    // Ta bort parenteser och allt inom dem, trimma och gör till versaler
    return league.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
  }

  // Prioriteringsregler enligt klubbens önskemål:
  // 2013 A: A > B > C > D
  // 2014 A2: A > B > C > D
  // 2014 A1: B > A > C > D
  // 2014 B1: C > D > B > A
  function getLeaguePriorityArray(league: string): string[] {
    const norm = normalizeLeagueName(league);
    if (norm === "2013 A") return ['A', 'B', 'C', 'D'];
    if (norm === "2014 A2") return ['A', 'B', 'C', 'D'];
    if (norm === "2014 A1") return ['B', 'A', 'C', 'D'];
    if (norm === "2014 B1") return ['C', 'D', 'B', 'A'];
    return ['A', 'B', 'C', 'D'];
  }

  // Funktion för att föreslå lag enligt prioriteringsregler
  const handleSuggestLineup = (match: any) => {
    setShowLineupFor(match.id);
    // 1. Filtrera bort spelare som redan är med i matchen eller är dubbelbokade samma dag
    const matchDate = match.date;
    const sameDayMatches = upcomingMatches.filter((m: any) => m.date === matchDate && m.id !== match.id);
    const unavailablePlayerIds = new Set<string>();
    sameDayMatches.forEach((m: any) => m.players.forEach((pid: string) => unavailablePlayerIds.add(pid)));
    match.players.forEach((pid: string) => unavailablePlayerIds.add(pid));
    // 2. Räkna matcher denna vecka för varje spelare
    function getWeeklyMatchCount(playerId: string) {
      const refDate = new Date(matchDate);
      const startOfWeek = new Date(refDate);
      const dayOfWeek = refDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(refDate.getDate() - daysToSubtract);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return activities.filter((a: any) => {
        const d = new Date(a.date);
        return a.type === 'match' && a.participants?.includes(playerId) && d >= startOfWeek && d <= endOfWeek;
      }).length;
    }
    // 3. Hämta träningsnärvaro
    function getTrainingRatio(playerId: string) {
      const stat = trainingStats.find(s => s.playerId === playerId);
      return stat ? stat.trainingMatchRatio : 0;
    }
    // 4. Prioritera enligt nivå, matcher/vecka, träningsnärvaro
    const availablePlayers = players.filter(p => {
      const stat = trainingStats.find(s => s.playerId === p.id || s.playerName === p.name);
      if (!stat) return false;
      if (getWeeklyMatchCount(p.id) >= 2) return false;
      if (unavailablePlayerIds.has(p.id)) return false;
      return true;
    });
    const leaguePriority = getLeaguePriorityArray(match.league);
    const sorted = [...availablePlayers].sort((a, b) => {
      // 1. Nivå-prio enligt liga (case-insensitive, normaliserad)
      const normGradeA = (a.grade || 'D').toString().trim().toUpperCase();
      const normGradeB = (b.grade || 'D').toString().trim().toUpperCase();
      const prioA = leaguePriority.findIndex(g => g.toUpperCase() === normGradeA);
      const prioB = leaguePriority.findIndex(g => g.toUpperCase() === normGradeB);
      if (prioA !== prioB) return prioA - prioB;
      // 2. Inom samma prio: sortera på träningsratio (högst först)
      const statA = trainingStats.find(s => s.playerId === a.id || s.playerName === a.name);
      const statB = trainingStats.find(s => s.playerId === b.id || s.playerName === b.name);
      const ratioA = statA && statA.trainingSessions > 0 ? statA.matchesPlayed / statA.trainingSessions : 0;
      const ratioB = statB && statB.trainingSessions > 0 ? statB.matchesPlayed / statB.trainingSessions : 0;
      return ratioB - ratioA;
    });
    setSuggestedLineup({ matchId: match.id, playerIds: sorted.slice(0, match.requiredPlayers).map(p => p.id) });
  };

  // Testfunktion för prioritering
  function testLeaguePrioritySort() {
    const testLeagues = [
      "2014 B1",
      "2014 B1 (C)",
      "2014 A1",
      "2014 A2",
      "2013 A",
      "2014 C"
    ];
    const testPlayers = [
      { name: "Acke", grade: "A" },
      { name: "Bosse", grade: "B" },
      { name: "Calle", grade: "C" },
      { name: "Doris", grade: "D" },
      { name: "Egon", grade: undefined },
      { name: "Fia", grade: "c" },
      { name: "Gunnar", grade: "d" },
    ];
    testLeagues.forEach(league => {
      const prio = getLeaguePriorityArray(league);
      const sorted = [...testPlayers].sort((a, b) => {
        const normGradeA = (a.grade || 'D').toString().trim().toUpperCase();
        const normGradeB = (b.grade || 'D').toString().trim().toUpperCase();
        const prioA = prio.findIndex(g => g.toUpperCase() === normGradeA);
        const prioB = prio.findIndex(g => g.toUpperCase() === normGradeB);
        return prioA - prioB;
      });
      console.log(`\nLIGA: ${league}  PRIORITY: ${JSON.stringify(prio)}`);
      sorted.forEach(p => {
        const normGrade = (p.grade || 'D').toString().trim().toUpperCase();
        const prioIndex = prio.findIndex(g => g.toUpperCase() === normGrade);
        console.log(`  ${p.name} (${p.grade}) -> ${normGrade} prioIndex: ${prioIndex}`);
      });
    });
  }

  // Funktion för att rekommendera spelare till en match (sorterad lista)
  const getRecommendedPlayers = (match: any) => {
    if (!match) return [];
    const matchDate = match.date;
    // Bygg unavailablePlayerIds baserat på alla aktiviteter samma dag (inte bara matcher)
    const sameDayActivities = activities.filter((a: any) => a.date === matchDate && a.id !== match.id);
    const unavailablePlayerIds = new Set<string>();
    sameDayActivities.forEach((a: any) => (a.participants || []).forEach((pid: string) => unavailablePlayerIds.add(pid)));
    (match.players || []).forEach((pid: string) => unavailablePlayerIds.add(pid));
    function getWeeklyMatchCount(playerId: string) {
      const refDate = new Date(matchDate);
      const startOfWeek = new Date(refDate);
      const dayOfWeek = refDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(refDate.getDate() - daysToSubtract);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return activities.filter((a: any) => {
        const d = new Date(a.date);
        return a.type === 'match' && a.participants?.includes(playerId) && d >= startOfWeek && d <= endOfWeek;
      }).length;
    }
    const leaguePriority = getLeaguePriorityArray(match.league);
    console.log('LIGA:', match.league, 'PRIO:', leaguePriority);
    const availablePlayers = players.filter(p => {
      const stat = trainingStats.find(s => s.playerId === p.id || s.playerName === p.name);
      if (!stat) return false;
      if (getWeeklyMatchCount(p.id) >= 2) return false;
      if (unavailablePlayerIds.has(p.id)) return false;
      return true;
    });
    const sorted = [...availablePlayers].sort((a, b) => {
      // 1. Nivå-prio enligt liga (case-insensitive, normaliserad)
      const normGradeA = (a.grade || 'D').toString().trim().toUpperCase();
      const normGradeB = (b.grade || 'D').toString().trim().toUpperCase();
      const prioA = leaguePriority.findIndex(g => g.toUpperCase() === normGradeA);
      const prioB = leaguePriority.findIndex(g => g.toUpperCase() === normGradeB);
      if (prioA !== prioB) return prioA - prioB;
      // 2. Inom samma prio: sortera på träningsratio (högst först)
      const statA = trainingStats.find(s => s.playerId === a.id || s.playerName === a.name);
      const statB = trainingStats.find(s => s.playerId === b.id || s.playerName === b.name);
      const ratioA = statA && statA.trainingSessions > 0 ? statA.matchesPlayed / statA.trainingSessions : 0;
      const ratioB = statB && statB.trainingSessions > 0 ? statB.matchesPlayed / statB.trainingSessions : 0;
      return ratioB - ratioA;
    });
    return sorted;
  };

  // Lägg till/tar bort spelare till/från match och spara till aktiviteter
  const fetchAndSetMatches = async () => {
    const activities = await getStoredActivities();
    const now = new Date();
    const leagueMapLocal = leagueMap; // använd senaste leagueMap
    const mappedUpcomingMatches = activities
      .filter((a: any) => a.type === 'match' && new Date(a.date) >= now)
      .map((a: any) => {
        let leagueName = '';
        if (a.leagueId && leagueMapLocal[a.leagueId]) leagueName = leagueMapLocal[a.leagueId];
        else if (a.league_id && leagueMapLocal[a.league_id]) leagueName = leagueMapLocal[a.league_id];
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
          status: (a.status as 'scheduled' | 'completed' | 'cancelled') || 'scheduled',
          rawActivity: a,
        };
      });
    const sorted = mappedUpcomingMatches.slice().sort((a, b) => {
      const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
      const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
      return dateA.getTime() - dateB.getTime();
    });
    setSortedMatches(sorted);
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

  // Prioriteringslogik för A-B-C-D
  function getPlayerPriority(league: string, player: Player) {
    // 2013 A (A), 2014 A1 (A), 2014 A2 (B), 2014 B1 (C,D)
    if (!player.grade) return 99;
    if (["2013 A", "2014 A1"].includes(league)) return player.grade === 'A' ? 1 : 2;
    if (["2014 A2"].includes(league)) return player.grade === 'B' ? 1 : 2;
    if (["2014 B1"].includes(league)) return ['C', 'D'].includes(player.grade) ? 1 : 2;
    return 3;
  }

  // Hjälpfunktion för motivering
  function getPlayerReasoning(player: Player, match: any) {
    const prio = getPlayerPriority(match.league, player);
    const weekMatches = (() => {
      const refDate = new Date(match.date);
      const startOfWeek = new Date(refDate);
      const dayOfWeek = refDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(refDate.getDate() - daysToSubtract);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return activities.filter((a: any) => {
        const d = new Date(a.date);
        return a.type === 'match' && a.participants?.includes(player.id) && d >= startOfWeek && d <= endOfWeek;
      }).length;
    })();
    const ratio = (() => {
      const stat = trainingStats.find(s => s.playerId === player.id);
      return stat ? stat.trainingMatchRatio : null;
    })();
    let reason = [];
    reason.push(`Nivå: ${player.grade || '-'}`);
    reason.push(`Matcher denna vecka: ${weekMatches}`);
    reason.push(`Träning/match-ratio: ${ratio != null ? ratio.toFixed(2) : '-'}`);
    if (prio === 1) reason.push('Passar ligan');
    if (weekMatches === 0) reason.push('Ej spelat denna vecka');
    if (ratio >= 1.5) reason.push('Hög träningsnärvaro');
    return reason.join(' • ');
  }

  // Sortera trainingStats
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

  // --- Spara och återställ aktiv tab ---
  const [activeTabId, setActiveTabId] = useState(() => getActiveTab() || 'team-selection');

  useEffect(() => {
    localStorage.setItem('activeTabId', activeTabId);
  }, [activeTabId]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Laguttagning</h1>
      
      <div className="grid gap-6">
        {/* Kompakt träningsstatistik överst */}
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
          renderExtraActions={(match) => (
            <button
              onClick={() => setAddPlayerMatchId(match.id)}
              className="p-1 hover:bg-muted rounded-full"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        />

        {/* Popup för att lägga till spelare med rekommendationer */}
        {addPlayerMatchId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Lägg till spelare</h2>
                <button
                  onClick={() => setAddPlayerMatchId(null)}
                  className="p-1 hover:bg-muted rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left w-48">Namn</th>
                      <th className="px-4 py-2 text-left w-24">Nivå</th>
                      <th className="px-4 py-2 text-left w-24">Aktiviteter</th>
                      <th className="px-4 py-2 text-left w-32">Träningsratio</th>
                      <th className="px-4 py-2 text-left w-24">Denna vecka</th>
                      <th className="px-4 py-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {players
                      .map(player => {
                        const stat = trainingStats.find(s => s.playerId === player.id || s.playerName === player.name);
                        const isAlreadyAdded = sortedMatches
                          .find(m => m.id === addPlayerMatchId)
                          ?.players.includes(player.id);
                        if (!stat || isAlreadyAdded) return null;

                        // Aktiviteter totalt
                        const playerActivities = activities.filter(a => a.participants && a.participants.includes(player.id));
                        const activityCount = playerActivities.length;
                        // Ratio
                        const ratio = stat.trainingSessions > 0 ? (stat.matchesPlayed / stat.trainingSessions) : 0;
                        // Matcher denna vecka
                        const match = sortedMatches.find(m => m.id === addPlayerMatchId);
                        let weekCount = 0;
                        if (match) {
                          const refDate = new Date(match.date);
                          const startOfWeek = new Date(refDate);
                          const dayOfWeek = refDate.getDay();
                          const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                          startOfWeek.setDate(refDate.getDate() - daysToSubtract);
                          startOfWeek.setHours(0, 0, 0, 0);
                          const endOfWeek = new Date(startOfWeek);
                          endOfWeek.setDate(startOfWeek.getDate() + 6);
                          endOfWeek.setHours(23, 59, 59, 999);
                          weekCount = activities.filter(a => {
                            const d = new Date(a.date);
                            return a.type === 'match' && a.participants?.includes(player.id) && d >= startOfWeek && d <= endOfWeek;
                          }).length;
                        }
                        // Filtrera bort spelare med 2 eller fler aktiviteter denna vecka
                        if (weekCount >= 2) return null;
                        return {
                          player,
                          stat,
                          activityCount,
                          ratio,
                          weekCount
                        };
                      })
                      .filter(Boolean)
                      .sort((a, b) => {
                        // Sortera på nivå först (A först), därefter på träningsratio (högst först)
                        const gradeOrder = (grade) => {
                          if (!grade) return 99;
                          if (grade.toUpperCase() === 'A') return 0;
                          if (grade.toUpperCase() === 'B') return 1;
                          if (grade.toUpperCase() === 'C') return 2;
                          return 99;
                        };
                        const gradeA = gradeOrder(a.player.grade);
                        const gradeB = gradeOrder(b.player.grade);
                        if (gradeA !== gradeB) return gradeA - gradeB;
                        return b.ratio - a.ratio;
                      })
                      .map(({ player, stat, activityCount, ratio, weekCount }) => (
                        <tr key={player.id} className="bg-muted hover:bg-accent cursor-pointer rounded-lg text-sm h-8">
                          <td className="px-3 py-1 font-medium whitespace-nowrap">{player.name}</td>
                          <td className="px-3 py-1 whitespace-nowrap">{player.grade || '-'}</td>
                          <td className="px-3 py-1 whitespace-nowrap">{activityCount}</td>
                          <td className="px-3 py-1 whitespace-nowrap">{ratio > 0 ? ratio.toFixed(2) : '-'}</td>
                          <td className="px-3 py-1 whitespace-nowrap">{weekCount}</td>
                          <td className="px-3 py-1 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const match = sortedMatches.find(m => m.id === addPlayerMatchId);
                                if (match) {
                                  handlePlayerAssignment(match.id, player.id);
                                }
                                setAddPlayerMatchId(null);
                              }}
                              className="p-1 hover:bg-primary/10 rounded-full"
                              title="Lägg till spelare"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Närvarostatistik längst ner */}
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
                    activityCount = activities.filter(a => a.participants && a.participants.includes(stat.playerId)).length;
                  }
                  return (
                    <tr key={stat.playerId}>
                      <td className="border px-2 py-1">{stat.playerName}</td>
                      <td className="border px-2 py-1 text-center">{player?.grade || '-'}</td>
                      <td className="border px-2 py-1 text-center">{stat.trainingSessions}</td>
                      <td className="border px-2 py-1 text-center">{stat.matchesPlayed}</td>
                      <td className="border px-2 py-1 text-center">{stat.trainingMatchRatio != null ? stat.trainingMatchRatio.toFixed(2) : '-'}</td>
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