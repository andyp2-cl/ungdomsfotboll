
export type PlayerGrade = 'A' | 'B' | 'C';

export type ActivityType = 'match' | 'cup';

export interface Activity {
  id: string;
  name: string;
  date: string;
  type: ActivityType;
  participants?: string[]; // Array of player IDs who are participating
}

export interface Player {
  id: string;
  name: string;
  grade: PlayerGrade;
  activities?: string[]; // Array of activity IDs this player is participating in
}
