import { Activity, Player, KioskSchedule, KioskSlot } from "@/types/player";

export const mockPlayers: Player[] = [
  { id: "1", name: "Alexander Isak", grade: "A", position: "Anfallare", activities: ["1", "3"] },
  { id: "2", name: "Victor Lindelöf", grade: "A", position: "Försvarare", activities: ["1", "2"] },
  { id: "3", name: "Dejan Kulusevski", grade: "A", position: "Mittfältare", activities: ["1", "3"] },
  { id: "4", name: "Emil Forsberg", grade: "B", position: "Mittfältare", activities: ["2"] },
  { id: "5", name: "Robin Olsen", grade: "B", position: "Målvakt", activities: ["1"] },
  { id: "6", name: "Ludwig Augustinsson", grade: "C", position: "Försvarare", activities: ["3"] },
  { id: "7", name: "Mattias Svanberg", grade: "C", position: "Mittfältare", activities: ["2"] },
  { id: "8", name: "Kristoffer Olsson", grade: "B", position: "Mittfältare", activities: ["1", "2"] },
  { id: "9", name: "Ken Sema", grade: "C", position: "Mittfältare", activities: [] },
  { id: "10", name: "Viktor Gyökeres", grade: "A", position: "Anfallare", activities: ["1", "3"] },
];

export const mockActivities: Activity[] = [
  { 
    id: "1", 
    name: "Landskamp mot Danmark", 
    date: "2023-06-10", 
    type: "match",
    participants: ["1", "2", "3", "5", "8", "10"],
    kioskScheduleId: "1"
  },
  { 
    id: "2", 
    name: "Nordic Cup", 
    date: "2023-07-15", 
    type: "cup",
    participants: ["2", "4", "7", "8"],
    kioskScheduleId: "2"
  },
  { 
    id: "3", 
    name: "Träningmatch mot Norge", 
    date: "2023-08-05", 
    type: "match",
    participants: ["1", "3", "6", "10"],
    kioskScheduleId: "3"
  },
];

export const mockKioskSchedules: KioskSchedule[] = [
  {
    id: "1",
    activityId: "1",
    slots: [
      { id: "1_1", time: "12:30-13:30", assignedPlayerId: "5" },
      { id: "1_2", time: "13:30-14:30", assignedPlayerId: "8" },
      { id: "1_3", time: "14:30-15:30" }
    ]
  },
  {
    id: "2",
    activityId: "2",
    slots: [
      { id: "2_1", time: "10:00-11:00", assignedPlayerId: "4" },
      { id: "2_2", time: "11:00-12:00", assignedPlayerId: "7" },
      { id: "2_3", time: "12:00-13:00" }
    ]
  },
  {
    id: "3",
    activityId: "3",
    slots: [
      { id: "3_1", time: "14:00-15:00", assignedPlayerId: "6" },
      { id: "3_2", time: "15:00-16:00", assignedPlayerId: "1" },
      { id: "3_3", time: "16:00-17:00" }
    ]
  }
];
