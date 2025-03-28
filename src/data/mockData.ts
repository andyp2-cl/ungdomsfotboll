import { Activity, Player } from "@/types/player";

export const mockPlayers: Player[] = [
  { id: "1", name: "Acke Kristiansson", grade: "A", positions: ["BACK", "MF"], activities: [] },
  { id: "2", name: "Alvin Hansson", grade: "A", positions: ["MF"], activities: [] },
  { id: "3", name: "Colin Brandt", grade: "A", positions: ["BACK"], activities: [] },
  { id: "4", name: "David Tanase", grade: "A", positions: ["MF", "ANF"], activities: [] },
  { id: "5", name: "Edison Rexhepi", grade: "A", positions: ["MF", "ANF"], activities: [] },
  { id: "6", name: "Erik Kallberg", grade: "A", positions: ["MV", "BACK", "ANF"], activities: [] },
  { id: "7", name: "Harry Waldau", grade: "A", positions: ["MV"], activities: [] },
  { id: "8", name: "Herman Lavin", grade: "A", positions: ["MF"], activities: [] },
  { id: "9", name: "Milo Petersson", grade: "A", positions: ["MV", "MF"], activities: [] },
  { id: "10", name: "Milton Borg", grade: "A", positions: ["MF", "ANF"], activities: [] },
  { id: "11", name: "Yazan", grade: "A", positions: ["MF", "BACK"], activities: [] },
  { id: "12", name: "Anuar Shala", grade: "B", positions: ["BACK"], activities: [] },
  { id: "13", name: "Arvid Zenthio", grade: "B", positions: ["BACK", "MF"], activities: [] },
  { id: "14", name: "Elias Workneh", grade: "B", positions: ["BACK", "MF"], activities: [] },
  { id: "15", name: "Josef Baroud", grade: "B", positions: ["MF", "ANF"], activities: [] },
  { id: "16", name: "Liam Bemby", grade: "B", positions: ["MF", "ANF"], activities: [] },
  { id: "17", name: "Lionel Joumaa", grade: "B", positions: ["BACK"], activities: [] },
  { id: "18", name: "Lukas Liljeqvist", grade: "B", positions: ["MF"], activities: [] },
  { id: "19", name: "Matteus Malmqvist", grade: "B", positions: ["MV", "BACK"], activities: [] },
  { id: "20", name: "Alexander Bendz", grade: "C", positions: ["MF", "ANF"], activities: [] },
  { id: "21", name: "Aston Eklom", grade: "C", positions: ["BACK"], activities: [] },
  { id: "22", name: "Joel Thulin", grade: "C", positions: ["BACK", "MF"], activities: [] },
  { id: "23", name: "Loa Gläder", grade: "C", positions: ["MF", "ANF"], activities: [] },
  { id: "24", name: "Lucas Gloeckner", grade: "C", positions: ["BACK"], activities: [] },
  { id: "25", name: "Teoman Saran", grade: "C", positions: ["MF"], activities: [] },
  { id: "26", name: "Theo Rydhe", grade: "C", positions: ["MF"], activities: [] },
  { id: "27", name: "Adam Kucukovic", grade: "D", positions: ["ANF"], activities: [] },
  { id: "28", name: "Adel Ndugwa Mukiibi", grade: "D", positions: ["ANF"], activities: [] },
  { id: "29", name: "Alessandro Gatica", grade: "D", positions: ["BACK"], activities: [] },
  { id: "30", name: "Altin Kutllovci", grade: "D", positions: ["MV"], activities: [] },
  { id: "31", name: "Denis Hukic", grade: "D", positions: ["MF", "ANF"], activities: [] },
  { id: "32", name: "Hardy Persson", grade: "D", positions: ["MF"], activities: [] },
  { id: "33", name: "Kevin Schmidt", grade: "D", positions: ["MF"], activities: [] },
  { id: "34", name: "Liam Karlsson Sjöstrand", grade: "D", positions: ["MF"], activities: [] },
  { id: "35", name: "Lincoln Stenhöös", grade: "D", positions: ["MF"], activities: [] },
  { id: "36", name: "Noah Åkesson nilsson", grade: "D", positions: ["BACK"], activities: [] },
  { id: "37", name: "Andreas Petersson", grade: "A", positions: ["TRÄNARE"], activities: [] },
  { id: "38", name: "Anna Zenthio", grade: "A", positions: ["TRÄNARE"], activities: [] },
  { id: "39", name: "Tage", grade: "A", positions: ["MV"], activities: [] },
  { id: "40", name: "Ted Petersson", grade: "A", positions: ["TRÄNARE"], activities: [] },
  { id: "41", name: "Tommie Hanson", grade: "A", positions: ["TRÄNARE"], activities: [] },
];

