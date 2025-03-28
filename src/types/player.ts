
export type PlayerGrade = 'A' | 'B' | 'C';

export type ActivityType = 'match' | 'cup';

export interface KioskSchedule {
  id: string;
  activityId: string;
  slots: KioskSlot[];
}

export interface KioskSlot {
  id: string;
  time: string;
  assignedPlayerId?: string; // ID på spelaren som är tilldelad detta kioskpass
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  type: ActivityType;
  participants?: string[]; // Array of player IDs who are participating
  kioskScheduleId?: string; // Referens till kioskschema om det finns
}

export interface Player {
  id: string;
  name: string;
  grade: PlayerGrade;
  position?: string; // Lägger till position för spelaren
  activities?: string[]; // Array of activity IDs this player is participating in
}
