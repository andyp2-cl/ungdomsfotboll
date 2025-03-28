import { Activity, Player, KioskSchedule, KioskSlot } from "@/types/player";

export const mockPlayers: Player[] = [
  { id: "1", name: "Acke Kristiansson", grade: "A", position: "BACK MF", activities: [] },
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
  { 
    id: "6", 
    name: "Match mot Vinslövs IF", 
    date: "2025-01-12", 
    type: "match",
    participants: [],
    kioskScheduleId: "6"
  },
  { 
    id: "7", 
    name: "Match mot Sösdala IF", 
    date: "2025-01-10", 
    type: "match",
    participants: [],
    kioskScheduleId: "7"
  },
  { 
    id: "8", 
    name: "Match mot IFK Osby vit", 
    date: "2025-01-11", 
    type: "match",
    participants: [],
    kioskScheduleId: "8"
  },
  { 
    id: "9", 
    name: "Match mot Åhus Horna BK röd", 
    date: "2025-01-11", 
    type: "match",
    participants: [],
    kioskScheduleId: "9"
  },
  { 
    id: "10", 
    name: "Match mot Ifö Bromölla IF", 
    date: "2025-01-11", 
    type: "match",
    participants: [],
    kioskScheduleId: "10"
  },
  { 
    id: "11", 
    name: "Match mot Kristianstad FC orange", 
    date: "2025-01-13", 
    type: "match",
    participants: [],
    kioskScheduleId: "11"
  },
  { 
    id: "12", 
    name: "Match mot Åsums BK", 
    date: "2025-01-16", 
    type: "match",
    participants: [],
    kioskScheduleId: "12"
  },
  { 
    id: "13", 
    name: "Match mot Kristianstad FC svart", 
    date: "2025-01-13", 
    type: "match",
    participants: [],
    kioskScheduleId: "13"
  },
  { 
    id: "14", 
    name: "Match mot IFK Hässleholm svart", 
    date: "2025-01-17", 
    type: "match",
    participants: [],
    kioskScheduleId: "14"
  },
  { 
    id: "15", 
    name: "Match mot Åhus Horna BK vit", 
    date: "2025-01-19", 
    type: "match",
    participants: [],
    kioskScheduleId: "15"
  },
  { 
    id: "16", 
    name: "Match mot Vittsjö GIK", 
    date: "2025-01-19", 
    type: "match",
    participants: [],
    kioskScheduleId: "16"
  },
  { 
    id: "17", 
    name: "Match mot Nosaby IF blå", 
    date: "2025-01-20", 
    type: "match",
    participants: [],
    kioskScheduleId: "17"
  },
  { 
    id: "18", 
    name: "Match mot Ifö Bromölla IF", 
    date: "2025-01-21", 
    type: "match",
    participants: [],
    kioskScheduleId: "18"
  },
  { 
    id: "19", 
    name: "Match mot Nosaby IF grön", 
    date: "2025-01-20", 
    type: "match",
    participants: [],
    kioskScheduleId: "19"
  },
  { 
    id: "20", 
    name: "Match mot Åhus Horna BK svart", 
    date: "2025-01-23", 
    type: "match",
    participants: [],
    kioskScheduleId: "20"
  },
  { 
    id: "21", 
    name: "Match mot Sibbhults IF", 
    date: "2025-01-21", 
    type: "match",
    participants: [],
    kioskScheduleId: "21"
  },
  { 
    id: "22", 
    name: "Match mot IFK Osby blå", 
    date: "2025-01-24", 
    type: "match",
    participants: [],
    kioskScheduleId: "22"
  },
  { 
    id: "23", 
    name: "Match mot Nosaby IF röd", 
    date: "2025-01-25", 
    type: "match",
    participants: [],
    kioskScheduleId: "23"
  },
  { 
    id: "24", 
    name: "Match mot Tollarp IF blå", 
    date: "2025-01-25", 
    type: "match",
    participants: [],
    kioskScheduleId: "24"
  },
  { 
    id: "25", 
    name: "Match mot Höör IS blå", 
    date: "2025-01-26", 
    type: "match",
    participants: [],
    kioskScheduleId: "25"
  },
  { 
    id: "26", 
    name: "Match mot Broby IF orange", 
    date: "2025-01-26", 
    type: "match",
    participants: [],
    kioskScheduleId: "26"
  },
  { 
    id: "27", 
    name: "Match mot Kristianstad FC orange", 
    date: "2025-01-26", 
    type: "match",
    participants: [],
    kioskScheduleId: "27"
  },
  { 
    id: "28", 
    name: "Match mot Vinslöv IF vit", 
    date: "2025-01-27", 
    type: "match",
    participants: [],
    kioskScheduleId: "28"
  },
  { 
    id: "29", 
    name: "Match mot Hästvedta IF", 
    date: "2025-01-28", 
    type: "match",
    participants: [],
    kioskScheduleId: "29"
  },
  { 
    id: "30", 
    name: "Match mot Viby IF Grön", 
    date: "2025-02-03", 
    type: "match",
    participants: [],
    kioskScheduleId: "30"
  },
  { 
    id: "31", 
    name: "Match mot Wä IF orange", 
    date: "2025-02-03", 
    type: "match",
    participants: [],
    kioskScheduleId: "31"
  },
  { 
    id: "32", 
    name: "Match mot Finja IF", 
    date: "2025-02-04", 
    type: "match",
    participants: [],
    kioskScheduleId: "32"
  },
  { 
    id: "33", 
    name: "Match mot Nosaby IF vit", 
    date: "2025-02-04", 
    type: "match",
    participants: [],
    kioskScheduleId: "33"
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
  },
  {
    id: "6",
    activityId: "6",
    slots: [
      { id: "6_1", time: "09:00-10:00" },
      { id: "6_2", time: "10:00-11:00" },
    ]
  },
  {
    id: "7",
    activityId: "7",
    slots: [
      { id: "7_1", time: "09:00-10:00" },
      { id: "7_2", time: "10:00-11:00" },
    ]
  },
  {
    id: "8",
    activityId: "8",
    slots: [
      { id: "8_1", time: "11:00-12:00" },
    ]
  },
  {
    id: "9",
    activityId: "9",
    slots: [
      { id: "9_1", time: "10:00-11:00" },
      { id: "9_2", time: "11:00-12:00" },
    ]
  },
  {
    id: "10",
    activityId: "10",
    slots: [
      { id: "10_1", time: "12:00-13:00" },
    ]
  },
  {
    id: "11",
    activityId: "11",
    slots: [
      { id: "11_1", time: "13:00-14:00" },
    ]
  },
  {
    id: "12",
    activityId: "12",
    slots: [
      { id: "12_1", time: "13:00-14:00" },
      { id: "12_2", time: "14:00-15:00" },
    ]
  },
  {
    id: "13",
    activityId: "13",
    slots: [
      { id: "13_1", time: "12:00-13:00" },
    ]
  },
  {
    id: "14",
    activityId: "14",
    slots: [
      { id: "14_1", time: "09:30-10:30" },
      { id: "14_2", time: "10:30-11:30" },
    ]
  },
  {
    id: "15",
    activityId: "15",
    slots: [
      { id: "15_1", time: "11:00-12:00" },
      { id: "15_2", time: "12:00-13:00" },
    ]
  },
  {
    id: "16",
    activityId: "16",
    slots: [
      { id: "16_1", time: "11:00-12:00" },
      { id: "16_2", time: "12:00-13:00" },
    ]
  },
  {
    id: "17",
    activityId: "17",
    slots: [
      { id: "17_1", time: "09:30-10:30" },
      { id: "17_2", time: "10:30-11:30" },
    ]
  },
  {
    id: "18",
    activityId: "18",
    slots: [
      { id: "18_1", time: "12:00-13:00" },
      { id: "18_2", time: "13:00-14:00" },
    ]
  },
  {
    id: "19",
    activityId: "19",
    slots: [
      { id: "19_1", time: "10:00-11:00" },
      { id: "19_2", time: "11:00-12:00" },
    ]
  },
  {
    id: "20",
    activityId: "20",
    slots: [
      { id: "20_1", time: "12:30-13:30" },
    ]
  },
  {
    id: "21",
    activityId: "21",
    slots: [
      { id: "21_1", time: "10:00-11:00" },
      { id: "21_2", time: "11:00-12:00" },
    ]
  },
  {
    id: "22",
    activityId: "22",
    slots: [
      { id: "22_1", time: "15:30-16:30" },
      { id: "22_2", time: "16:30-17:30" },
    ]
  },
  {
    id: "23",
    activityId: "23",
    slots: [
      { id: "23_1", time: "10:00-11:00" },
      { id: "23_2", time: "11:00-12:00" },
    ]
  },
  {
    id: "24",
    activityId: "24",
    slots: [
      { id: "24_1", time: "11:00-12:00" },
      { id: "24_2", time: "12:00-13:00" },
    ]
  },
  {
    id: "25",
    activityId: "25",
    slots: [
      { id: "25_1", time: "00:00-01:00" },
      { id: "25_2", time: "01:00-02:00" },
    ]
  },
  {
    id: "26",
    activityId: "26",
    slots: [
      { id: "26_1", time: "09:30-10:30" },
      { id: "26_2", time: "10:30-11:30" },
    ]
  },
  {
    id: "27",
    activityId: "27",
    slots: [
      { id: "27_1", time: "12:00-13:00" },
      { id: "27_2", time: "13:00-14:00" },
    ]
  },
  {
    id: "28",
    activityId: "28",
    slots: [
      { id: "28_1", time: "10:00-11:00" },
      { id: "28_2", time: "11:00-12:00" },
    ]
  },
  {
    id: "29",
    activityId: "29",
    slots: [
      { id: "29_1", time: "18:00-19:00" },
      { id: "29_2", time: "19:00-20:00" },
    ]
  },
  {
    id: "30",
    activityId: "30",
    slots: [
      { id: "30_1", time: "09:30-10:30" },
      { id: "30_2", time: "10:30-11:30" },
    ]
  },
  {
    id: "31",
    activityId: "31",
    slots: [
      { id: "31_1", time: "11:00-12:00" },
      { id: "31_2", time: "12:00-13:00" },
    ]
  },
  {
    id: "32",
    activityId: "32",
    slots: [
      { id: "32_1", time: "10:00-11:00" },
      { id: "32_2", time: "11:00-12:00" },
    ]
  },
  {
    id: "33",
    activityId: "33",
    slots: [
      { id: "33_1", time: "11:00-12:00" },
      { id: "33_2", time: "12:00-13:00" },
    ]
  },
];
