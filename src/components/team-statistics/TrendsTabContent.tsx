
import React, { useMemo } from 'react';
import { Activity, Player } from '@/types/player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subMonths, isAfter, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';

interface TrendsTabContentProps {
  activities: Activity[];
  players: Player[];
}

export function TrendsTabContent({ activities, players }: TrendsTabContentProps) {
  // Generate data for monthly activity trends
  const monthlyActivityData = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    
    // Filter to activities in the last 6 months
    const recentActivities = activities.filter(activity => {
      try {
        const activityDate = parseISO(activity.date);
        return isAfter(activityDate, sixMonthsAgo);
      } catch (e) {
        return false;
      }
    });
    
    // Group by month and type
    const monthlyData: Record<string, {
      month: string;
      matches: number;
      trainings: number;
      cups: number;
      attendance: number;
    }> = {};
    
    // Initialize data for last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = subMonths(now, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'MMM', { locale: sv });
      
      monthlyData[monthKey] = {
        month: monthLabel,
        matches: 0,
        trainings: 0,
        cups: 0,
        attendance: 0
      };
    }
    
    // Count activities by type
    recentActivities.forEach(activity => {
      try {
        const monthKey = format(parseISO(activity.date), 'yyyy-MM');
        
        if (monthlyData[monthKey]) {
          if (activity.type === 'match') {
            monthlyData[monthKey].matches++;
          } else if (activity.type === 'training') {
            monthlyData[monthKey].trainings++;
          } else if (activity.type === 'cup') {
            monthlyData[monthKey].cups++;
          }
          
          // Track attendance if participants exist
          if (activity.participants?.length) {
            monthlyData[monthKey].attendance += activity.participants.length;
          }
        }
      } catch (e) {
        console.error('Error processing activity date:', e);
      }
    });
    
    // Convert to array sorted by date
    return Object.values(monthlyData).reverse();
  }, [activities]);
  
  // Calculate win rate trend
  const winRateData = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    
    // Filter to match activities in the last 6 months
    const recentMatches = activities.filter(activity => {
      try {
        const activityDate = parseISO(activity.date);
        return isAfter(activityDate, sixMonthsAgo) && activity.type === 'match';
      } catch (e) {
        return false;
      }
    });
    
    // Group by month
    const monthlyData: Record<string, {
      month: string;
      wins: number;
      losses: number;
      draws: number;
      winRate: number;
    }> = {};
    
    // Initialize data for last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = subMonths(now, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'MMM', { locale: sv });
      
      monthlyData[monthKey] = {
        month: monthLabel,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0
      };
    }
    
    // Count match results
    recentMatches.forEach(match => {
      try {
        const monthKey = format(parseISO(match.date), 'yyyy-MM');
        
        if (monthlyData[monthKey]) {
          if (match.isWin === true) {
            monthlyData[monthKey].wins++;
          } else if (match.isWin === false) {
            monthlyData[monthKey].losses++;
          } else {
            monthlyData[monthKey].draws++;
          }
        }
      } catch (e) {
        console.error('Error processing match date:', e);
      }
    });
    
    // Calculate win rate
    Object.values(monthlyData).forEach(monthData => {
      const totalMatches = monthData.wins + monthData.losses + monthData.draws;
      monthData.winRate = totalMatches > 0 ? Math.round(monthData.wins / totalMatches * 100) : 0;
    });
    
    // Convert to array sorted by date
    return Object.values(monthlyData).reverse();
  }, [activities]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Aktiviteter per månad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="matches" name="Matcher" fill="#8884d8" />
                <Bar dataKey="trainings" name="Träningar" fill="#82ca9d" />
                <Bar dataKey="cups" name="Cuper" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Närvarotrend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyActivityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" name="Närvarande spelare" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vinstprocent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={winRateData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="winRate" name="Vinstprocent" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
