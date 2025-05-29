
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

// Create a schema for player form validation with extended development fields
export const formSchema = z.object({
  name: z.string().min(1, { message: "Namn måste anges" }),
  grade: z.union([z.enum(["A", "B", "C", "D"] as const), z.undefined()]),
  positions: z.array(z.string()),
  jerseyNumber: z.string().optional(),
  isTrainer: z.boolean().default(false),
  development: z.object({
    // Core original fields
    technical: z.number().min(1).max(10).default(1),
    gameUnderstanding: z.number().min(1).max(10).default(1),
    passing: z.number().min(1).max(10).default(1),
    offensive: z.number().min(1).max(10).default(1),
    defensive: z.number().min(1).max(10).default(1),
    mentality: z.number().min(1).max(10).default(1),
    
    // New offensive fields
    shooting: z.number().min(1).max(10).default(1),
    crossing: z.number().min(1).max(10).default(1),
    finishing: z.number().min(1).max(10).default(1),
    creativity: z.number().min(1).max(10).default(1),
    
    // New defensive fields
    tackling: z.number().min(1).max(10).default(1),
    interception: z.number().min(1).max(10).default(1),
    positioning: z.number().min(1).max(10).default(1),
    heading: z.number().min(1).max(10).default(1),
    
    // New physical fields
    speed: z.number().min(1).max(10).default(1),
    stamina: z.number().min(1).max(10).default(1),
    strength: z.number().min(1).max(10).default(1),
    
    // New mental fields
    leadership: z.number().min(1).max(10).default(1),
    composure: z.number().min(1).max(10).default(1),
    workRate: z.number().min(1).max(10).default(1)
  })
});

export type PlayerFormValues = z.infer<typeof formSchema>;
