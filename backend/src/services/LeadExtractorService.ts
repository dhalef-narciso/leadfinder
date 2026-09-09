import { RawSearchResult } from '../providers/SearchProvider.interface';
import { RawMapsBusiness } from '../providers/MapsSearchProvider.interface';
import { WebsiteDetectorService } from './WebsiteDetectorService';
import { LeadScoringService, ScoreFactors } from './LeadScoringService';
import { DeduplicationService } from './DeduplicationService';
import { LeadValidationService, EvidenceItem } from './LeadValidationService';
import { BusinessEnrichmentService, EnrichmentOptions } from './BusinessEnrichmentService';

export interface ExtractedLead {
  normalizedIdentityKey: string;
  businessName: string;
  niche: string;
  location: string;
  description: string | null;
  websiteStatus: string;
  websiteUrl: string | null;
  instagram: string | null;
  facebook: string | null;
  phone: string | null;
  email: string | null;
  googleBusinessUrl: string | null;
  discoverySource: string;
  googlePlaceId: string | null;
  googleCid: string | null;
  googleMapsUrl: string | null;
  address: string | null;
  rating: number | null;
  reviewsCount: number | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  fieldEvidence: string; // JSON string of Record<string, FieldEvidenceItem>
  sourceUrl: string | null;
  searchQuery: string | null;
  searchProvider: string | null;
  isDemo: boolean;
  validationStatus: 'VERIFIED' | 'POTENTIAL' | 'INVALID';
  validationConfidence: number;
  evidence: string; // JSON string of EvidenceItem[]
  urlValidations: string; // JSON string
  contactVerifications: string; // JSON string
  opportunityScore: number;
  scoreTier: string;
  scoreReason: string;
}

export class LeadExtractorService {
  /**
   * Cleans a search result title into a business name.
   * STRICT: Never fabricates a name if not present.
   */
  static cleanBusinessName(title?: string | null): string | null {
    if (!title || typeof title !== 'string') return null;

    let cleaned = title
      .replace(/\(@[a-zA-Z0-9._-]+\)/g, '')
      .replace(/•\s*Instagram.*$/i, '')
      .replace(/-?\s*Home\s*\|\s*Facebook.*$/i, '')
      .replace(/\s*\|\s*.*$/i, '')
      .replace(/\s*-\s*(Instagram|Facebook|LinkedIn|Official Site|Home|About).*$/i, '')
      .trim();

    if (cleaned.length < 2) return null;
    return cleaned;
  }

  static extractPhone(text?: string | null): string | null {
    if (!text || typeof text !== 'string') return null;
    const phoneRegex = /(\+?[0-9]{1,3}[ -]?)?(\(?[0-9]{2,4}\)?[ -]?)?[0-9]{3,4}[ -]?[0-9]{3,4}/;
    const match = text.match(phoneRegex);
    if (!match) return null;
    const candidate = match[0].trim();
    const digits = candidate.replace(/[^0-9]/g, '');
    if (digits.length >= 7 && digits.length <= 15) {
      return candidate;
    }
    return null;
  }

  static extractEmail(text?: string | null): string | null {
    if (!text || typeof text !== 'string') return null;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = text.match(emailRegex);
    if (!match) return null;
    return match[0].trim().toLowerCase();
  }

