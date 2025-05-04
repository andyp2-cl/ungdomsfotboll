
import { z } from "zod";

export const activityFormSchema = z.object({
  name: z.string().min(1, "Namn måste anges"),
  type: z.enum(["match", "cup", "training"]),
  date: z.date({ required_error: "Välj ett datum" }),
  time: z.string().optional(),
  location: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    gpsLink: z.string().optional(),
  }).optional(),
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  cupName: z.string().optional(),
  isWin: z.boolean().optional(),
  leagueId: z.string().optional(), // Add leagueId field to the schema
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

// Export nested location structure to avoid type errors
export type LocationValues = {
  name?: string;
  description?: string;
  gpsLink?: string;
};
