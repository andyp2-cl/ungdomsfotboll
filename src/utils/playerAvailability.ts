// Utility to get available players for a match
import { Player, Activity } from "@/types/player";
import { Match } from "@/types/match";

export function getAvailablePlayers(players: Player[], activities: Activity[] = [], match: Match): Player[] {
  const matchDate = new Date(match.date).toDateString();
  return players.filter(player => {
    if (player.isActive === false) return false;
    // Spelare har redan match samma dag?
    const hasSameDayMatch = activities.some(activity =>
      activity.type === 'match' &&
      activity.id !== match.id &&
      new Date(activity.date).toDateString() === matchDate &&
      activity.participants?.includes(player.id)
    );
    return !hasSameDayMatch;
  });
} 