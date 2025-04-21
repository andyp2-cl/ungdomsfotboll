
import { z } from "zod";

export const activityFormSchema = z.object({
  name: z.string().min(1, {
    message: "Aktivitetsnamnet kan inte vara tomt.",
  }),
  
  type: z.enum(["match", "cup"], {
    required_error: "Välj en aktivitetstyp.",
  }),
  
  date: z.date({
    required_error: "Välj ett datum för aktiviteten.",
  }),
  
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
  league_id: z.string().optional(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

// League schema
export const leagueFormSchema = z.object({
  name: z.string().min(1, {
    message: "Ligans namn kan inte vara tomt.",
  }),
  year: z.number({
    required_error: "Ange ett år för ligan.",
  }).int().min(2000).max(2099),
  division: z.string().min(1, {
    message: "Division kan inte vara tom.",
  }),
});

export type LeagueFormValues = z.infer<typeof leagueFormSchema>;
