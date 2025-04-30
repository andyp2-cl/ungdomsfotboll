
import React, { useMemo } from 'react';
import { Activity, Player } from '@/types/player';
import { generateMonthlyActivityData, calculateWinRateData } from './utils/activityDataUtils';
import { MonthlyActivityChart } from './charts/MonthlyActivityChart';
import { AttendanceChart } from './charts/AttendanceChart';
import { WinRateChart } from './charts/WinRateChart';

interface TrendsTabContentProps {
  activities: Activity[];
  players: Player[];
}

export function TrendsTabContent({ activities, players }: TrendsTabContentProps) {
  // Generate data for monthly activity trends
  const monthlyActivityData = useMemo(() => 
    generateMonthlyActivityData(activities), 
    [activities]
  );
  
  // Calculate win rate trend
  const winRateData = useMemo(() => 
    calculateWinRateData(activities),
    [activities]
  );
  
  return (
    <div className="space-y-6">
      <MonthlyActivityChart data={monthlyActivityData} />
      <AttendanceChart data={monthlyActivityData} />
      <WinRateChart data={winRateData} />
    </div>
  );
}
