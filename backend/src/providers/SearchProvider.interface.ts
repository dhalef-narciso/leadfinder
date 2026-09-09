export interface RawSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  pagemap?: Record<string, any>;
  sourceQuery: string;
  detectedSocialPlatform?: 'instagram' | 'facebook' | 'tiktok' | 'google_business' | null;
  searchProvider?: string;
  isDemo?: boolean;
}

export interface SearchOptions {
  limit?: number;
  depth?: number;
  includeInstagram?: boolean;
  includeFacebook?: boolean;
  includeGoogleBusiness?: boolean;
}

export interface ISearchProvider {
  readonly providerName: string;
  search(query: string, location: string, options?: SearchOptions): Promise<RawSearchResult[]>;
}
