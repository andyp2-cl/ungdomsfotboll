
import { Activity, Player, KioskSchedule, KioskSlot } from "@/types/player";

export const mockPlayers: Player[] = [
  { id: "1", name: "Åcke Kristiansson", grade: "A", position: "BACK MF", activities: [] },
  { id: "2", name: "Alvin Hansson", grade: "A", position: "MF", activities: [] },
  { id: "3", name: "Colin Brandt", grade: "A", position: "BACK", activities: [] },
  { id: "4", name: "David Tanase", grade: "A", position: "MF ANF", activities: [] },
  { id: "5", name: "Edison Rexhepi", grade: "A", position: "MF ANF", activities: [] },
  { id: "6", name: "Erik Kallberg", grade: "A", position: "MV BACK ANF", activities: [] },
  { id: "7", name: "Harry Waldau", grade: "A", position: "MV", activities: [] },
  { id: "8", name: "Herman Lavin", grade: "A", position: "MF", activities: [] },
  { id: "9", name: "Milo Petersson", grade: "A", position: "MV MF", activities: [] },
  { id: "10", name: "Milton Borg", grade: "A", position: "MF ANF", activities: [] },
  { id: "11", name: "Yazan", grade: "A", position: "MF BACK", activities: [] },
  { id: "12", name: "Anuar Shala", grade: "B", position: "BACK", activities: [] },
  { id: "13", name: "Arvid Zenthio", grade: "B", position: "BACK MF", activities: [] },
  { id: "14", name: "Elias Workneh", grade: "B", position: "BACK MF", activities: [] },
  { id: "15", name: "Josef Baroud", grade: "B", position: "MF ANF", activities: [] },
  { id: "16", name: "Liam Bemby", grade: "B", position: "MF ANF", activities: [] },
  { id: "17", name: "Lionel Joumaa", grade: "B", position: "BACK", activities: [] },
  { id: "18", name: "Lukas Liljeqvist", grade: "B", position: "MF", activities: [] },
  { id: "19", name: "Matteus Malmqvist", grade: "B", position: "MV BACK", activities: [] },
  { id: "20", name: "Alexander Bendz", grade: "C", position: "MF ANF", activities: [] },
  { id: "21", name: "Aston Eklom", grade: "C", position: "BACK", activities: [] },
  { id: "22", name: "Joel Thulin", grade: "C", position: "BACK MF", activities: [] },
  { id: "23", name: "Loa Gläder", grade: "C", position: "MF ANF", activities: [] },
  { id: "24", name: "Lucas Gloeckner", grade: "C", position: "BACK", activities: [] },
  { id: "25", name: "Teoman Saran", grade: "C", position: "MF", activities: [] },
  { id: "26", name: "Theo Rydhe", grade: "C", position: "C", activities: [] },
  { id: "27", name: "Adam Kucukovic", grade: "D", position: "ANF", activities: [] },
  { id: "28", name: "Adel Ndugwa Mukiibi", grade: "D", position: "ANF", activities: [] },
  { id: "29", name: "Alessandro Gatica", grade: "D", position: "BACK", activities: [] },
  { id: "30", name: "Altin Kutllovci", grade: "D", position: "MV", activities: [] },
  { id: "31", name: "Denis Hukic", grade: "D", position: "MF ANF", activities: [] },
  { id: "32", name: "Hardy Persson", grade: "D", position: "MF", activities: [] },
  { id: "33", name: "Kevin Schmidt", grade: "D", position: "MF", activities: [] },
  { id: "34", name: "Liam Karlsson Sjöstrand", grade: "D", position: "MF", activities: [] },
  { id: "35", name: "Lincoln Stenhöös", grade: "D", position: "MF", activities: [] },
  { id: "36", name: "Noah Åkesson nilsson", grade: "D", position: "D", activities: [] },
  { id: "37", name: "Andreas Petersson", grade: "TRÄNARE", position: "TRÄNARE", activities: [] },
  { id: "38", name: "Anna Zenthio", grade: "TRÄNARE", position: "TRÄNARE", activities: [] },
  { id: "39", name: "Tage", grade: "TRÄNARE", position: "MV", activities: [] },
  { id: "40", name: "Ted Petersson", grade: "TRÄNARE", position: "TRÄNARE", activities: [] },
  { id: "41", name: "Tommie Hanson", grade: "TRÄNARE", position: "TRÄNARE", activities: [] },
];

export const mockActivities: Activity[] = [
  { 
    id: "1", 
    name: "Match mot FK Finja", 
    date: "2024-04-14", 
    type: "match",
    participants: [],
    kioskScheduleId: "1"
  },
  { 
    id: "2", 
    name: "Match mot Vittsjö GIK", 
    date: "2024-04-21", 
    type: "match",
    participants: [],
    kioskScheduleId: "2"
  },
  { 
    id: "3", 
    name: "Knatteligan", 
    date: "2024-04-28", 
    type: "cup",
    participants: [],
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
      { id: "1_1", time: "08:30-09:30" },
      { id: "1_2", time: "09:30-10:30" },
      { id: "1_3", time: "10:30-11:30" }
    ]
  },
  {
    id: "2",
    activityId: "2",
    slots: [
      { id: "2_1", time: "15:00-16:00" },
      { id: "2_2", time: "16:00-17:00" },
      { id: "2_3", time: "17:00-18:00" }
    ]
  },
  {
    id: "3",
    activityId: "3",
    slots: [
      { id: "3_1", time: "09:00-10:00" },
      { id: "3_2", time: "10:00-11:00" },
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
