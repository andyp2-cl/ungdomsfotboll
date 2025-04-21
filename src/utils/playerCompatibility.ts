
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
      return this.position || [];
    },
    // Ensure position is always available
    get position() {
      return this.positions || [];
    },
    // Ensure jerseyNumber is always available
    get jerseyNumber() {
      return this.jersey_number;
    },
    // Ensure jersey_number is always available
    set jerseyNumber(value) {
      this.jersey_number = value;
    }
  };
}

/**
 * This function adapts an array of players to include compatibility properties
 */
export function adaptPlayersWithCompatibility(players: Player[]): Player[] {
  return players.map(createPlayerWithCompatibility);
}
