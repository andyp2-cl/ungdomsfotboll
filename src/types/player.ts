
export type PlayerGrade = 'A' | 'B' | 'C' | 'D' | 'TRÄNARE';

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
  scraped?: boolean; // Optional flag to mark if this was imported via scraper
  location?: {
    name: string;
    description?: string;
    gpsLink?: string;
  };
  time?: string; // Time of the activity, e.g. "09:30"
}

export interface Player {
  id: string;
  name: string;
  grade: PlayerGrade;
  position?: string; // Lägger till position för spelaren
  activities?: string[]; // Array of activity IDs this player is participating in
  jerseyNumber?: string; // Optional jersey number for the player
  image?: string; // URL to player's image
}
