import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";
import { KPISection } from "./KPISection";
import { ChartSection } from "./ChartSection";
import { isTrainer } from "@/utils/positionUtils";
import { calculateGoalStats } from "@/components/player-management/statistics/goals/calculateGoalStats";
import { Trophy, Users, TrendingUp, Target, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getOpponentName, isHomeMatch } from '@/utils/playerCombinations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";
import { MonthlyActivityChart } from "@/components/MonthlyActivityChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { MatchStatsCard } from "../matches/MatchStatsCard";

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
  gradeData: { grade: string; players: number }[];
  onPlayerSelect?: (playerId: string) => void;
  isMobile?: boolean;
}

export function OverviewTabContent({ 
  players, 
  activities, 
  gradeData, 
  onPlayerSelect,
  isMobile = false 
}: OverviewTabContentProps) {
  // Calculate activity count by grade
  const activityCountByGrade = gradeData.map(gradeInfo => {
    const gradePlayers = players.filter(p => p.grade === gradeInfo.grade && !isTrainer(p.positions));
    const playerIds = gradePlayers.map(p => p.id);
    
    let totalActivities = 0;
    
    playerIds.forEach(playerId => {
      const playerActivities = activities.filter(a => 
        a.participants?.includes(playerId)
      ).length;
      
      totalActivities += playerActivities;
    });
    
    const averageActivities = gradePlayers.length > 0 
      ? Math.round(totalActivities / gradePlayers.length * 10) / 10 
      : 0;
    
    return {
      grade: gradeInfo.grade,
      count: totalActivities,
      players: gradeInfo.players,
      average: averageActivities
    };
  });
  
  // Calculate goal statistics for players
  const { playerStats } = calculateGoalStats(activities, players);
  
  // Calculate player activity data with goals per match
  const playerActivityData = players
    .filter(player => !isTrainer(player.positions))
    .map(player => {
      const activityCount = activities.filter(activity => 
        activity.participants?.includes(player.id)
      ).length;
      
      // Find goal stats for this player
      const goalStat = playerStats.find(stat => stat.playerId === player.id);
      const goalsPerMatch = goalStat && goalStat.matches > 0 
        ? Number((goalStat.goals / goalStat.matches).toFixed(2))
        : 0;
      
      return {
        id: player.id,
        name: player.name,
        grade: player.grade,
        jerseyNumber: player.jerseyNumber,
        activities: activityCount,
        activityCount: activityCount,
        goalsPerMatch: goalsPerMatch
      };
    })
    .sort((a, b) => b.activities - a.activities);

  // Calculate team trends data
  const monthlyData = React.useMemo(() => {
    const months = new Map<string, { matches: number; goals: number; wins: number; draws: number; losses: number; goalsConceded: number }>();

    activities.filter(a => a.type === "match" && new Date(a.date) < new Date()).forEach(activity => {
      const date = new Date(activity.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!months.has(monthKey)) {
        months.set(monthKey, { matches: 0, goals: 0, wins: 0, draws: 0, losses: 0, goalsConceded: 0 });
      }

      const data = months.get(monthKey)!;
      data.matches++;
      const isHome = activity.homeTeam?.toLowerCase().includes('hässleholms if');
      data.goals += isHome ? (activity.homeScore || 0) : (activity.awayScore || 0);
      data.goalsConceded += isHome ? (activity.awayScore || 0) : (activity.homeScore || 0);
      if (activity.homeScore === activity.awayScore) data.draws++;
      else if (activity.isWin === true) data.wins++;
      else if (activity.isWin === false) data.losses++;
    });

    return Array.from(months.entries())
      .map(([month, data]) => ({
        month,
        ...data,
        winRate: data.matches > 0 ? Math.round((data.wins / data.matches) * 100) : 0,
        goalDiff: data.goals - data.goalsConceded
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [activities]);

  const gradeChartConfig = {
    average: {
      label: "Genomsnitt per spelare",
    },
    gradeColors: {}
  };
  
  const playerChartConfig = {
    activities: {
      label: "Antal aktiviteter",
    },
    gradeColors: {}
  };

  // Handle player chart click
  const handlePlayerChartClick = (playerId: string) => {
    console.log("OverviewTabContent: Player chart clicked:", playerId);
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    }
  };

  const gridCols = isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  const topPlayersCount = isMobile ? 5 : 10;

  // 1. Lagets prestationer
  const matchActivities = activities.filter(a => {
    if (a.type !== "match") return false;
    const activityDate = new Date(a.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activityDate < today;
  });
  const totalMatches = matchActivities.length;
  const wins = matchActivities.filter(m => m.isWin === true).length;
  const draws = matchActivities.filter(m => m.homeScore === m.awayScore).length;
  const losses = matchActivities.filter(m => m.isWin === false && m.homeScore !== m.awayScore).length;
  
  // Calculate goals scored and conceded based on home/away team
  const goalsScored = matchActivities.reduce((sum, activity) => {
    const isHome = activity.homeTeam?.toLowerCase().includes('hässleholms if');
    return sum + (isHome ? (activity.homeScore || 0) : (activity.awayScore || 0));
  }, 0);
  
  const goalsConceded = matchActivities.reduce((sum, activity) => {
    const isHome = activity.homeTeam?.toLowerCase().includes('hässleholms if');
    return sum + (isHome ? (activity.awayScore || 0) : (activity.homeScore || 0));
  }, 0);
  
  const goalDiff = goalsScored - goalsConceded;
  const avgGoalsFor = totalMatches > 0 ? (goalsScored / totalMatches).toFixed(2) : "0.00";
  const avgGoalsAgainst = totalMatches > 0 ? (goalsConceded / totalMatches).toFixed(2) : "0.00";
  // Längsta vinst/förlustsvit
  function getStreak(type: 'win'|'loss') {
    let max = 0, current = 0;
    for (const m of matchActivities) {
      const isType = (type === 'win' ? m.isWin === true : m.isWin === false && m.homeScore !== m.awayScore);
      if (isType) { current++; max = Math.max(max, current); } else { current = 0; }
    }
    return max;
  }
  const winStreak = getStreak('win');
  const lossStreak = getStreak('loss');

  // 2. Topp-listor
  // Målskyttar
  const playerGoals = players.map(p => ({
    id: p.id,
    name: p.name,
    goals: matchActivities.reduce((sum, m) => sum + (m.player_stats?.goals?.[p.id] || 0), 0)
  })).sort((a, b) => b.goals - a.goals).slice(0, 5);
  // Assistkungar
  const playerAssists = players.map(p => ({
    id: p.id,
    name: p.name,
    assists: matchActivities.reduce((sum, m) => sum + (m.player_stats?.assists?.[p.id] || 0), 0)
  })).sort((a, b) => b.assists - a.assists).slice(0, 5);
  // Närvaro
  const playerAttendance = players.map(p => ({
    id: p.id,
    name: p.name,
    attendance: activities.filter(a => a.participants?.includes(p.id)).length
  })).sort((a, b) => b.attendance - a.attendance).slice(0, 5);
  // Utveckling (om det finns)
  const playerDevelopment = players.filter(p => p.development).map(p => ({
    id: p.id,
    name: p.name,
    dev: Object.values(p.development || {}).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
  })).sort((a, b) => b.dev - a.dev).slice(0, 5);

  // 3. Formkurva
  // Lagets form senaste 5 matcher
  const last5 = matchActivities.slice(-5);
  const teamForm = last5.map(m => m.isWin === true ? 'V' : (m.homeScore === m.awayScore ? 'O' : 'F'));
  // Spelare med bäst form (flest vinster senaste 5 matcher)
  const playerForm = players.map(p => {
    const last5p = matchActivities.filter(m => m.participants?.includes(p.id)).slice(-5);
    const wins = last5p.filter(m => m.isWin === true).length;
    return { id: p.id, name: p.name, wins };
  }).sort((a, b) => b.wins - a.wins).slice(0, 5);

  // Fun facts/highlights
  function getBiggestWin(matches: Activity[]) {
    let maxDiff = -Infinity;
    let match: Activity | undefined;
    for (const m of matches) {
      if (typeof m.homeScore === 'number' && typeof m.awayScore === 'number') {
        const diff = m.homeScore - m.awayScore;
        if (diff > maxDiff) {
          maxDiff = diff;
          match = m;
        }
      }
    }
    return match;
  }
  function getBiggestLoss(matches: Activity[]) {
    let maxDiff = Infinity;
    let match: Activity | undefined;
    for (const m of matches) {
      if (typeof m.homeScore === 'number' && typeof m.awayScore === 'number') {
        const diff = m.homeScore - m.awayScore;
        if (diff < maxDiff) {
          maxDiff = diff;
          match = m;
        }
      }
    }
    return match;
  }
  function getMostGoalsMatch(matches: Activity[]) {
    let maxGoals = -Infinity;
    let match: Activity | undefined;
    for (const m of matches) {
      if (typeof m.homeScore === 'number' && m.homeScore > maxGoals) {
        maxGoals = m.homeScore;
        match = m;
      }
    }
    return match;
  }
  const biggestWin = getBiggestWin(matchActivities);
  const biggestLoss = getBiggestLoss(matchActivities);
  const mostGoalsMatch = getMostGoalsMatch(matchActivities);
  // Sortera matcher i fallande datumordning (nyast först)
  const sortedMatches = [...matchActivities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // Hitta senaste spelade match (inte framtida)
  const today = new Date();
  const lastPlayedMatch = sortedMatches.find(m => new Date(m.date) <= today);
  const bestFormPeriod = playerForm.find(p => p.wins === winStreak);
  const avgGoalsLast5 = last5.reduce((sum, m) => sum + (m.homeScore || 0), 0) / last5.length;

  return (
    <div className="space-y-6">
      {/* Lagets prestationer, topp 5-listor, formkurva */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8 max-w-screen-xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-8 shadow-lg border border-yellow-200 min-h-[260px] flex flex-col justify-between">
          <div className="font-bold text-2xl mb-6 flex items-center gap-2 text-yellow-800"><Trophy className="w-7 h-7 text-yellow-500" /> Lagets prestationer</div>
          {/* Fun facts/highlights */}
          <div className="mb-4">
            <div className="font-semibold text-yellow-900">Största vinst:</div>
            <div className="mb-2">{biggestWin ? `${biggestWin.homeScore}-${biggestWin.awayScore} mot ${getOpponentName(biggestWin) || '-'} (${biggestWin.date})` : '-'}</div>
            <div className="font-semibold text-yellow-900">Största förlust:</div>
            <div className="mb-2">{biggestLoss ? `${biggestLoss.homeScore}-${biggestLoss.awayScore} mot ${getOpponentName(biggestLoss) || '-'} (${biggestLoss.date})` : '-'}</div>
            <div className="font-semibold text-yellow-900">Flest mål i en match:</div>
            <div className="mb-2">{mostGoalsMatch ? `${mostGoalsMatch.homeScore} mot ${getOpponentName(mostGoalsMatch) || '-'} (${mostGoalsMatch.date})` : '-'}</div>
            <div className="font-semibold text-yellow-900">Längsta obesegrade svit:</div>
            <div className="mb-2">{winStreak ? `${winStreak} matcher` : '-'}</div>
            <div className="font-semibold text-yellow-900">Senaste match:</div>
            <div>{lastPlayedMatch ? `${lastPlayedMatch.homeScore}-${lastPlayedMatch.awayScore} mot ${getOpponentName(lastPlayedMatch) || '-'} (${lastPlayedMatch.date})` : '-'}</div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-lg">
            <div>Matcher:</div><div className="font-semibold text-yellow-900">{totalMatches}</div>
            <div>Vinster:</div><div className="font-semibold text-green-700">{wins}</div>
            <div>Oavgjorda:</div><div className="font-semibold text-gray-600">{draws}</div>
            <div>Förluster:</div><div className="font-semibold text-red-600">{losses}</div>
            <div>Mål gjorda:</div><div className="font-semibold text-green-800">{goalsScored}</div>
            <div>Mål insläppta:</div><div className="font-semibold text-red-700">{goalsConceded}</div>
            <div>Målskillnad:</div><div className={`font-semibold ${goalDiff >= 0 ? 'text-green-700' : 'text-red-700'}`}>{goalDiff}</div>
            <div>Snitt mål/match:</div><div className="font-semibold text-blue-700">{avgGoalsFor}</div>
            <div>Snitt insläppta/match:</div><div className="font-semibold text-blue-400">{avgGoalsAgainst}</div>
            <div>Längsta vinstsvit:</div><div className="inline-flex items-center gap-1 font-semibold text-green-700"><ArrowUpRight className="w-5 h-5" />{winStreak}</div>
            <div>Längsta förlustsvit:</div><div className="inline-flex items-center gap-1 font-semibold text-red-700"><ArrowDownRight className="w-5 h-5" />{lossStreak}</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-8 shadow-lg border border-blue-200 min-h-[260px] flex flex-col justify-between">
          <div className="font-bold text-2xl mb-6 flex items-center gap-2 text-blue-800"><Users className="w-7 h-7 text-blue-500" /> Topp 5-listor</div>
          <div className="text-lg mb-3 font-semibold">Målskyttar <span className="ml-1 px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-xs">Bäst: {playerGoals[0]?.name} ({playerGoals[0]?.goals})</span></div>
          <ul className="mb-3">
            {playerGoals.map(p => <li key={p.id}>{p.name}: <span className="font-semibold text-green-700">{p.goals}</span></li>)}
          </ul>
          <div className="text-lg mb-3 font-semibold">Assistkungar <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 text-xs">Bäst: {playerAssists[0]?.name} ({playerAssists[0]?.assists})</span></div>
          <ul className="mb-3">
            {playerAssists.map(p => <li key={p.id}>{p.name}: <span className="font-semibold text-blue-700">{p.assists}</span></li>)}
          </ul>
          <div className="text-lg mb-3 font-semibold">Närvaro <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 text-xs">Bäst: {playerAttendance[0]?.name} ({playerAttendance[0]?.attendance})</span></div>
          <ul className="mb-3">
            {playerAttendance.map(p => <li key={p.id}>{p.name}: <span className="font-semibold text-purple-700">{p.attendance}</span></li>)}
          </ul>
          {playerDevelopment.length > 0 && <>
            <div className="text-lg mb-3 font-semibold">Utveckling <span className="ml-1 px-2 py-0.5 rounded-full bg-orange-200 text-orange-800 text-xs">Bäst: {playerDevelopment[0]?.name} ({playerDevelopment[0]?.dev})</span></div>
            <ul className="mb-3">
              {playerDevelopment.map(p => <li key={p.id}>{p.name}: <span className="font-semibold text-orange-700">{p.dev}</span></li>)}
            </ul>
          </>}
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-8 shadow-lg border border-green-200 min-h-[260px] flex flex-col justify-start">
          <div className="font-bold text-2xl mb-6 flex items-center gap-2 text-green-800"><TrendingUp className="w-7 h-7 text-green-500" /> Formkurva</div>
          {/* Fun facts/highlights och formkurva direkt under rubriken */}
          <div className="flex flex-col gap-2 mb-2">
            <div className="font-semibold text-green-900">Bästa formperiod:</div>
            <div>{winStreak ? `${winStreak} raka vinster` : '-'}</div>
            <div className="font-semibold text-green-900">Senaste match:</div>
            <div>{lastPlayedMatch ? `${lastPlayedMatch.homeScore}-${lastPlayedMatch.awayScore} mot ${getOpponentName(lastPlayedMatch) || '-'} (${lastPlayedMatch.date})` : '-'}</div>
            <div className="font-semibold text-green-900">Snittmål senaste 5:</div>
            <div>{avgGoalsLast5 ? avgGoalsLast5.toFixed(2) : '-'}</div>
            <div className="text-lg font-semibold mt-2">Lagets form (senaste 5 matcher)</div>
            <div className="flex gap-2 mb-1">
              {teamForm.map((f, i) => <span key={i} className={`px-2 py-1 rounded font-bold ${f === 'V' ? 'bg-green-300 text-green-900' : f === 'O' ? 'bg-yellow-200 text-yellow-900' : 'bg-red-300 text-red-900'}`}>{f}</span>)}
            </div>
            <div className="text-lg font-semibold mt-2">Spelare med bäst form <span className="ml-1 px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-xs">{playerForm[0]?.name} ({playerForm[0]?.wins} vinster)</span></div>
            <ul>
              {playerForm.map(p => <li key={p.id}>{p.name}: <span className="font-semibold text-green-700">{p.wins} vinster</span></li>)}
            </ul>
          </div>
        </div>
      </div>
      {/* Enhanced KPI Section */}
      <KPISection 
        players={players} 
        activities={activities} 
        isMobile={isMobile}
      />
      
      {/* Charts Section: Aktivitetsstatistik per nivå + Lagprestationer över tid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartSection
          title="Aktivitetsstatistik per nivå"
          description="Genomsnittligt antal aktiviteter per spelarnivå"
        >
          <GradeStatisticsChart 
            data={activityCountByGrade} 
            config={gradeChartConfig} 
          />
        </ChartSection>
        <ChartSection
          title="Lagprestationer över tid"
          description="Utveckling av vinstprocent och målproduktion"
          className="w-full"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {monthlyData.map((data) => {
              // Calculate most goals in a match for this month
              const matchesThisMonth = matchActivities.filter(m => m.date.startsWith(data.month));
              let mostGoals = 0;
              matchesThisMonth.forEach(m => {
                const isHome = m.homeTeam?.toLowerCase().includes('hässleholms if');
                const goals = isHome ? (m.homeScore || 0) : (m.awayScore || 0);
                if (goals > mostGoals) mostGoals = goals;
              });
              // Calculate longest win streak for this month
              let maxStreak = 0, currentStreak = 0;
              matchesThisMonth.forEach(m => {
                if (m.isWin === true) {
                  currentStreak++;
                  if (currentStreak > maxStreak) maxStreak = currentStreak;
                } else {
                  currentStreak = 0;
                }
              });
              return (
                <div key={data.month} className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center w-full break-words">
                  <div className="text-sm font-medium">{data.month}</div>
                  <div className="text-xs text-muted-foreground">{data.matches} matcher</div>
                  <div className="text-lg font-bold text-green-700">Vinstprocent: {data.winRate}%</div>
                  <div className="text-xs">Vinster: <b>{data.wins}</b> | Oavgjorda: <b>{data.draws}</b> | Förluster: <b>{data.losses}</b></div>
                  <div className="text-xs mt-1">Mål: <b>{data.goals}</b> | Insläppta: <b>{data.goalsConceded}</b> | Målskillnad: <b>{data.goalDiff >= 0 ? '+' : ''}{data.goalDiff}</b></div>
                  <div className="text-xs mt-2">Flest mål i en match: <b>{mostGoals}</b></div>
                  <div className="text-xs">Längsta vinstsvit: <b>{maxStreak}</b></div>
                </div>
              );
            })}
          </div>
        </ChartSection>
      </div>

      {/* Player Count Card */}
      <PlayerSummaryCard data={gradeData} players={players} activities={activities} />
      
      {/* Monthly Activity Trends */}
      <MonthlyActivityChart activities={activities} />
    </div>
  );
}
