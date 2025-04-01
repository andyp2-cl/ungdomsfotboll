
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, Activity } from "@/types/player";
import { Trophy } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  preparePerformanceData, 
  calculatePositionData, 
  getTopScorers, 
  getWinRateData, 
  calculateTeamSummary 
} from './utils/performanceDataUtils';
import { PositionPerformanceChart } from './PositionPerformanceChart';
import { GoalsAnalysisCharts } from './GoalsAnalysisCharts';
import { WinRateChart } from './WinRateChart';

interface PlayerPerformanceChartProps {
  players: Player[];
  activities: Activity[];
}

export function PlayerPerformanceChart({ players, activities }: PlayerPerformanceChartProps) {
  const [activeTab, setActiveTab] = useState<"position" | "goals" | "wins">("position");

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      
      if (dateComparison === 0 && a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      
      return dateComparison;
    });
  }, [activities]);

  const performanceData = useMemo(() => {
    return preparePerformanceData(players, activities, sortedActivities);
  }, [players, sortedActivities, activities]);

  const positionData = useMemo(() => {
    return calculatePositionData(performanceData);
  }, [performanceData]);

  const topScorers = useMemo(() => {
    return getTopScorers(performanceData);
  }, [performanceData]);

  const winRateData = useMemo(() => {
    return getWinRateData(performanceData);
  }, [performanceData]);

  const teamSummary = useMemo(() => {
    return calculateTeamSummary(performanceData);
  }, [performanceData]);

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Prestationsanalys
        </CardTitle>
        <CardDescription>
          Spelares prestationer i matcher
        </CardDescription>
        <TabsList className="mt-2">
          <TabsTrigger 
            value="position" 
            onClick={() => setActiveTab("position")}
            className={activeTab === "position" ? "bg-primary text-primary-foreground" : ""}
          >
            Position
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            onClick={() => setActiveTab("goals")}
            className={activeTab === "goals" ? "bg-primary text-primary-foreground" : ""}
          >
            Mål & Assist
          </TabsTrigger>
          <TabsTrigger 
            value="wins" 
            onClick={() => setActiveTab("wins")}
            className={activeTab === "wins" ? "bg-primary text-primary-foreground" : ""}
          >
            Vinststatistik
          </TabsTrigger>
        </TabsList>
      </CardHeader>
      <CardContent>
        {activeTab === "position" && (
          <PositionPerformanceChart positionData={positionData} />
        )}
        
        {activeTab === "goals" && (
          <GoalsAnalysisCharts topScorers={topScorers} teamSummary={teamSummary} />
        )}
        
        {activeTab === "wins" && (
          <WinRateChart winRateData={winRateData} />
        )}
      </CardContent>
    </Card>
  );
}
