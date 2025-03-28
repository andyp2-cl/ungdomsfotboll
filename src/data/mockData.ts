
import { Activity, Player } from "@/types/player";

export const mockPlayers: Player[] = [
  { id: "1", name: "Alexander Isak", grade: "A", activities: ["1", "3"] },
  { id: "2", name: "Victor Lindelöf", grade: "A", activities: ["1", "2"] },
  { id: "3", name: "Dejan Kulusevski", grade: "A", activities: ["1", "3"] },
  { id: "4", name: "Emil Forsberg", grade: "B", activities: ["2"] },
  { id: "5", name: "Robin Olsen", grade: "B", activities: ["1"] },
  { id: "6", name: "Ludwig Augustinsson", grade: "C", activities: ["3"] },
  { id: "7", name: "Mattias Svanberg", grade: "C", activities: ["2"] },
  { id: "8", name: "Kristoffer Olsson", grade: "B", activities: ["1", "2"] },
  { id: "9", name: "Ken Sema", grade: "C", activities: [] },
  { id: "10", name: "Viktor Gyökeres", grade: "A", activities: ["1", "3"] },
];

export const mockActivities: Activity[] = [
  { 
    id: "1", 
    name: "Landskamp mot Danmark", 
    date: "2023-06-10", 
    type: "match",
    participants: ["1", "2", "3", "5", "8", "10"]
  },
  { 
    id: "2", 
    name: "Nordic Cup", 
    date: "2023-07-15", 
    type: "cup",
    participants: ["2", "4", "7", "8"]
  },
  { 
    id: "3", 
    name: "Träningmatch mot Norge", 
    date: "2023-08-05", 
    type: "match",
    participants: ["1", "3", "6", "10"]
  },
];
