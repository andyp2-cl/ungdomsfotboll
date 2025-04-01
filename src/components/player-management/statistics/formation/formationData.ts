
import { PlayerPosition } from "@/types/player";

export interface FormationPosition {
  row: number;
  col: number;
  position: PlayerPosition;
}

export interface Formation {
  name: string;
  positions: FormationPosition[];
}

// Formation templates for 7-player formations
export const FORMATIONS: Record<string, Formation> = {
  "2-3-1": {
    name: "2-3-1",
    positions: [
      { row: 0, col: 2, position: "MV" },
      { row: 1, col: 1, position: "BACK" },
      { row: 1, col: 3, position: "BACK" },
      { row: 2, col: 1, position: "MF" },
      { row: 2, col: 2, position: "MF" },
      { row: 2, col: 3, position: "MF" },
      { row: 3, col: 2, position: "ANF" },
    ]
  },
  "3-2-1": {
    name: "3-2-1",
    positions: [
      { row: 0, col: 2, position: "MV" },
      { row: 1, col: 1, position: "BACK" },
      { row: 1, col: 2, position: "BACK" },
      { row: 1, col: 3, position: "BACK" },
      { row: 2, col: 1, position: "MF" },
      { row: 2, col: 3, position: "MF" },
      { row: 3, col: 2, position: "ANF" },
    ]
  },
  "2-2-2": {
    name: "2-2-2",
    positions: [
      { row: 0, col: 2, position: "MV" },
      { row: 1, col: 1, position: "BACK" },
      { row: 1, col: 3, position: "BACK" },
      { row: 2, col: 1, position: "MF" },
      { row: 2, col: 3, position: "MF" },
      { row: 3, col: 1, position: "ANF" },
      { row: 3, col: 3, position: "ANF" },
    ]
  }
};
