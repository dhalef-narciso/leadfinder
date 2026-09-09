import axios from 'axios';
import { Lead, Niche, SavedSearch, DashboardStats, GeneratedQuery, SearchResultsSummary, WebsiteDemoPrompt, OutreachMessage } from '../types';

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiService = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },

  // Niches
  getNiches: async (): Promise<Niche[]> => {
    const res = await api.get<Niche[]>('/niches');
    return res.data;
  },

  createNiche: async (data: { name: string; category?: string; keywords?: string[]; synonyms?: string[] }): Promise<Niche> => {
    const res = await api.post<Niche>('/niches', data);
    return res.data;
  },

  deleteNiche: async (id: string): Promise<void> => {
    await api.delete(`/niches/${id}`);
  },

  // Searches
  previewQueries: async (data: {
    niche: string;
    locations: string[];
    includeInstagram?: boolean;
    includeFacebook?: boolean;
  }): Promise<{ mapsQueries?: string[]; queries: GeneratedQuery[]; count: number }> => {
    const res = await api.post('/searches/preview-queries', data);
    return res.data;
  },

  runSearch: async (data: {
    niche: string;
    locations: string[];
    searchDepth?: number;
    numLeads?: number;
    includeGoogleSearch?: boolean;
    includeInstagram?: boolean;
    includeFacebook?: boolean;
    includeWebsite?: boolean;
    searchName?: string;
  }): Promise<{
    success: boolean;
    searchId: string;
    summary?: SearchResultsSummary;
    queriesRun: any[];
    leadsFound: number;
    leads: Lead[];
  }> => {
    const res = await api.post('/searches/run', data);
    return res.data;
  },

  getSavedSearches: async (): Promise<SavedSearch[]> => {
    const res = await api.get<SavedSearch[]>('/searches');
    return res.data;
  },

  deleteSavedSearch: async (id: string): Promise<void> => {
    await api.delete(`/searches/${id}`);
  },

  clearAllSavedSearches: async (): Promise<void> => {
    await api.delete('/searches');
  },

  // Leads
  getLeads: async (params?: {
    niche?: string;
    location?: string;
    opportunityTier?: string;
    websiteStatus?: string;
    status?: string;
    hasPhone?: boolean;
    hasEmail?: boolean;
    hasInstagram?: boolean;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<Lead[]> => {
    const res = await api.get<Lead[]>('/leads', { params });
    return res.data;
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const res = await api.get<Lead>(`/leads/${id}`);
    return res.data;
  },

  updateLead: async (id: string, data: { status?: string; notes?: string }): Promise<Lead> => {
    const res = await api.patch<Lead>(`/leads/${id}`, data);
    return res.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  clearAllLeads: async (): Promise<void> => {
    await api.delete('/leads');
  },

  generateWebsiteDemoPrompt: async (id: string): Promise<WebsiteDemoPrompt & { demoGenerated: boolean }> => {
    const res = await api.post<WebsiteDemoPrompt & { demoGenerated: boolean }>(`/leads/${id}/demo-prompt`);
    return res.data;
  },

  getWebsiteDemoPrompts: async (id: string): Promise<WebsiteDemoPrompt[]> => {
    const res = await api.get<WebsiteDemoPrompt[]>(`/leads/${id}/demo-prompts`);
    return res.data;
  },

  generateOutreach: async (
    id: string,
    data: {
      tone?: 'Friendly' | 'Professional' | 'Short' | 'Direct' | 'Casual';
      style?: string;
      language?: 'en' | 'pt';
      hasDemo?: boolean;
      contactName?: string;
      save?: boolean;
    }
  ): Promise<OutreachMessage> => {
    const res = await api.post<OutreachMessage>(`/leads/${id}/outreach`, data);
    return res.data;
  },

  getOutreachMessages: async (id: string): Promise<OutreachMessage[]> => {
    const res = await api.get<OutreachMessage[]>(`/leads/${id}/outreach`);
    return res.data;
  },

  // Settings
  getSettings: async (): Promise<{
    activeProvider: string;
    hasApiKey: boolean;
    availableProviders: Array<{ id: string; name: string; active: boolean }>;
  }> => {
    const res = await api.get('/settings');
    return res.data;
  }
};
