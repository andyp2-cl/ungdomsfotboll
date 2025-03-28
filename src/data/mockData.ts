
import { Activity, Player, KioskSchedule, KioskSlot } from "@/types/player";

export const mockPlayers: Player[] = [
  { id: "1", name: "Hugo Björk", grade: "B", position: "Utespelare", activities: ["1", "2"] },
  { id: "2", name: "Melvin Claesson", grade: "A", position: "Utespelare", activities: ["1", "3"] },
  { id: "3", name: "Hannes Gustavsson", grade: "A", position: "Utespelare", activities: ["1", "2"] },
  { id: "4", name: "Kristian Hermansson", grade: "B", position: "Utespelare", activities: ["2"] },
  { id: "5", name: "Felix Holmgren", grade: "B", position: "Målvakt", activities: ["1"] },
  { id: "6", name: "Maximus Johansson", grade: "C", position: "Utespelare", activities: ["3"] },
  { id: "7", name: "Dante Karlsson", grade: "C", position: "Utespelare", activities: ["2"] },
  { id: "8", name: "Enes Kozarac", grade: "B", position: "Utespelare", activities: ["1", "2"] },
  { id: "9", name: "Kalle Rosberg", grade: "C", position: "Utespelare", activities: [] },
  { id: "10", name: "Joshua Svensson", grade: "A", position: "Utespelare", activities: ["1", "3"] },
  { id: "11", name: "Julius Thor", grade: "B", position: "Utespelare", activities: ["1", "2"] },
  { id: "12", name: "Albin Wallin", grade: "A", position: "Målvakt", activities: ["2", "3"] },
];

export const mockActivities: Activity[] = [
  { 
    id: "1", 
    name: "Match mot FK Finja", 
    date: "2024-04-14", 
    type: "match",
    participants: ["1", "2", "3", "5", "8", "10", "11"],
    kioskScheduleId: "1"
  },
  { 
    id: "2", 
    name: "Match mot Vittsjö GIK", 
    date: "2024-04-21", 
    type: "match",
    participants: ["1", "3", "4", "7", "8", "11", "12"],
    kioskScheduleId: "2"
  },
  { 
    id: "3", 
    name: "Knatteligan", 
    date: "2024-04-28", 
    type: "cup",
    participants: ["2", "6", "10", "12"],
    kioskScheduleId: "3"
  },
  { 
    id: "4", 
    name: "Match mot IFK Osby", 
    date: "2024-05-05", 
    type: "match",
    participants: [],
    kioskScheduleId: "4"
  },
  { 
    id: "5", 
    name: "Lag-cup Åhus", 
    date: "2024-05-18", 
    type: "cup",
    participants: [],
    kioskScheduleId: "5"
  },
];

export const mockKioskSchedules: KioskSchedule[] = [
  {
    id: "1",
    activityId: "1",
    slots: [
      { id: "1_1", time: "08:30-09:30", assignedPlayerId: "5" },
      { id: "1_2", time: "09:30-10:30", assignedPlayerId: "8" },
      { id: "1_3", time: "10:30-11:30" }
    ]
  },
  {
    id: "2",
    activityId: "2",
    slots: [
      { id: "2_1", time: "15:00-16:00", assignedPlayerId: "4" },
      { id: "2_2", time: "16:00-17:00", assignedPlayerId: "7" },
      { id: "2_3", time: "17:00-18:00" }
    ]
  },
  {
    id: "3",
    activityId: "3",
    slots: [
      { id: "3_1", time: "09:00-10:00", assignedPlayerId: "6" },
      { id: "3_2", time: "10:00-11:00", assignedPlayerId: "2" },
      { id: "3_3", time: "11:00-12:00" }
    ]
  },
  {
    id: "4",
    activityId: "4",
    slots: [
      { id: "4_1", time: "16:00-17:00" },
      { id: "4_2", time: "17:00-18:00" },
      { id: "4_3", time: "18:00-19:00" }
    ]
  },
  {
    id: "5",
    activityId: "5",
    slots: [
      { id: "5_1", time: "10:00-11:00" },
      { id: "5_2", time: "11:00-12:00" },
      { id: "5_3", time: "12:00-13:00" }
    ]
  }
];
