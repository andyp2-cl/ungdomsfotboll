
// Define types used in backup system
export interface BackupData {
  players: any[];
  activities: any[];
  timestamp: string;
}

export interface BackupInfo {
  timestamp: string;
  playerCount: number;
  activityCount: number;
}
