import axios from 'axios';
import { 
  User, MissingPerson, UnidentifiedPerson, PotentialMatch, 
  NotificationItem, AgentQueryResponse, AnalyticsOverview, AuditLog 
} from '../types';

const envApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = envApiUrl ? `${envApiUrl.replace(/\/$/, '')}/api/v1` : '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set token helper
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('findback_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('findback_token');
  }
};

// Initialize token from storage
const savedToken = localStorage.getItem('findback_token');
if (savedToken) {
  setAuthToken(savedToken);
}

export const AuthAPI = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      setAuthToken(res.data.access_token);
    }
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    setAuthToken(null);
  }
};

export const MissingPersonsAPI = {
  list: async (params?: { status?: string; location?: string; age_min?: number; age_max?: number; query?: string }): Promise<MissingPerson[]> => {
    const res = await api.get('/missing-persons', { params });
    return res.data;
  },
  create: async (data: Partial<MissingPerson>): Promise<MissingPerson> => {
    const res = await api.post('/missing-persons', data);
    return res.data;
  },
  getById: async (id: number): Promise<MissingPerson> => {
    const res = await api.get(`/missing-persons/${id}`);
    return res.data;
  }
};

export const UnidentifiedPersonsAPI = {
  list: async (): Promise<UnidentifiedPerson[]> => {
    const res = await api.get('/unidentified-persons');
    return res.data;
  },
  create: async (data: Partial<UnidentifiedPerson>): Promise<UnidentifiedPerson> => {
    const res = await api.post('/unidentified-persons', data);
    return res.data;
  },
  getById: async (id: number): Promise<UnidentifiedPerson> => {
    const res = await api.get(`/unidentified-persons/${id}`);
    return res.data;
  }
};

export const MatchingAPI = {
  getMatches: async (status?: string): Promise<PotentialMatch[]> => {
    const res = await api.get('/matching/matches', { params: { status } });
    return res.data;
  },
  verifyMatch: async (id: number, status: 'VERIFIED_MATCH' | 'REJECTED', notes?: string): Promise<PotentialMatch> => {
    const res = await api.post(`/matching/verify/${id}`, { status, notes });
    return res.data;
  },
  searchPhoto: async (photo_url: string) => {
    const res = await api.post('/matching/search-photo', { photo_url });
    return res.data;
  }
};

export const AgentAPI = {
  query: async (queryText: string): Promise<AgentQueryResponse> => {
    const res = await api.post('/agent/query', { query: queryText });
    return res.data;
  }
};

export const AnalyticsAPI = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await api.get('/analytics/audit-logs');
    return res.data;
  }
};

export const NotificationsAPI = {
  list: async (role: string = 'POLICE'): Promise<NotificationItem[]> => {
    const res = await api.get('/notifications', { params: { role } });
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await api.post(`/notifications/read/${id}`);
    return res.data;
  }
};
