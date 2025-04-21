
import { Player } from "@/types/player";

/**
 * This adapter ensures backward compatibility for Player objects
 * by providing access to both older and newer property names.
 */
export function createPlayerWithCompatibility(player: Player): Player {
  return {
    ...player,
    // Ensure positions is always available
    get positions() {
      return player.position || player.positions || [];
    },
    // Ensure position is always available
    get position() {
      return player.positions || player.position || [];
    },
    // Ensure jerseyNumber is always available
    get jerseyNumber() {
      return player.jersey_number;
    },
    // Ensure jersey_number is always available
    get jersey_number() {
      return player.jerseyNumber || player.jersey_number;
    }
  };
}

/**
 * This function adapts an array of players to include compatibility properties
 */
export function adaptPlayersWithCompatibility(players: Player[]): Player[] {
  return players.map(createPlayerWithCompatibility);
}
