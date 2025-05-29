
import { z } from "zod";

// Player development schema with all fields
export const playerDevelopmentSchema = z.object({
  // Core values
  technical: z.number().min(1).max(10),
  gameUnderstanding: z.number().min(1).max(10),
  passing: z.number().min(1).max(10),
  offensive: z.number().min(1).max(10),
  defensive: z.number().min(1).max(10),
  mentality: z.number().min(1).max(10),
  
  // New offensive values
  shooting: z.number().min(1).max(10),
  crossing: z.number().min(1).max(10),
  finishing: z.number().min(1).max(10),
  creativity: z.number().min(1).max(10),
  
  // New defensive values
  tackling: z.number().min(1).max(10),
  interception: z.number().min(1).max(10),
  positioning: z.number().min(1).max(10),
  heading: z.number().min(1).max(10),
  
  // New physical values
  speed: z.number().min(1).max(10),
  stamina: z.number().min(1).max(10),
  strength: z.number().min(1).max(10),
  
  // New mental values
  leadership: z.number().min(1).max(10),
  composure: z.number().min(1).max(10),
  workRate: z.number().min(1).max(10)
});

export const formSchema = z.object({
  name: z.string().min(1, "Namn krävs"),
  grade: z.enum(["A", "B", "C", "D"]).optional(),
  positions: z.array(z.string()).min(1, "Minst en position krävs"),
  jerseyNumber: z.string().optional(),
  isTrainer: z.boolean().default(false),
  isActive: z.boolean().default(true), // New field for active/inactive status
  development: playerDevelopmentSchema,
});

export type PlayerFormValues = z.infer<typeof formSchema>;
export type PlayerDevelopment = z.infer<typeof playerDevelopmentSchema>;
