
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

// Formation templates - arrange players' positions on a virtual field
export const FORMATIONS: Record<string, Formation> = {
  "4-4-2": {
    name: "4-4-2",
    positions: [
      { row: 0, col: 2, position: "MV" },
      { row: 1, col: 0, position: "BACK" },
      { row: 1, col: 1, position: "BACK" },
      { row: 1, col: 3, position: "BACK" },
      { row: 1, col: 4, position: "BACK" },
      { row: 2, col: 0, position: "MF" },
      { row: 2, col: 1, position: "MF" },
      { row: 2, col: 3, position: "MF" },
      { row: 2, col: 4, position: "MF" },
      { row: 3, col: 1, position: "ANF" },
      { row: 3, col: 3, position: "ANF" },
    ]
  },
  "4-3-3": {
    name: "4-3-3",
    positions: [
      { row: 0, col: 2, position: "MV" },
      { row: 1, col: 0, position: "BACK" },
      { row: 1, col: 1, position: "BACK" },
      { row: 1, col: 3, position: "BACK" },
      { row: 1, col: 4, position: "BACK" },
      { row: 2, col: 1, position: "MF" },
      { row: 2, col: 2, position: "MF" },
      { row: 2, col: 3, position: "MF" },
      { row: 3, col: 0, position: "ANF" },
      { row: 3, col: 2, position: "ANF" },
      { row: 3, col: 4, position: "ANF" },
    ]
  },
  "3-5-2": {
    name: "3-5-2",
    positions: [
      { row: 0, col: 2, position: "MV" },
      { row: 1, col: 1, position: "BACK" },
      { row: 1, col: 2, position: "BACK" },
      { row: 1, col: 3, position: "BACK" },
      { row: 2, col: 0, position: "MF" },
      { row: 2, col: 1, position: "MF" },
      { row: 2, col: 2, position: "MF" },
      { row: 2, col: 3, position: "MF" },
      { row: 2, col: 4, position: "MF" },
      { row: 3, col: 1, position: "ANF" },
      { row: 3, col: 3, position: "ANF" },
    ]
  }
};
