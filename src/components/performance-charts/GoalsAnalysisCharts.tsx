
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { PlayerPerformanceData, TeamSummaryData, CHART_COLORS } from './utils/performanceDataUtils';

interface GoalsAnalysisChartsProps {
  topScorers: PlayerPerformanceData[];
  teamSummary: TeamSummaryData;
}

export function GoalsAnalysisCharts({ topScorers, teamSummary }: GoalsAnalysisChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-[350px]">
        <h3 className="text-lg font-medium mb-2">Toppmålskyttar</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={topScorers}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 12 }} 
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const player = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm">Mål: {player.totalGoals}</div>
                      <div className="text-sm">Assist: {player.totalAssists}</div>
                      <div className="text-xs text-muted-foreground">
                        Mål per match: {player.goalsAvg.toFixed(2)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="totalGoals" 
              fill="#22c55e"
              radius={[0, 4, 4, 0]}
            >
              {topScorers.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="h-[350px]">
        <h3 className="text-lg font-medium mb-2">Målfördelning per position</h3>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={teamSummary.goalData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {teamSummary.goalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{data.name}</div>
                      <div className="text-sm">Mål: {data.value}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
