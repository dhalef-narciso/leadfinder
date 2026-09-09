import { UrlValidationService } from './UrlValidationService';

export type WebsiteStatus = 'Website Found' | 'Website Not Found' | 'Website Unclear';

export interface WebsiteDetectionResult {
  status: WebsiteStatus;
  url: string | null;
  displayStatus: string;
  isSocialOrAggregator: boolean;
  detectedFrom?: 'direct_url' | 'snippet' | 'email_domain' | 'social_bio' | 'none';
  domain?: string | null;
}

export class WebsiteDetectorService {
  // Free / generic email providers to ignore when inferring custom business websites
  private static FREE_EMAIL_DOMAINS = new Set([
    'gmail.com',
    'googlemail.com',
    'yahoo.com',
    'yahoo.co.uk',
    'yahoo.ie',
    'hotmail.com',
    'hotmail.co.uk',
    'outlook.com',
    'live.com',
    'msn.com',
    'icloud.com',
    'me.com',
    'aol.com',
    'mail.com',
    'zoho.com',
    'proton.me',
    'protonmail.com',
    'eircom.net'
  ]);

  // Domains that should NEVER be considered a business's own professional website
  private static excludedDomains = [
    'instagram.com',
    'facebook.com',
    'fb.com',
    'tiktok.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'youtube.com',
    'linktr.ee',
    'beacons.ai',
    'bio.link',
    'booksy.com',
    'fresha.com',
    'vagaro.com',
    'treatwell.ie',
    'treatwell.co.uk',
    'yelp.com',
    'yelp.ie',
    'goldenpages.ie',
    'yellowpages.com',
    'tripadvisor.com',
    'google.com',
    'maps.google.com',
    'goo.gl',
    'maps.app.goo.gl',
    'waze.com'
  ];

  static isExcludedDomain(urlStr: string): boolean {
    try {
      let hostname = urlStr.toLowerCase().trim();
      if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
        const parsed = new URL(hostname);
        hostname = parsed.hostname;
      }
      hostname = hostname.replace(/^www\./, '');
      return this.excludedDomains.some((d) => hostname === d || hostname.endsWith(`.${d}`));
    } catch {
      return false;
    }
  }

  /**
   * Extracts the domain from an email address if it is a custom domain.
   * Returns null if email is null, malformed, or a free email provider (e.g. gmail.com).
   */
  static extractDomainFromEmail(email?: string | null): string | null {
    if (!email || typeof email !== 'string') return null;
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return null;
    const domain = parts[1].trim();
    if (!domain || !domain.includes('.')) return null;
    if (this.FREE_EMAIL_DOMAINS.has(domain)) return null;
    return domain;
  }

  /**
   * Enhanced website detection pipeline.
   * Checks:
   * 1. Direct candidate URL
   * 2. Standalone URL extracted from search results / snippet
   * 3. Domain referenced by social profiles
   * 4. Email domain (e.g. info@purecleanlimerick.ie -> purecleanlimerick.ie)
   */
  static detect(
    candidateUrl?: string | null,
    rawSnippet?: string | null,
    email?: string | null,
    options?: { isDemo?: boolean }
  ): WebsiteDetectionResult {
    // 1. Direct candidate URL check
    if (candidateUrl && candidateUrl.trim() !== '') {
      const cleanUrl = candidateUrl.trim();

      if (this.isExcludedDomain(cleanUrl)) {
        // Excluded domain (social profile, aggregator directory)
        return this.investigateFallbacks(null, rawSnippet, email, options, true);
      }

      try {
        const normalized = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
        const parsed = new URL(normalized);
        if (parsed.hostname && parsed.hostname.includes('.') && UrlValidationService.isValidUrlFormat(normalized)) {
          return {
            status: 'Website Found',
            url: parsed.href,
            displayStatus: 'Website Found',
            isSocialOrAggregator: false,
            detectedFrom: 'direct_url',
            domain: parsed.hostname.replace(/^www\./, '')
          };
        }
      } catch {
        // Fall through to other checks
      }
    }

    return this.investigateFallbacks(null, rawSnippet, email, options, false);
  }

  private static investigateFallbacks(
    _candidateUrl: null,
    rawSnippet?: string | null,
    email?: string | null,
    _options?: { isDemo?: boolean },
    wasSocialCandidate: boolean = false
  ): WebsiteDetectionResult {
    // 2. Check if snippet contains a standalone business website URL
    if (rawSnippet) {
      const snippetMatches = rawSnippet.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/g);
      if (snippetMatches) {
        for (const match of snippetMatches) {
          if (!this.isExcludedDomain(match) && UrlValidationService.isValidUrlFormat(match)) {
            try {
              const parsed = new URL(match);
              return {
                status: 'Website Found',
                url: parsed.href,
                displayStatus: 'Website Found',
                isSocialOrAggregator: false,
                detectedFrom: 'snippet',
                domain: parsed.hostname.replace(/^www\./, '')
              };
            } catch {
              // continue
            }
          }
        }
      }
    }

    // 3. Check email domain (Critical requirement)
    // E.g., info@purecleanlimerick.ie -> purecleanlimerick.ie
    const emailDomain = this.extractDomainFromEmail(email);
    if (emailDomain) {
      const inferredUrl = `https://www.${emailDomain}`;

      // IMPORTANT:
      // We do not automatically assume the website is definitely live and functional,
      // but we MUST NOT classify as "No Website Detected" without considering the domain.
      // Therefore, classify as "Website Unclear" pending full site resolution or with candidate domain.
      return {
        status: 'Website Unclear',
        url: inferredUrl,
        displayStatus: `Website Unclear (Email domain: ${emailDomain})`,
        isSocialOrAggregator: false,
        detectedFrom: 'email_domain',
        domain: emailDomain
      };
    }

    // 4. Only after exhausting direct url, snippet, and email domain, classify as No Website Detected
    return {
      status: 'Website Not Found',
      url: null,
      displayStatus: wasSocialCandidate
        ? 'No website detected (Social profile only)'
        : 'No website detected',
      isSocialOrAggregator: wasSocialCandidate,
      detectedFrom: 'none',
      domain: null
    };
  }
}
