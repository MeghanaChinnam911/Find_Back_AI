export type UserRole = 'POLICE' | 'NGO' | 'CITIZEN' | 'ADMIN';

export type CaseStatus = 'ACTIVE' | 'RESOLVED' | 'UNDER_REVIEW';

export type MatchStatus = 'PENDING_VERIFICATION' | 'VERIFIED_MATCH' | 'REJECTED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  created_at: string;
}

export interface MissingPerson {
  id: number;
  photo_url: string;
  name: string;
  age: number;
  date_of_birth?: string;
  missing_date: string;
  missing_location: string;
  latitude: number;
  longitude: number;
  guardian_name?: string;
  guardian_phone?: string;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface UnidentifiedPerson {
  id: number;
  photo_url: string;
  location: string;
  latitude: number;
  longitude: number;
  uploader_phone: string;
  name?: string;
  approximate_age?: number;
  native_location?: string;
  additional_details?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PotentialMatch {
  id: number;
  missing_person_id: number;
  unidentified_person_id: number;
  visual_score: number;
  metadata_score: number;
  overall_score: number;
  status: MatchStatus;
  verified_by?: number;
  verified_at?: string;
  notes?: string;
  created_at: string;
  missing_person: MissingPerson;
  unidentified_person: UnidentifiedPerson;
}

export interface NotificationItem {
  id: number;
  user_role: string;
  title: string;
  message: string;
  type: string;
  target_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface AgentQueryResponse {
  answer: string;
  tool_calls: Array<{ tool_name: string; args: any }>;
  extracted_params: Record<string, any>;
  filtered_missing_cases: MissingPerson[];
  filtered_unidentified: UnidentifiedPerson[];
  statistics: Record<string, any>;
  map_action?: {
    center: [number, number];
    zoom: number;
    highlight_count: number;
    filter_location?: string;
  };
}

export interface AnalyticsOverview {
  active_missing_count: number;
  unidentified_count: number;
  potential_matches_count: number;
  resolved_count: number;
  cases_by_age_group: {
    children: number;
    adults: number;
    elderly: number;
  };
  cases_by_area: Array<{
    location: string;
    count: number;
    risk_level: 'RED' | 'ORANGE' | 'GREEN';
  }>;
  recent_trend: Array<{ date: string; cases: number }>;
  high_risk_zones: Array<{ location: string; count: number; risk_level: string }>;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: string;
  timestamp: string;
}
