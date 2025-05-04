
import { Activity, ActivityType } from "@/types/player";
import { format, parseISO, isSameMonth, subMonths, startOfMonth } from "date-fns";
import { sv } from "date-fns/locale";

// Define the data structure types
export interface MonthlyActivityData {
  month: string;
  matches: number;
  trainings: number;
  cups: number;
  attendance: number;
  total: number;
}

export interface WinRateData {
  month: string;
  winRate: number;
  wins: number;
  losses: number;
  draws: number;
}

export function groupByActivityType(activities: Activity[], type: ActivityType): Activity[] {
  // Fix the comparison to use === instead of == which was causing the type error
  return activities.filter(activity => activity.type === type);
}

/**
 * Generates monthly activity data for charts
 */
export function generateMonthlyActivityData(activities: Activity[]): MonthlyActivityData[] {
  // Get current date and calculate 6 months back
  const today = new Date();
  const monthsData: MonthlyActivityData[] = [];
  
  // Create array of last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(today, i);
    const monthStart = startOfMonth(monthDate);
    
    monthsData.push({
      month: format(monthStart, 'MMM', { locale: sv }),
      matches: 0,
      trainings: 0,
      cups: 0,
      attendance: 0,
      total: 0
    });
  }
  
  // Count activities by month and type
  activities.forEach(activity => {
    try {
      const activityDate = parseISO(activity.date);
      
      // Find matching month
      const monthData = monthsData.find(data => {
        const monthDate = parseISO(data.month + " 1, 2023");
        return isSameMonth(monthDate, activityDate);
      });
      
      if (monthData) {
        if (activity.type === 'match') {
          monthData.matches += 1;
        } else if (activity.type === 'cup') {
          monthData.cups += 1;
        } else if (activity.type === 'training') {
          monthData.trainings += 1;
        }
        
        // Track attendance
        if (activity.participants) {
          monthData.attendance += activity.participants.length;
        }
        
        monthData.total += 1;
      }
    } catch (error) {
      console.error("Error processing activity date:", activity.date);
    }
  });
  
  return monthsData;
}

/**
 * Calculates win rate data for the win rate chart
 */
export function calculateWinRateData(activities: Activity[]): WinRateData[] {
  // Get match activities from last 6 months
  const today = new Date();
  const monthsData: WinRateData[] = [];
  
  // Create array of last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(today, i);
    const monthName = format(monthDate, 'MMM', { locale: sv });
    
    monthsData.push({
      month: monthName,
      winRate: 0,
      wins: 0,
      losses: 0,
      draws: 0
    });
  }
  
  // Filter for match activities and group by month
  const matches = activities.filter(a => a.type === 'match');
  
  matches.forEach(match => {
    try {
      const matchDate = parseISO(match.date);
      const monthName = format(matchDate, 'MMM', { locale: sv });
      
      // Find corresponding month data
      const monthData = monthsData.find(data => data.month === monthName);
      
      if (monthData && match.isWin !== undefined) {
        if (match.isWin === true) {
          monthData.wins += 1;
        } else if (match.homeScore === match.awayScore) {
          monthData.draws += 1;
        } else {
          monthData.losses += 1;
        }
      }
    } catch (error) {
      console.error("Error processing match date:", match.date);
    }
  });
  
  // Calculate win rate for each month
  monthsData.forEach(month => {
    const totalMatches = month.wins + month.losses + month.draws;
    month.winRate = totalMatches > 0 ? Math.round((month.wins / totalMatches) * 100) : 0;
  });
  
  return monthsData;
}
