
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
  isTrainer: z.boolean().default(false),
  development: z.object({
    technical: z.number().min(1).max(10).default(1),
    gameUnderstanding: z.number().min(1).max(10).default(1),
    passing: z.number().min(1).max(10).default(1),
    offensive: z.number().min(1).max(10).default(1),
    defensive: z.number().min(1).max(10).default(1),
    mentality: z.number().min(1).max(10).default(1)
  }).default({
    technical: 1,
    gameUnderstanding: 1,
    passing: 1,
    offensive: 1,
    defensive: 1,
    mentality: 1
  })
});

export type PlayerFormValues = z.infer<typeof formSchema>;