  /**
   * PRIMARY PIPELINE:
   * Google Maps Businesses -> Deduplicate -> Enrich (Google Search) -> Validate -> Score
   */
  static async extractFromMapsBusinesses(
    businesses: RawMapsBusiness[],
    niche: string,
    location: string,
    options?: {
      enrichment?: EnrichmentOptions;
      liveCheck?: boolean;
    }
  ): Promise<ExtractedLead[]> {
    // 1. Deduplicate raw Maps results using place ID, CID, phone, domain, normalized name + address
    const deduplicated = DeduplicationService.deduplicateMapsBusinesses(businesses, location);
    const leads: ExtractedLead[] = [];
    const seenKeys = new Set<string>();

    for (const rawBiz of deduplicated) {
      // 2. Information Enrichment (Google Search, Social, Website classification)
      const enriched = await BusinessEnrichmentService.enrichBusiness(
        rawBiz,
        location,
        options?.enrichment || {}
      );

      // 3. Generate deterministic identity key
      const identityKey = DeduplicationService.generateIdentityKey({
        businessName: enriched.businessName,
        location,
        address: enriched.address,
        googlePlaceId: enriched.googlePlaceId,
        googleCid: enriched.googleCid,
        websiteUrl: enriched.websiteUrl,
        instagram: enriched.instagram,
        phone: enriched.phone
      });

      if (seenKeys.has(identityKey)) {
        continue;
      }
      seenKeys.add(identityKey);

      // 4. Validate Lead
      const validation = await LeadValidationService.validateLead(
        {
          businessName: enriched.businessName,
          niche,
          location,
          description: rawBiz.description || (rawBiz.openState ? `Status: ${rawBiz.openState}` : null),
          sourceUrl: enriched.googleMapsUrl,
          searchQuery: rawBiz.sourceQuery,
          searchProvider: enriched.searchProvider,
          websiteStatus: enriched.websiteStatus,
          websiteUrl: enriched.websiteUrl,
          instagram: enriched.instagram,
          facebook: enriched.facebook,
          phone: enriched.phone,
          email: enriched.email,
          googleBusinessUrl: enriched.googleMapsUrl,
          isDemo: rawBiz.isDemo
        },
        { liveCheck: options?.liveCheck ?? false }
      );

      // Google Maps listing is a high-confidence authoritative source: boost confidence if valid
      let finalConfidence = validation.validationConfidence;
      if (rawBiz.placeId && finalConfidence < 85 && validation.validationStatus !== 'INVALID') {
        finalConfidence = Math.min(95, finalConfidence + 15);
      }

      // 5. Score Lead for Opportunity
      const scoreFactors: ScoreFactors = {
        hasNoWebsite: enriched.websiteStatus === 'Website Not Found',
        hasExistingWebsite: enriched.websiteStatus === 'Website Found',
        hasInstagram: !!enriched.instagram,
        hasFacebook: !!enriched.facebook,
        hasPhone: !!enriched.phone,
        hasEmail: !!enriched.email,
        hasGoogleBusiness: true, // Established by Google Maps discovery
        hasActiveSocial: !!enriched.instagram || !!enriched.facebook,
        validationConfidence: finalConfidence
      };

      const scoreResult = LeadScoringService.calculate(scoreFactors, finalConfidence);

      leads.push({
        normalizedIdentityKey: identityKey,
        businessName: enriched.businessName,
        niche,
        location,
        description: rawBiz.description || rawBiz.openState || null,
        websiteStatus: enriched.websiteStatus,
        websiteUrl: enriched.websiteUrl,
        instagram: enriched.instagram,
        facebook: enriched.facebook,
        phone: enriched.phone,
        email: enriched.email,
        googleBusinessUrl: enriched.googleMapsUrl,
        discoverySource: 'google_maps',
        googlePlaceId: enriched.googlePlaceId,
        googleCid: enriched.googleCid,
        googleMapsUrl: enriched.googleMapsUrl,
        address: enriched.address,
        rating: enriched.rating,
        reviewsCount: enriched.reviewsCount,
        category: enriched.category,
        latitude: enriched.latitude,
        longitude: enriched.longitude,
        fieldEvidence: JSON.stringify(enriched.fieldEvidence),
        sourceUrl: enriched.googleMapsUrl,
        searchQuery: rawBiz.sourceQuery,
        searchProvider: enriched.searchProvider,
        isDemo: rawBiz.isDemo,
        validationStatus: validation.validationStatus,
        validationConfidence: finalConfidence,
        evidence: JSON.stringify(validation.evidence),
        urlValidations: JSON.stringify(validation.urlValidations),
        contactVerifications: JSON.stringify(validation.contactVerifications),
        opportunityScore: scoreResult.score,
        scoreTier: scoreResult.tier,
        scoreReason: scoreResult.summary
      });
    }

    // Sort leads by Opportunity Score descending
    return leads.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  /**
   * Legacy search results extractor (kept for backward compatibility with existing SearchProvider)
   */
  static async extractFromResults(
    results: RawSearchResult[],
    niche: string,
    location: string,
    options?: { liveCheck?: boolean }
  ): Promise<ExtractedLead[]> {
    const leads: ExtractedLead[] = [];
    const seenKeys = new Set<string>();

    for (const result of results) {
      const isDemo = !!result.isDemo;
      const searchProvider = result.searchProvider || 'MockSearchProvider';

      const businessName = this.cleanBusinessName(result.title) || 'Unknown Business';
      const phone = this.extractPhone(result.snippet);
      const email = this.extractEmail(result.snippet);

      let instagram: string | null = null;
      let facebook: string | null = null;
      let googleBusinessUrl: string | null = null;

      if (result.link) {
        if (result.link.includes('instagram.com/')) {
          instagram = result.link;
        } else if (result.link.includes('facebook.com/')) {
          facebook = result.link;
        } else if (result.link.includes('google.com/maps') || result.link.includes('maps.google.com')) {
          googleBusinessUrl = result.link;
        }
      }

      const candidateWebUrl = (!instagram && !facebook && !googleBusinessUrl) ? result.link : null;
      const webDetection = WebsiteDetectorService.detect(candidateWebUrl, result.snippet, email, { isDemo });

      const validation = await LeadValidationService.validateLead(
        {
          businessName,
          niche,
          location,
          description: result.snippet,
          sourceUrl: result.link,
          searchQuery: result.sourceQuery,
          searchProvider,
          websiteStatus: webDetection.status,
          websiteUrl: webDetection.url,
          instagram,
          facebook,
          phone,
          email,
          googleBusinessUrl,
          isDemo
        },
        { liveCheck: options?.liveCheck ?? false }
      );

      const scoreFactors: ScoreFactors = {
        hasNoWebsite: webDetection.status === 'Website Not Found',
        hasExistingWebsite: webDetection.status === 'Website Found',
        hasInstagram: !!instagram,
        hasFacebook: !!facebook,
        hasPhone: !!phone,
        hasEmail: !!email,
        hasGoogleBusiness: !!googleBusinessUrl,
        hasActiveSocial: !!instagram || !!facebook,
        validationConfidence: validation.validationConfidence
      };

      const scoreResult = LeadScoringService.calculate(scoreFactors, validation.validationConfidence);

      const identityKey = DeduplicationService.generateIdentityKey({
        businessName,
        location,
        websiteUrl: webDetection.url,
        instagram,
        phone
      });

      if (seenKeys.has(identityKey)) continue;
      seenKeys.add(identityKey);

      leads.push({
        normalizedIdentityKey: identityKey,
        businessName,
        niche,
        location,
        description: result.snippet || null,
        websiteStatus: webDetection.status,
        websiteUrl: webDetection.url,
        instagram,
        facebook,
        phone,
        email,
        googleBusinessUrl,
        discoverySource: 'google_search',
        googlePlaceId: null,
        googleCid: null,
        googleMapsUrl: googleBusinessUrl,
        address: null,
        rating: null,
        reviewsCount: null,
        category: null,
        latitude: null,
        longitude: null,
        fieldEvidence: JSON.stringify({}),
        sourceUrl: result.link || null,
        searchQuery: result.sourceQuery || null,
        searchProvider,
        isDemo,
        validationStatus: validation.validationStatus,
        validationConfidence: validation.validationConfidence,
        evidence: JSON.stringify(validation.evidence),
        urlValidations: JSON.stringify(validation.urlValidations),
        contactVerifications: JSON.stringify(validation.contactVerifications),
        opportunityScore: scoreResult.score,
        scoreTier: scoreResult.tier,
        scoreReason: scoreResult.summary
      });
    }

    return leads.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }
}