export const mockActivities: Activity[] = [
  { 
    id: "1", 
    name: "Match mot FK Finja", 
    date: "2024-04-14", 
    type: "match",
    participants: []
  },
  { 
    id: "2", 
    name: "Match mot Vittsjö GIK", 
    date: "2024-04-21", 
    type: "match",
    participants: []
  },
  { 
    id: "3", 
    name: "Knatteligan", 
    date: "2024-04-28", 
    type: "cup",
    participants: []
  },
  { 
    id: "4", 
    name: "Match mot IFK Osby", 
    date: "2024-05-05", 
    type: "match",
    participants: []
  },
  { 
    id: "5", 
    name: "Lag-cup Åhus", 
    date: "2024-05-18", 
    type: "cup",
    participants: []
  },
  { 
    id: "6", 
    name: "Match mot Vinslövs IF", 
    date: "2025-01-12", 
    type: "match",
    participants: []
  },
  { 
    id: "7", 
    name: "Match mot Sösdala IF", 
    date: "2025-01-10", 
    type: "match",
    participants: []
  },
  { 
    id: "8", 
    name: "Match mot IFK Osby vit", 
    date: "2025-01-11", 
    type: "match",
    participants: []
  },
  { 
    id: "9", 
    name: "Match mot Åhus Horna BK röd", 
    date: "2025-01-11", 
    type: "match",
    participants: []
  },
  { 
    id: "10", 
    name: "Match mot Ifö Bromölla IF", 
    date: "2025-01-11", 
    type: "match",
    participants: []
  },
  { 
    id: "11", 
    name: "Match mot Kristianstad FC orange", 
    date: "2025-01-13", 
    type: "match",
    participants: []
  },
  { 
    id: "12", 
    name: "Match mot Åsums BK", 
    date: "2025-01-16", 
    type: "match",
    participants: []
  },
  { 
    id: "13", 
    name: "Match mot Kristianstad FC svart", 
    date: "2025-01-13", 
    type: "match",
    participants: []
  },
  { 
    id: "14", 
    name: "Match mot IFK Hässleholm svart", 
    date: "2025-01-17", 
    type: "match",
    participants: []
  },
  { 
    id: "15", 
    name: "Match mot Åhus Horna BK vit", 
    date: "2025-01-19", 
    type: "match",
    participants: []
  },
  { 
    id: "16", 
    name: "Match mot Vittsjö GIK", 
    date: "2025-01-19", 
    type: "match",
    participants: []
  },
  { 
    id: "17", 
    name: "Match mot Nosaby IF blå", 
    date: "2025-01-20", 
    type: "match",
    participants: []
  },
  { 
    id: "18", 
    name: "Match mot Ifö Bromölla IF", 
    date: "2025-01-21", 
    type: "match",
    participants: []
  },
  { 
    id: "19", 
    name: "Match mot Nosaby IF grön", 
    date: "2025-01-20", 
    type: "match",
    participants: []
  },
  { 
    id: "20", 
    name: "Match mot Åhus Horna BK svart", 
    date: "2025-01-23", 
    type: "match",
    participants: []
  },
  { 
    id: "21", 
    name: "Match mot Sibbhults IF", 
    date: "2025-01-21", 
    type: "match",
    participants: []
  },
  { 
    id: "22", 
    name: "Match mot IFK Osby blå", 
    date: "2025-01-24", 
    type: "match",
    participants: []
  },
  { 
    id: "23", 
    name: "Match mot Nosaby IF röd", 
    date: "2025-01-25", 
    type: "match",
    participants: []
  },
  { 
    id: "24", 
    name: "Match mot Tollarp IF blå", 
    date: "2025-01-25", 
    type: "match",
    participants: []
  },
  { 
    id: "25", 
    name: "Match mot Höör IS blå", 
    date: "2025-01-26", 
    type: "match",
    participants: []
  },
  { 
    id: "26", 
    name: "Match mot Broby IF orange", 
    date: "2025-01-26", 
    type: "match",
    participants: []
  },
  { 
    id: "27", 
    name: "Match mot Kristianstad FC orange", 
    date: "2025-01-26", 
    type: "match",
    participants: []
  },
  { 
    id: "28", 
    name: "Match mot Vinslöv IF vit", 
    date: "2025-01-27", 
    type: "match",
    participants: []
  },
  { 
    id: "29", 
    name: "Match mot Hästvedta IF", 
    date: "2025-01-28", 
    type: "match",
    participants: []
  },
  { 
    id: "30", 
    name: "Match mot Viby IF Grön", 
    date: "2025-02-03", 
    type: "match",
    participants: []
  },
  { 
    id: "31", 
    name: "Match mot Wä IF orange", 
    date: "2025-02-03", 
    type: "match",
    participants: []
  },
  { 
    id: "32", 
    name: "Match mot Finja IF", 
    date: "2025-02-04", 
    type: "match",
    participants: []
  },
  { 
    id: "33", 
    name: "Match mot Nosaby IF vit", 
    date: "2025-02-04", 
    type: "match",
    participants: []
  },
];
