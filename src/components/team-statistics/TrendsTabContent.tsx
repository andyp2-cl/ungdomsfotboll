
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TrendsTabContentProps {
  activities: Activity[];
}

export function TrendsTabContent({ activities }: TrendsTabContentProps) {
  // Process activities to get trend data by month
  const trendData = React.useMemo(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    // Create an array of the last 6 months
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      months.unshift({
        month: date.toLocaleString('default', { month: 'short' }),
        fullMonth: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear(),
        date: new Date(date.getFullYear(), date.getMonth(), 1)
      });
    }
    
    // Create data structure for each month
    return months.map(month => {
      const startOfMonth = new Date(month.year, month.date.getMonth(), 1);
      const endOfMonth = new Date(month.year, month.date.getMonth() + 1, 0);
      
      const monthActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= startOfMonth && activityDate <= endOfMonth;
      });
      
      // Calculate stats for this month
      const totalActivities = monthActivities.length;
      const trainings = monthActivities.filter(a => a.type === 'training').length;
      const matches = monthActivities.filter(a => a.type === 'match').length;
      
      // Calculate average participation for this month
      const participationRates = monthActivities.map(activity => {
        if (!activity.participants) return 0;
        return activity.participants.length;
      });
      
      const averageParticipation = participationRates.length > 0
        ? Math.round(participationRates.reduce((sum, rate) => sum + rate, 0) / participationRates.length)
        : 0;
      
      // Calculate goals scored in matches
      let goalsScored = 0;
      monthActivities
        .filter(a => a.type === 'match')
        .forEach(match => {
          if (match.player_stats?.goals) {
            Object.values(match.player_stats.goals).forEach(goals => {
              goalsScored += Number(goals);
            });
          }
        });
        
      return {
        name: `${month.month} ${month.year}`,
        activities: totalActivities,
        trainings,
        matches,
        participation: averageParticipation,
        goals: goalsScored
      };
    });
  }, [activities]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Aktivitetstrend</CardTitle>
          <CardDescription>Utveckling av aktiviteter över tid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="activities" 
                  name="Totalt" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="trainings" 
                  name="Träningar" 
                  stroke="#82ca9d" 
                />
                <Line 
                  type="monotone" 
                  dataKey="matches" 
                  name="Matcher" 
                  stroke="#ffc658" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Närvarotrend</CardTitle>
          <CardDescription>Genomsnittligt antal deltagare per månad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 'dataMax + 5']} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="participation" 
                  name="Närvaro" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Mål per månad</CardTitle>
          <CardDescription>Antal gjorda mål i matcher</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 'dataMax + 2']} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="goals" 
                  name="Mål" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
