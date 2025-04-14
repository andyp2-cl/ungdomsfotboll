
export interface CupMatch {
  id: string;
  name: string;
  time: string;
  location?: string;
  locationDescription?: string;
  homeScore?: number;
  awayScore?: number;
  result?: string;
}
