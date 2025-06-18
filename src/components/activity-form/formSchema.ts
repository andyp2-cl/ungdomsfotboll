import { z } from "zod";

export const activityFormSchema = z.object({
  name: z.string().min(1, "Aktivitetsnamn är obligatoriskt"),
  type: z.enum(["match", "cup", "training"]),
  date: z.date(),
  time: z.string().optional(),
  location: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    gpsLink: z.string().optional(),
  }),
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  cupName: z.string().optional(),
  isWin: z.boolean().optional(),
  leagueId: z.string().optional(),
  homeTeam: z.string().optional(),
  awayTeam: z.string().optional(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
