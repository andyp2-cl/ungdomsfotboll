export interface Match {
  id: string;
  date: string;
  time: string;
  opponent: string;
  location: string;
  league: string;
  players: string[]; // Array of player IDs
  requiredPlayers: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  rawActivity: any; // The original activity object
} 