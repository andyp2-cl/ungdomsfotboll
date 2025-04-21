import { supabase } from "@/lib/supabase";
import { Activity } from "@/types/player";

// Define CupMatch type locally
interface CupMatch {
  id?: string;
  name: string;
  time: string;
  location?: string;
  locationDescription?: string;
}
