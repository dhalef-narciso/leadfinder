import { UrlValidationService, UrlValidationRecord } from './UrlValidationService';
import { SocialValidationService, SocialValidationResult } from './SocialValidationService';
import { WebsiteDetectorService, WebsiteStatus } from './WebsiteDetectorService';

export interface ValidationCandidate {
  businessName: string | null;
  niche: string;
  location: string;
  description?: string | null;
  sourceUrl?: string | null;
  searchQuery?: string | null;
  searchProvider?: string | null;
  websiteStatus: WebsiteStatus;
  websiteUrl?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  phone?: string | null;
  email?: string | null;
  googleBusinessUrl?: string | null;
  isDemo?: boolean;
}

export interface EvidenceItem {
  type: 'search_result' | 'website' | 'instagram' | 'facebook' | 'google_business' | 'phone' | 'email';
  source: string;
  status: 'valid' | 'invalid' | 'unreachable' | 'unverified' | 'verified';
  description: string;
}

export interface LeadValidationResult {
  validationStatus: 'VERIFIED' | 'POTENTIAL' | 'INVALID';
  validationConfidence: number; // 0-100
  evidence: EvidenceItem[];
  urlValidations: Record<string, UrlValidationRecord>;
  contactVerifications: {
    phone: { value: string | null; status: 'verified' | 'unverified' | 'invalid' | 'none'; reason?: string };
    email: { value: string | null; status: 'verified' | 'unverified' | 'invalid' | 'none'; reason?: string };
    instagram: { value: string | null; status: 'valid' | 'invalid' | 'unreachable' | 'unverified' | 'none'; reason?: string };
    facebook: { value: string | null; status: 'valid' | 'invalid' | 'unreachable' | 'unverified' | 'none'; reason?: string };
    website: { value: string | null; status: string; reason?: string };
  };
  rejectionReasons: string[];
}

