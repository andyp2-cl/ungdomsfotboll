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
import { getLatestTrainingUpload } from "@/lib/supabase/trainingUploads";
import { 
  isPlayerAvailableForMatch, 
  getThisWeekMatchCount, 
  sortPlayersByGradeAndRatio 
} from "@/utils/teamSelectionUtils";

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
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    players
  } = usePlayers();

  const {
    filteredActivities,
    isLoading,
    handleActivityUpdate
  } = useActivities(players, () => {});

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

  // Filter for upcoming matches that haven't been played yet
  const upcomingMatches = Array.isArray(filteredActivities) ? filteredActivities.filter((a: Activity) => {
    if (!a || !a.date) return false;

    const matchDate = new Date(a.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    // Check if it's a match (including cup matches)
    const isMatch = a.type === 'match' || a.type === 'cup';
    
    // Check if it's in the future
    const isFutureMatch = matchDate >= today;
    
    // Check if it's not completed or cancelled
    const isNotCompleted = a.status !== 'completed' && a.status !== 'cancelled';
    
    // For cup matches, we don't check scores
    const isCupMatch = a.cupId || a.cupName;
    
    // For regular matches, check scores
    const isRegularMatch = !isCupMatch && !a.homeScore && !a.awayScore;
    
    // Include both cup matches and regular matches that haven't been played
    return isMatch && isFutureMatch && isNotCompleted && (isCupMatch || isRegularMatch);
  }) : [];

  const mappedUpcomingMatches = upcomingMatches.map((a: Activity) => {
    let leagueName = '';
    if (a.leagueId && leagueMap[a.leagueId]) leagueName = leagueMap[a.leagueId];
    else if (a.league_id && leagueMap[a.league_id]) leagueName = leagueMap[a.league_id];
    else leagueName = a.leagueId || a.league_id || '';
    
    // For cup matches, use the cup name as the league
    if (a.cupName) {
      leagueName = a.cupName;
    }
    
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

    // Update local state immediately for better UX
    setSortedMatches(prevMatches => 
      prevMatches.map(m => 
        m.id === matchId 
          ? { ...m, players: [...m.players, playerId] }
          : m
      )
    );

    try {
      const { error } = await supabase
        .from('player_activities')
        .insert({
          id: crypto.randomUUID(),
          player_id: playerId,
          activity_id: matchId
        });

      if (error) {
        throw error;
      }

      // Update the activity in the activities state
      const updatedActivity = {
        ...match.rawActivity,
        participants: [...match.players, playerId]
      };
      
      await handleActivityUpdate(updatedActivity);

      toast({
        title: "Spelare tillagd",
        description: "Spelaren har lagts till i matchen.",
      });
    } catch (error) {
      console.error('Error assigning player:', error);
      
      // Revert local state on error
      setSortedMatches(prevMatches => 
        prevMatches.map(m => 
          m.id === matchId 
            ? { ...m, players: m.players.filter(p => p !== playerId) }
            : m
        )
      );

      toast({
        title: "Fel vid tilldelning",
        description: "Ett fel uppstod när spelaren skulle läggas till i matchen.",
        variant: "destructive"
      });
    }
  };

  const handlePlayerRemoval = async (matchId: string, playerId: string) => {
    const match = sortedMatches.find(m => m.id === matchId);
    if (!match) return;

    try {
      // First, try to delete from database
      const { error } = await supabase
        .from('player_activities')
        .delete()
        .eq('activity_id', matchId)
        .eq('player_id', playerId);

      if (error) {
        toast({
          title: "Kunde inte ta bort spelare",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // If database operation was successful, update local states
      setSortedMatches(prevMatches => 
        prevMatches.map(m => 
          m.id === matchId 
            ? { ...m, players: m.players.filter(id => id !== playerId) }
            : m
        )
      );

      // Update activities state to sync with other views
      const activity = filteredActivities.find(a => a.id === matchId);
      if (activity) {
        const updatedActivity = {
          ...activity,
          participants: activity.participants?.filter(id => id !== playerId) || []
        };
        await handleActivityUpdate(updatedActivity);
      }

      toast({
        title: "Spelare borttagen",
        description: "Spelaren har tagits bort från matchen"
      });
    } catch (error) {
      console.error('Error removing player:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte ta bort spelaren från matchen",
        variant: "destructive"
      });
    }
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

  const handleMultiPlayerSave = async (selectedIds: string[], matchId: string) => {
    try {
      setIsProcessing(true);
      
      // Get the match we're adding players to
      const match = sortedMatches.find(m => m.id === matchId);
      if (!match || !match.rawActivity) {
        throw new Error("Could not find match");
      }
      
      // Convert raw activity to proper Activity type
      const activity: Activity = {
        ...match.rawActivity,
        type: match.rawActivity.type || 'match',
        name: match.rawActivity.name || match.opponent,
        participants: Array.isArray(match.rawActivity.participants) ? match.rawActivity.participants : match.players || [],
        player_stats: typeof match.rawActivity.player_stats === 'object' ? match.rawActivity.player_stats : {}
      };
      
      // Get current participants
      const currentParticipants = activity.participants;
      
      // Filter out any already participating players
      const uniqueSelectedIds = selectedIds.filter(id => !currentParticipants.includes(id));
      
      if (uniqueSelectedIds.length === 0) {
        toast({
          title: "Inga nya spelare",
          description: "Alla valda spelare är redan tillagda."
        });
        return;
      }
      
      // For cup matches, we need to update both the match and the parent cup
      if (activity.cupId) {
        try {
          // First add players to player_activities table for the match
          const insertPromises = uniqueSelectedIds.map(playerId => 
            supabase
              .from('player_activities')
              .insert({
                id: crypto.randomUUID(),
                player_id: playerId,
                activity_id: matchId
              })
          );

          await Promise.all(insertPromises);

          // Update the match with new participants
          const updatedMatch = {
            ...activity,
            participants: [...currentParticipants, ...uniqueSelectedIds]
          };

          // Update the match in activities table
          const { error: matchUpdateError } = await supabase
            .from('activities')
            .update({ 
              participants: updatedMatch.participants,
              player_stats: updatedMatch.player_stats
            })
            .eq('id', matchId);

          if (matchUpdateError) throw matchUpdateError;
          
          // Then get and update the parent cup
          const { data: parentCup } = await supabase
            .from('activities')
            .select('*')
            .eq('id', activity.cupId)
            .single();
            
          if (parentCup) {
            // Convert database record to Activity type
            const dbCup = parentCup as any;
            const cupActivity: Activity = {
              id: dbCup.id,
              type: 'cup',
              name: dbCup.name || '',
              date: dbCup.date,
              participants: Array.isArray(dbCup.participants) ? dbCup.participants : [],
              player_stats: typeof dbCup.player_stats === 'object' ? dbCup.player_stats : {}
            };
            
            // Update cup participants
            const updatedCupParticipants = Array.from(new Set([
              ...cupActivity.participants,
              ...uniqueSelectedIds
            ]));

            // Update the cup in activities table
            const { error: cupUpdateError } = await supabase
              .from('activities')
              .update({ 
                participants: updatedCupParticipants,
                player_stats: cupActivity.player_stats
              })
              .eq('id', cupActivity.id);

            if (cupUpdateError) throw cupUpdateError;

            // Also add players to player_activities for the cup
            const cupInsertPromises = uniqueSelectedIds.map(playerId => 
              supabase
                .from('player_activities')
                .insert({
                  id: crypto.randomUUID(),
                  player_id: playerId,
                  activity_id: cupActivity.id
                })
            );

            await Promise.all(cupInsertPromises);
          }
          
          // Update local state
          setSortedMatches(prevMatches => 
            prevMatches.map(m => {
              if (m.id === matchId) {
                return {
                  ...m,
                  players: [...(m.players || []), ...uniqueSelectedIds],
                  rawActivity: {
                    ...m.rawActivity,
                    participants: [...(m.rawActivity?.participants || []), ...uniqueSelectedIds]
                  }
                };
              }
              return m;
            })
          );

          toast({
            title: "Spelare tillagda",
            description: `${uniqueSelectedIds.length} spelare har lagts till.`
          });
        } catch (error) {
          console.error('Error updating cup match:', error);
          toast({
            title: "Ett fel uppstod",
            description: "Kunde inte lägga till spelarna i cup-matchen",
            variant: "destructive"
          });
        }
        return;
      }

      // For regular matches, add players to player_activities table
      const insertPromises = uniqueSelectedIds.map(playerId => 
        supabase
          .from('player_activities')
          .insert({
            id: crypto.randomUUID(),
            player_id: playerId,
            activity_id: matchId
          })
      );

      const results = await Promise.allSettled(insertPromises);
      const successfulIds = uniqueSelectedIds.filter((_, index) => 
        results[index].status === 'fulfilled' && !(results[index] as PromiseFulfilledResult<any>).value.error
      );

      // Update local state
      setSortedMatches(prevMatches => 
        prevMatches.map(m => {
          if (m.id === matchId) {
            return {
              ...m,
              players: [...(m.players || []), ...successfulIds],
              rawActivity: {
                ...m.rawActivity,
                participants: [...(m.rawActivity?.participants || []), ...successfulIds]
              }
            };
          }
          return m;
        })
      );

      // Update activities state
      const updatedActivity = {
        ...activity,
        participants: [...currentParticipants, ...successfulIds]
      };

      // Update the activity in the database
      const { error: updateError } = await supabase
        .from('activities')
        .update({ 
          participants: updatedActivity.participants,
          player_stats: updatedActivity.player_stats
        })
        .eq('id', matchId);

      if (updateError) throw updateError;

      toast({
        title: "Spelare tillagda",
        description: `${successfulIds.length} av ${uniqueSelectedIds.length} spelare har lagts till.`
      });
    } catch (error) {
      console.error('Error in handleMultiPlayerSave:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte lägga till alla spelare. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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

  // Filter and sort available players - NOW WITH GRADE SORTING
  const availablePlayers = React.useMemo(() => {
    if (!currentMatch) return [];
    
    // Filter out players already in the match
    const playersNotInMatch = players.filter(player => 
      !currentMatch.players.includes(player.id)
    );
    
    // Filter out players who can't be selected due to match restrictions
    const availablePlayersForSelection = playersNotInMatch.filter(player =>
      isPlayerAvailableForMatch(player.id, currentMatch.date, filteredActivities)
    );

    // Filtrera bort inaktiva spelare
    const onlyActivePlayers = availablePlayersForSelection.filter(
      player => player.isActive !== false // Default till true om undefined
    );
    
    // Sort by grade (A first) and training ratio
    return sortPlayersByGradeAndRatio(onlyActivePlayers, trainingStats);
  }, [players, currentMatch, filteredActivities, trainingStats]);

  // Updated function to count only matches this week
  const getThisWeekMatches = (playerId: string) => {
    return currentMatch ? getThisWeekMatchCount(playerId, filteredActivities, currentMatch.date) : 0;
  };

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
        />

        {/* Multi-select dialog */}
        <Dialog 
          open={multiSelectDialog.open} 
          onOpenChange={(open) => {
            if (!open) {
              setMultiSelectDialog({ open: false, matchId: null });
              setSelectedPlayerIds([]);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                Lägg till spelare - {currentMatch?.opponent}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-hidden">
              <div className="overflow-auto max-h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Namn</TableHead>
                      <TableHead>Nivå</TableHead>
                      <TableHead>Träningsaktiviteter</TableHead>
                      <TableHead>Träningsratio</TableHead>
                      <TableHead>Matcher denna vecka</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availablePlayers.map(player => {
                      const stats = trainingStats.find(s => s.playerName === player.name);
                      const thisWeekMatches = getThisWeekMatches(player.id);
                      
                      return (
                        <TableRow key={player.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedPlayerIds.includes(player.id)}
                              onCheckedChange={() => handlePlayerToggle(player.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {player.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>{stats?.trainingSessions || '-'}</TableCell>
                          <TableCell>
                            {stats?.trainingMatchRatio ? stats.trainingMatchRatio.toFixed(2) : '-'}
                          </TableCell>
                          <TableCell>{thisWeekMatches}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setMultiSelectDialog({ open: false, matchId: null })}
                >
                  Avbryt
                </Button>
                <Button 
                  onClick={() => handleMultiPlayerSave(selectedPlayerIds, currentMatch?.id || '')}
                  disabled={selectedPlayerIds.length === 0 || isProcessing}
                >
                  Bekräfta ({selectedPlayerIds.length} spelare)
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
                    activityCount = filteredActivities.filter(a => 
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
