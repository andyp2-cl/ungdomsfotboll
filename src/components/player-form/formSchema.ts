
import { z } from "zod";
import { PlayerGrade, PlayerPosition } from "@/types/player";

// Define position options for the form
export const positionOptions = [
  { value: "MV", label: "Målvakt" },
  { value: "BACK", label: "Back" },
  { value: "MF", label: "Mittfältare" },
  { value: "ANF", label: "Anfallare" },
  { value: "TRÄNARE", label: "Tränare" }
];

// Create a schema for player form validation
export const formSchema = z.object({
  name: z.string().min(1, { message: "Namn måste anges" }),
  grade: z.union([z.enum(["A", "B", "C", "D"] as const), z.undefined()]),
  positions: z.array(z.string()),
  jerseyNumber: z.string().optional(),
  isTrainer: z.boolean().default(false)
});

export type PlayerFormValues = z.infer<typeof formSchema>;
