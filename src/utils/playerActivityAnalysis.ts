
import { Player, Activity } from "@/types/player";

export interface PlayerActivityStats {
  recentMatches: number;
  totalMatches: number;
  restFactor: number;
  lastPlayedDate?: string;
  lastPlayedActivity?: string;
  debugInfo: {
    totalActivitiesChecked: number;
    matchingActivities: string[];
    recentActivities: string[];
  };
}

// Helper function to normalize player IDs for comparison
const normalizePlayerId = (id: string | undefined): string => {
  if (!id) return '';
  return id.toString().trim();
};

// Helper function to check if an activity is a recent match
const isRecentMatch = (activity: Activity, recentDays: number = 30): boolean => {
  if (!activity.date) return false;
  
  const activityDate = new Date(activity.date);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDiff <= recentDays;
};

// Calculate player activity frequency with detailed debugging
export const calculateDetailedPlayerActivityFrequency = (
  players: Player[], 
  activities: Activity[], 
  recentMatchCount: number = 5,
  recentDays: number = 30
): Record<string, PlayerActivityStats> => {
  console.log(`🔍 Analyzing player activity frequency:`, {
    playersCount: players.length,
    activitiesCount: activities.length,
    recentMatchCount,
    recentDays
  });

  const playerStats: Record<string, PlayerActivityStats> = {};
  
  // Filter and sort match activities by date (most recent first)
  const matchActivities = activities
    .filter(a => a.type === 'match' && a.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  console.log(`📊 Found ${matchActivities.length} match activities for analysis`);
  
  // Get the most recent matches for "recent activity" analysis
  const recentActivities = matchActivities.slice(0, recentMatchCount);
  
  players.forEach(player => {
    const normalizedPlayerId = normalizePlayerId(player.id);
    
    // Find all matches this player participated in
    const playerMatchActivities = matchActivities.filter(activity => 
      activity.participants?.some(participantId => 
        normalizePlayerId(participantId) === normalizedPlayerId
      )
    );
    
    // Find recent matches this player participated in
    const playerRecentActivities = recentActivities.filter(activity => 
      activity.participants?.some(participantId => 
        normalizePlayerId(participantId) === normalizedPlayerId
      )
    );
    
    // Also check by calendar time (last 30 days)
    const playerRecentByTime = matchActivities.filter(activity => 
      isRecentMatch(activity, recentDays) &&
      activity.participants?.some(participantId => 
        normalizePlayerId(participantId) === normalizedPlayerId
      )
    );
    
    // Get last played info
    let lastPlayedDate: string | undefined;
    let lastPlayedActivity: string | undefined;
    
    if (playerMatchActivities.length > 0) {
      const lastMatch = playerMatchActivities[0]; // Already sorted by date desc
      lastPlayedDate = lastMatch.date;
      lastPlayedActivity = lastMatch.name;
    }
    
    // Calculate rest factor: higher value = played more recently = lower priority for rotation
    // Use the higher of the two recent counts (by match count or by time)
    const recentMatchesByCount = playerRecentActivities.length;
    const recentMatchesByTime = playerRecentByTime.length;
    const effectiveRecentMatches = Math.max(recentMatchesByCount, recentMatchesByTime);
    
    const restFactor = effectiveRecentMatches / Math.max(1, recentMatchCount);
    
    const debugInfo = {
      totalActivitiesChecked: matchActivities.length,
      matchingActivities: playerMatchActivities.map(a => `${a.name} (${a.date})`),
      recentActivities: playerRecentActivities.map(a => `${a.name} (${a.date})`)
    };
    
    playerStats[player.id] = {
      recentMatches: effectiveRecentMatches,
      totalMatches: playerMatchActivities.length,
      restFactor,
      lastPlayedDate,
      lastPlayedActivity,
      debugInfo
    };
    
    // Log detailed info for debugging
    console.log(`👤 ${player.name} (ID: ${player.id}):`, {
      totalMatches: playerMatchActivities.length,
      recentByCount: recentMatchesByCount,
      recentByTime: recentMatchesByTime,
      effectiveRecent: effectiveRecentMatches,
      restFactor: restFactor.toFixed(2),
      lastPlayed: lastPlayedDate,
      lastActivity: lastPlayedActivity
    });
  });
  
  return playerStats;
};

// Enhanced reasoning generator
export const generatePlayerSelectionReasoning = (
  player: Player,
  stats: PlayerActivityStats,
  prioritizeNewPlayers: boolean = false
): string => {
  const reasons: string[] = [];
  
  // Rest/rotation reasoning
  if (stats.recentMatches === 0) {
    reasons.push("Har inte spelat nyligen - behöver speltid");
  } else if (stats.recentMatches <= 2) {
    reasons.push(`Begränsad speltid nyligen (${stats.recentMatches} av senaste matcherna)`);
  } else if (stats.recentMatches >= 4) {
    reasons.push(`Har spelat mycket nyligen (${stats.recentMatches} av senaste matcherna)`);
  }
  
  // Last played info
  if (stats.lastPlayedDate) {
    const daysSinceLastPlayed = Math.floor(
      (new Date().getTime() - new Date(stats.lastPlayedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastPlayed <= 1) {
      reasons.push(`Spelade senast ${stats.lastPlayedDate} (${daysSinceLastPlayed} dag sedan)`);
    } else if (daysSinceLastPlayed <= 7) {
      reasons.push(`Spelade senast ${stats.lastPlayedDate} (${daysSinceLastPlayed} dagar sedan)`);
    } else if (daysSinceLastPlayed <= 30) {
      reasons.push(`Spelade senast för ${daysSinceLastPlayed} dagar sedan`);
    }
  }
  
  // Primary position
  if (player.positions?.[0]) {
    reasons.push(`Primär position: ${player.positions[0]}`);
  }
  
  // Grade consideration
  if (player.grade) {
    reasons.push(`Nivå: ${player.grade}`);
  }
  
  return reasons.length > 0 ? reasons.join(" • ") : "Grundvärdering";
};
