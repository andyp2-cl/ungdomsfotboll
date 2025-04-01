
import { PlayerPosition, Player } from "@/types/player";

// Get position color
export const getPositionColor = (position: PlayerPosition): string => {
  switch (position) {
    case "MV": return "#e11d48"; // Red
    case "BACK": return "#fb923c"; // Orange
    case "MF": return "#22c55e"; // Green
    case "ANF": return "#3b82f6"; // Blue
    default: return "#9ca3af"; // Gray
  }
};

// Position label
export const getPositionLabel = (position: PlayerPosition): string => {
  switch (position) {
    case "MV": return "Målvakt";
    case "BACK": return "Back";
    case "MF": return "Mittfältare";
    case "ANF": return "Anfallare";
    case "TRÄNARE": return "Tränare";
  }
};

// Find players for each position
export const getPlayersForPosition = (players: Player[], position: PlayerPosition): Player[] => {
  return players.filter(player => 
    player.positions?.includes(position)
  );
};

// Filter out trainers
export const getFieldPlayers = (players: Player[]): Player[] => {
  return players.filter(player => !player.positions?.includes("TRÄNARE"));
};
