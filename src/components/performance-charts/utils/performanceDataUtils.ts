import { Player, Activity } from "@/types/player";

export interface PlayerPerformanceData {
  id: string;
  name: string;
  grade: string;
  position: string;
  jerseyNumber: string;
  matches: number;
  attendance: number;
  goals: number;
  assists: number;
  rating: number;
  trend: number;
  fill: string;
}

export interface PositionPerformanceData {
  position: string;
  matches: number;
  attendance: number;
  goals: number;
  assists: number;
  rating: number;
  fill: string;
}

export function preparePlayerData(players: Player[], activities: Activity[]): PlayerPerformanceData[] {
  // Preprocessing: Filter out trainers and inactive players
  players = players.filter(player => !player.positions?.includes("TRÄNARE") && player.active !== false);
  activities = activities.filter(activity => activity.type === 'match');

  return players.map(player => {
    // Calculate player stats
    const playerActivities = activities.filter(activity => 
      activity.participants?.includes(player.id)
    );
    
    const matchActivities = playerActivities.filter(a => a.type === 'match');
    
    // Calculate goals and assists
    let totalGoals = 0;
    let totalAssists = 0;
    
    matchActivities.forEach(match => {
      if (match.player_stats?.goals) {
        totalGoals += match.player_stats.goals[player.id] || 0;
      }
      
      if (match.player_stats?.assists) {
        totalAssists += match.player_stats.assists[player.id] || 0;
      }
    });
    
    // Get first position for simplification
    const position = player.positions ? player.positions[0] || 'N/A' : 'N/A';
    
    return {
      id: player.id,
      name: player.name,
      grade: player.grade || 'N/A',
      position: position,
      jerseyNumber: player.jerseyNumber || '',
      matches: matchActivities.length,
      attendance: playerActivities.length,
      goals: totalGoals,
      assists: totalAssists,
      rating: Math.round((totalGoals + totalAssists) / (matchActivities.length || 1)),
      trend: Math.round((totalGoals + totalAssists) / (playerActivities.length || 1)),
      fill: 'hsl(var(--destructive))',
    };
  });
}

export function calculateTotalStats(data: PlayerPerformanceData[]) {
  return data.reduce((acc, player) => {
    acc.matches += player.matches;
    acc.attendance += player.attendance;
    acc.goals += player.goals;
    acc.assists += player.assists;
    return acc;
  }, { matches: 0, attendance: 0, goals: 0, assists: 0 });
}

export function preparePositionData(players: Player[], activities: Activity[]): PositionPerformanceData[] {
  // Preprocessing: Filter out trainers and inactive players
  players = players.filter(player => !player.positions?.includes("TRÄNARE") && player.active !== false);
  activities = activities.filter(activity => activity.type === 'match');

  const positionMap: Record<string, PositionPerformanceData> = {};
  
  players.forEach(player => {
    const position = player.positions?.[0] || 'Unknown';
    const jerseyNumber = player.jerseyNumber || '';
    
    // Ensure the position exists in the map
    if (!positionMap[position]) {
      positionMap[position] = {
        position: position,
        matches: 0,
        attendance: 0,
        goals: 0,
        assists: 0,
        rating: 0,
        fill: 'hsl(var(--primary))',
      };
    }
    
    // Calculate player stats
    const playerActivities = activities.filter(activity => 
      activity.participants?.includes(player.id)
    );
    
    const matchActivities = playerActivities.filter(a => a.type === 'match');
    
    let totalGoals = 0;
    let totalAssists = 0;
    
    matchActivities.forEach(match => {
      if (match.player_stats?.goals) {
        totalGoals += match.player_stats.goals[player.id] || 0;
      }
      
      if (match.player_stats?.assists) {
        totalAssists += match.player_stats.assists[player.id] || 0;
      }
    });
    
    // Update position stats
    positionMap[position].matches += matchActivities.length;
    positionMap[position].attendance += playerActivities.length;
    positionMap[position].goals += totalGoals;
    positionMap[position].assists += totalAssists;
  });
  
  // Convert the map to an array
  const positionData = Object.values(positionMap);
  
  // Calculate the rating for each position
  positionData.forEach(position => {
    position.rating = Math.round((position.goals + position.assists) / (position.matches || 1));
  });
  
  return positionData;
}