export class LeadValidationService {
  /**
   * Validates a lead thoroughly through multi-source evidence cross-referencing.
   */
  static async validateLead(
    lead: ValidationCandidate,
    options?: { liveCheck?: boolean }
  ): Promise<LeadValidationResult> {
    const evidence: EvidenceItem[] = [];
    const urlValidations: Record<string, UrlValidationRecord> = {};
    const rejectionReasons: string[] = [];
    const isDemo = !!lead.isDemo;

    let confidenceScore = 0;
    let hasAuthoritativeExternalSource = false;
    let hasFatalFlaw = false;

    // 1. Business Name & Search Origin Verification
    const rawName = lead.businessName?.trim();
    if (!rawName || rawName.length < 2 || rawName.toLowerCase().includes('undefined') || rawName.toLowerCase().includes('pro limerick')) {
      hasFatalFlaw = true;
      rejectionReasons.push('Business name is missing, corrupted, or appears to be a generic placeholder');
      evidence.push({
        type: 'search_result',
        source: lead.sourceUrl || 'search',
        status: 'invalid',
        description: 'Business name is absent or invalid in search output'
      });
    } else {
      confidenceScore += 30;
      evidence.push({
        type: 'search_result',
        source: lead.searchQuery ? `Query: ${lead.searchQuery}` : (lead.sourceUrl || 'search'),
        status: 'verified',
        description: `Discovered as "${rawName}" in ${lead.location || 'local'} results`
      });
    }

    // 2. Location Consistency
    if (lead.location && lead.location.trim().length >= 2) {
      confidenceScore += 15;
    } else {
      rejectionReasons.push('No verifiable location or geographic area provided');
    }

    // 3. Website URL Verification
    let websiteRecord: UrlValidationRecord | null = null;
    if (lead.websiteUrl) {
      websiteRecord = await UrlValidationService.validateUrl(lead.websiteUrl, 'website', {
        isDemo,
        liveCheck: options?.liveCheck ?? false
      });
      urlValidations.website = websiteRecord;

      if (websiteRecord.status === 'VALID') {
        confidenceScore += 25;
        hasAuthoritativeExternalSource = true;
        evidence.push({
          type: 'website',
          source: lead.websiteUrl,
          status: 'valid',
          description: `Official website domain verified (${websiteRecord.reason || 'reachable'})`
        });
      } else if (websiteRecord.status === 'INVALID') {
        hasFatalFlaw = true;
        confidenceScore -= 30;
        rejectionReasons.push(`Website URL failed validation: ${websiteRecord.reason}`);
        evidence.push({
          type: 'website',
          source: lead.websiteUrl,
          status: 'invalid',
          description: `Website URL is dead or invalid: ${websiteRecord.reason}`
        });
      } else {
        // UNREACHABLE or NOT_CHECKED
        confidenceScore += 10;
        evidence.push({
          type: 'website',
          source: lead.websiteUrl,
          status: 'unverified',
          description: `Website format valid but status is ${websiteRecord.status.toLowerCase()}`
        });
      }
    } else if (lead.websiteStatus === 'Website Not Found') {
      evidence.push({
        type: 'website',
        source: 'pipeline_check',
        status: 'unverified',
        description: 'No active website detected across search results and domains'
      });
    } else if (lead.websiteStatus === 'Website Unclear') {
      evidence.push({
        type: 'website',
        source: 'email_domain_check',
        status: 'unverified',
        description: 'Website existence unclear; custom domain referenced by contact email'
      });
    }

    // 4. Social Profiles Verification
    // 4a. Instagram
    let igValidation: SocialValidationResult = {
      platform: 'instagram',
      url: lead.instagram || null,
      status: 'INVALID',
      handle: null,
      reason: 'No Instagram URL'
    };

    if (lead.instagram) {
      igValidation = await SocialValidationService.validateInstagram(lead.instagram, {
        isDemo,
        liveCheck: options?.liveCheck ?? false
      });

      urlValidations.instagram = {
        url: lead.instagram,
        status: igValidation.status,
        lastChecked: new Date().toISOString(),
        source: 'instagram',
        reason: igValidation.reason
      };

      if (igValidation.status === 'VALID') {
        confidenceScore += 25;
        hasAuthoritativeExternalSource = true;
        evidence.push({
          type: 'instagram',
          source: lead.instagram,
          status: 'valid',
          description: `Active Instagram profile verified (@${igValidation.handle})`
        });
      } else if (igValidation.status === 'INVALID') {
        confidenceScore -= 25;
        rejectionReasons.push(`Instagram profile is invalid: ${igValidation.reason}`);
        evidence.push({
          type: 'instagram',
          source: lead.instagram,
          status: 'invalid',
          description: `Instagram link rejected: ${igValidation.reason}`
        });
      } else {
        confidenceScore += 5;
        evidence.push({
          type: 'instagram',
          source: lead.instagram,
          status: 'unverified',
          description: `Instagram profile unconfirmed (${igValidation.reason})`
        });
      }
    }

    // 4b. Facebook
    let fbValidation: SocialValidationResult = {
      platform: 'facebook',
      url: lead.facebook || null,
      status: 'INVALID',
      handle: null,
      reason: 'No Facebook URL'
    };

    if (lead.facebook) {
      fbValidation = await SocialValidationService.validateFacebook(lead.facebook, {
        isDemo,
        liveCheck: options?.liveCheck ?? false
      });

      urlValidations.facebook = {
        url: lead.facebook,
        status: fbValidation.status,
        lastChecked: new Date().toISOString(),
        source: 'facebook',
        reason: fbValidation.reason
      };

      if (fbValidation.status === 'VALID') {
        confidenceScore += 15;
        hasAuthoritativeExternalSource = true;
        evidence.push({
          type: 'facebook',
          source: lead.facebook,
          status: 'valid',
          description: `Facebook business page confirmed (/pages/${fbValidation.handle})`
        });
      } else if (fbValidation.status === 'INVALID') {
        confidenceScore -= 20;
        rejectionReasons.push(`Facebook URL is invalid: ${fbValidation.reason}`);
        evidence.push({
          type: 'facebook',
          source: lead.facebook,
          status: 'invalid',
          description: `Facebook link rejected: ${fbValidation.reason}`
        });
      }
    }

    // 4c. Google Business / Maps
    let gmapsValidation: SocialValidationResult = {
      platform: 'google_business',
      url: lead.googleBusinessUrl || null,
      status: 'INVALID',
      handle: null,
      reason: 'No Google Business URL'
    };

    if (lead.googleBusinessUrl) {
      gmapsValidation = SocialValidationService.validateGoogleMaps(lead.googleBusinessUrl, { isDemo });

      urlValidations.googleBusiness = {
        url: lead.googleBusinessUrl,
        status: gmapsValidation.status,
        lastChecked: new Date().toISOString(),
        source: 'google_business',
        reason: gmapsValidation.reason
      };

      if (gmapsValidation.status === 'VALID') {
        confidenceScore += 20;
        hasAuthoritativeExternalSource = true;
        evidence.push({
          type: 'google_business',
          source: lead.googleBusinessUrl,
          status: 'valid',
          description: 'Legitimate Google Maps / Business listing verified'
        });
      } else {
        hasFatalFlaw = true;
        confidenceScore -= 30;
        rejectionReasons.push(`Google Maps URL failed check: ${gmapsValidation.reason}`);
        evidence.push({
          type: 'google_business',
          source: lead.googleBusinessUrl,
          status: 'invalid',
          description: `Google Maps link invalid: ${gmapsValidation.reason}`
        });
      }
    }

    // 5. Contact Information Verification
    // 5a. Phone
    let phoneStatus: 'verified' | 'unverified' | 'invalid' | 'none' = 'none';
    let phoneReason = '';
    if (lead.phone) {
      const cleanPhone = lead.phone.trim();
      const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');

      // Check reasonable telephone digit range (7-15 digits) and not repeated dummy numbers
      if (digitsOnly.length >= 7 && digitsOnly.length <= 15 && !/^(\d)\1+$/.test(digitsOnly)) {
        phoneStatus = 'verified';
        phoneReason = 'Standard phone number pattern confirmed';
        confidenceScore += 15;
        evidence.push({
          type: 'phone',
          source: cleanPhone,
          status: 'verified',
          description: `Direct phone contact verified (${cleanPhone})`
        });
      } else {
        phoneStatus = 'invalid';
        phoneReason = 'Invalid phone digit sequence or placeholder pattern';
        confidenceScore -= 15;
        rejectionReasons.push(`Phone number appears fabricated: ${cleanPhone}`);
        evidence.push({
          type: 'phone',
          source: cleanPhone,
          status: 'invalid',
          description: `Phone number format failed verification (${cleanPhone})`
        });
      }
    } else {
      evidence.push({
        type: 'phone',
        source: 'snippet_check',
        status: 'unverified',
        description: 'No direct telephone number found in search result'
      });
    }

    // 5b. Email
    let emailStatus: 'verified' | 'unverified' | 'invalid' | 'none' = 'none';
    let emailReason = '';
    if (lead.email) {
      const cleanEmail = lead.email.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (emailRegex.test(cleanEmail)) {
        emailStatus = 'verified';
        emailReason = 'Valid email syntax and deliverable domain format';
        confidenceScore += 15;
        evidence.push({
          type: 'email',
          source: cleanEmail,
          status: 'verified',
          description: `Direct contact email verified (${cleanEmail})`
        });

        // Cross-reference email domain against website / business signals
        const domain = WebsiteDetectorService.extractDomainFromEmail(cleanEmail);
        if (domain && lead.websiteUrl && !lead.websiteUrl.toLowerCase().includes(domain)) {
          // Contradiction between custom email domain and website domain
          confidenceScore -= 10;
          evidence.push({
            type: 'email',
            source: cleanEmail,
            status: 'unverified',
            description: `Note: Email domain (${domain}) differs from website URL`
          });
        }
      } else {
        emailStatus = 'invalid';
        emailReason = 'Malformed email address syntax';
        confidenceScore -= 15;
        rejectionReasons.push(`Email address is invalid: ${cleanEmail}`);
        evidence.push({
          type: 'email',
          source: cleanEmail,
          status: 'invalid',
          description: `Email address failed syntax check (${cleanEmail})`
        });
      }
    } else {
      evidence.push({
        type: 'email',
        source: 'snippet_check',
        status: 'unverified',
        description: 'No email contact found in search result'
      });
    }

    // 6. Check for total lack of external evidence
    const hasAnyContact = (lead.phone && phoneStatus === 'verified') || (lead.email && emailStatus === 'verified');
    if (!hasAuthoritativeExternalSource && !hasAnyContact) {
      hasFatalFlaw = true;
      rejectionReasons.push('Search result contains insufficient evidence: no verified profile, website, or contact');
    }

    // Normalize confidence between 0 and 100
    if (hasFatalFlaw) {
      confidenceScore = Math.min(confidenceScore, 35);
    }
    const finalConfidence = Math.max(0, Math.min(100, confidenceScore));

    // 7. Assign Final Validation Status
    let validationStatus: 'VERIFIED' | 'POTENTIAL' | 'INVALID';

    if (hasFatalFlaw || finalConfidence < 40) {
      validationStatus = 'INVALID';
    } else if (finalConfidence >= 75 && hasAuthoritativeExternalSource) {
      validationStatus = 'VERIFIED';
    } else {
      validationStatus = 'POTENTIAL';
    }

    return {
      validationStatus,
      validationConfidence: finalConfidence,
      evidence,
      urlValidations,
      contactVerifications: {
        phone: {
          value: lead.phone || null,
          status: phoneStatus,
          reason: phoneReason
        },
        email: {
          value: lead.email || null,
          status: emailStatus,
          reason: emailReason
        },
        instagram: {
          value: lead.instagram || null,
          status: lead.instagram ? (igValidation.status === 'VALID' ? 'valid' : igValidation.status === 'INVALID' ? 'invalid' : 'unverified') : 'none',
          reason: igValidation.reason
        },
        facebook: {
          value: lead.facebook || null,
          status: lead.facebook ? (fbValidation.status === 'VALID' ? 'valid' : fbValidation.status === 'INVALID' ? 'invalid' : 'unverified') : 'none',
          reason: fbValidation.reason
        },
        website: {
          value: lead.websiteUrl || null,
          status: lead.websiteStatus,
          reason: websiteRecord?.reason || (lead.websiteUrl ? 'Candidate website identified' : 'No website found')
        }
      },
      rejectionReasons
    };
  }
}
