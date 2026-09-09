export interface RawMapsBusiness {
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviews: number | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  cid: string | null;
  googleMapsUrl: string | null;
  thumbnail: string | null;
  openState: string | null;
  operatingHours?: Record<string, string> | null;
  priceLevel: string | null;
  description: string | null;
  serviceOptions?: Record<string, boolean> | null;
  sourceQuery: string;
  sourceProvider: string;
  isDemo: boolean;
}

export interface MapsSearchOptions {
  limit?: number;
  maxResults?: number;
  offset?: number;
}

export interface IMapsSearchProvider {
  readonly providerName: string;
  search(query: string, location: string, options?: MapsSearchOptions): Promise<RawMapsBusiness[]>;
}
