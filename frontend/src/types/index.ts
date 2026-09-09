export type OpportunityTier = 'Very High' | 'High' | 'Medium' | 'Low';
export type WebsiteStatus = 'Website Found' | 'Website Not Found' | 'Website Unclear';
export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Not Interested' | 'Client' | 'Closed';
export type ValidationStatus = 'VERIFIED' | 'POTENTIAL' | 'INVALID';

export interface EvidenceItem {
  type: 'search_result' | 'website' | 'instagram' | 'facebook' | 'google_business' | 'phone' | 'email';
  source: string;
  status: 'valid' | 'invalid' | 'unreachable' | 'unverified' | 'verified';
  description: string;
}

export interface ContactVerificationState {
  value: string | null;
  status: 'verified' | 'unverified' | 'invalid' | 'valid' | 'unreachable' | 'none';
  reason?: string;
}

export interface Lead {
  id: string;
  normalizedIdentityKey: string;
  businessName: string;
  niche: string;
  location: string;
  description?: string | null;
  websiteStatus: WebsiteStatus;
  websiteUrl?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  phone?: string | null;
  email?: string | null;
  googleBusinessUrl?: string | null;
  discoverySource?: string;
  googlePlaceId?: string | null;
  googleCid?: string | null;
  googleMapsUrl?: string | null;
  address?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  fieldEvidence?: string | Record<string, any> | null;
  sourceUrl?: string | null;
  searchQuery?: string | null;
  searchProvider?: string | null;
  validationStatus: ValidationStatus;
  validationConfidence: number;
  isDemo?: boolean;
  evidence?: string | EvidenceItem[] | null;
  urlValidations?: string | Record<string, any> | null;
  contactVerifications?: string | Record<string, ContactVerificationState> | null;
  opportunityScore: number;
  scoreTier: OpportunityTier;
  scoreReason?: string | null;
  status: LeadStatus;
  notes?: string | null;
  demoGenerated?: boolean;
  discoveredAt: string;
  updatedAt: string;
  statusHistory?: Array<{
    id: string;
    oldStatus?: string;
    newStatus: string;
    note?: string;
    changedAt: string;
  }>;
  websiteDemoPrompts?: WebsiteDemoPrompt[];
  outreachMessages?: OutreachMessage[];
}

export interface WebsiteDemoPrompt {
  id: string;
  leadId: string;
  prompt: string;
  createdAt: string;
}

export interface OutreachMessage {
  id: string;
  leadId: string;
  style: string;
  tone?: string;
  language?: string;
  messageText: string;
  demoGeneratedAtGeneration?: boolean;
  createdAt: string;
}

export interface SearchResultsSummary {
  discovered: number;
  withWebsite: number;
  withoutWebsite: number;
  highOpportunity: number;
  needsVerification: number;
  rejected: number;
}

export interface Niche {
  id: string;
  name: string;
  category: string;
  keywords: string;
  synonyms: string;
  searchOperators?: string | null;
  isCustom: boolean;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  nicheId?: string | null;
  nicheName: string;
  locations: string;
  options?: string | null;
  totalFound: number;
  createdAt: string;
  queries?: Array<{
    id: string;
    queryText: string;
    operatorType: string;
    resultsCount: number;
  }>;
}

export interface GeneratedQuery {
  query: string;
  location: string;
  operatorType: string;
  description: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  highOpportunityLeads: number;
  leadsWithoutWebsites: number;
  leadsContacted: number;
  leadsInterested: number;
  clientsWon: number;
  conversionRate: number;
}

export interface DashboardStats {
  metrics: DashboardMetrics;
  tierBreakdown: {
    veryHigh: number;
    high: number;
    medium: number;
    low: number;
  };
  topProspects: Lead[];
  recentSearches: SavedSearch[];
}
