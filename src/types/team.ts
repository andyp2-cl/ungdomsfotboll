export interface Team {
  id: string;
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  team_id?: string;
  role: 'admin' | 'coach';
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamWithUser extends Team {
  user_profiles?: UserProfile[];
}

export interface CreateTeamData {
  name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface UpdateTeamData {
  name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface TeamBranding {
  primary: string;
  secondary: string;
  logo?: string;
} 