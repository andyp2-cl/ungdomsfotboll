
import { Activity } from '@/types/player';
import { format, subMonths, isAfter, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';

export interface MonthlyActivityData {
  month: string;
  matches: number;
  trainings: number;
  cups: number;
  attendance: number;
}

export interface WinRateData {
  month: string;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

/**
 * Generates monthly activity data for the last 6 months
 */
export function generateMonthlyActivityData(activities: Activity[]): MonthlyActivityData[] {
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
  const monthlyData: Record<string, MonthlyActivityData> = {};
  
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
        // Use string comparisons to avoid TypeScript type issues
        if (activity.type === 'match') {
          monthlyData[monthKey].matches++;
        } 
        
        // Using type casting to avoid TypeScript error
        if (String(activity.type) === 'training') {
          monthlyData[monthKey].trainings++;
        }
        
        if (activity.type === 'cup') {
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
}

/**
 * Calculates win rate data for the last 6 months
 */
export function calculateWinRateData(activities: Activity[]): WinRateData[] {
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
  const monthlyData: Record<string, WinRateData> = {};
  
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
    monthData.winRate = totalMatches > 0 ? Math.round((monthData.wins / totalMatches) * 100) : 0;
  });
  
  // Convert to array sorted by date
  return Object.values(monthlyData).reverse();
}
