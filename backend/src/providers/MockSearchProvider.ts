import { ISearchProvider, RawSearchResult, SearchOptions } from './SearchProvider.interface';

interface NicheTemplate {
  businessPrefixes: string[];
  businessSuffixes: string[];
  services: string[];
  socialHandles: string[];
  hasWebsiteProb: number; // 0.0 to 1.0 (low for target prospecting leads)
  hasPhoneProb: number;
  hasEmailProb: number;
  hasInstagramProb: number;
  hasGoogleBusinessProb: number;
}

const NICHE_TEMPLATES: Record<string, NicheTemplate> = {
  barber: {
    businessPrefixes: ["The Barber's", "Classic", "Blade & Comb", "Gentlemen's", "True Cut", "Urban", "Vintage", "Fade & Shave", "Heritage", "Slick", "Crown", "Anchor"],
    businessSuffixes: ["Barbershop", "Barbers", "Grooming Lounge", "Hair Studio", "Barber Co.", "Parlour"],
    services: ["skin fades, beard trims, hot towel shaves, men's precision haircuts", "classic haircuts, hot lather shave, walk-ins welcome"],
    socialHandles: ["cuts", "barbers", "fadez", "grooming", "barbershop"],
    hasWebsiteProb: 0.20,
    hasPhoneProb: 0.90,
    hasEmailProb: 0.40,
    hasInstagramProb: 0.95,
    hasGoogleBusinessProb: 0.85
  },
  restaurant: {
    businessPrefixes: ["The Rustic", "Bistro", "Olive & Thyme", "Table 9", "Harbor", "Copper Pot", "Luigi's", "The Green", "Woodfire", "Corner"],
    businessSuffixes: ["Kitchen", "Bistro", "Trattoria", "Grill & Tap", "Eatery", "Diner", "House"],
    services: ["authentic local dining, fresh seasonal ingredients, lunch & evening reservations", "family friendly artisan cuisine, dine-in & takeaway"],
    socialHandles: ["eats", "kitchen", "bistro", "dining", "food"],
    hasWebsiteProb: 0.35,
    hasPhoneProb: 0.95,
    hasEmailProb: 0.65,
    hasInstagramProb: 0.90,
    hasGoogleBusinessProb: 0.90
  },
  plumber: {
    businessPrefixes: ["Apex", "Direct", "Rapid Flow", "ProLine", "City & County", "Emergency 24/7", "Reliable", "Prime", "Blue Pipe", "SureFlow"],
    businessSuffixes: ["Plumbing & Heating", "Plumbing Services", "Drain Services", "Plumbers", "Gas & Plumbing", "Contractors"],
    services: ["boiler repairs, leak detection, bathroom installations, 24/7 emergency callout", "heating system upgrades, pipe repairs, certified gas safe engineers"],
    socialHandles: ["plumbing", "heating", "pipes", "solutions"],
    hasWebsiteProb: 0.25,
    hasPhoneProb: 0.95,
    hasEmailProb: 0.50,
    hasInstagramProb: 0.60,
    hasGoogleBusinessProb: 0.85
  },
  electrician: {
    businessPrefixes: ["VoltTech", "Bright Sparks", "Current", "O'Connor & Sons", "Ampere", "Precision", "Circuit", "Summit", "EcoWire"],
    businessSuffixes: ["Electrical Services", "Electrical Contractors", "Electrics", "Power & Light", "Engineering"],
    services: ["fuse board upgrades, rewiring, EV charger installation, commercial & domestic", "fault finding, LED lighting, certified electrical inspections"],
    socialHandles: ["electrical", "electrician", "sparks", "power"],
    hasWebsiteProb: 0.22,
    hasPhoneProb: 0.95,
    hasEmailProb: 0.60,
    hasInstagramProb: 0.65,
    hasGoogleBusinessProb: 0.85
  },
  cleaning: {
    businessPrefixes: ["Sparkle", "Pure Clean", "Crystal Clear", "Fresh Start", "Spotless", "Prime Clean", "EcoShine", "Maid & Co."],
    businessSuffixes: ["Cleaning Services", "Cleaners", "Commercial Cleaning", "Carpet & Window Cleaning", "Solutions"],
    services: ["deep cleaning, tenancy end-of-lease, office sanitization, carpet cleaning", "domestic housekeeping, pressure washing, window & gutter cleaning"],
    socialHandles: ["cleaning", "cleaners", "sparkle", "spotless"],
    hasWebsiteProb: 0.15,
    hasPhoneProb: 0.90,
    hasEmailProb: 0.55,
    hasInstagramProb: 0.85,
    hasGoogleBusinessProb: 0.75
  },
  default: {
    businessPrefixes: ["Premier", "Elite", "City", "Local", "Cornerstone", "Apex", "Nova", "Standard", "Vanguard"],
    businessSuffixes: ["Studio", "Services", "Hub", "Group", "Specialists", "Works", "Pro"],
    services: ["specialized local services, customer consultations, appointments by phone or DM", "tailored solutions, trusted local team, direct bookings"],
    socialHandles: ["official", "local", "services", "team"],
    hasWebsiteProb: 0.25,
    hasPhoneProb: 0.85,
    hasEmailProb: 0.50,
    hasInstagramProb: 0.85,
    hasGoogleBusinessProb: 0.80
  }
};

export class MockSearchProvider implements ISearchProvider {
  readonly providerName = 'MockSearchProvider';

  private getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private getNicheTemplate(query: string): NicheTemplate {
    const q = query.toLowerCase();
    for (const [key, tmpl] of Object.entries(NICHE_TEMPLATES)) {
      if (q.includes(key)) return tmpl;
    }
    return NICHE_TEMPLATES.default;
  }

  async search(query: string, location: string, options?: SearchOptions): Promise<RawSearchResult[]> {
    // Simulate natural network latency
    await new Promise((resolve) => setTimeout(resolve, 350 + Math.random() * 250));

    const tmpl = this.getNicheTemplate(query);
    const results: RawSearchResult[] = [];
    const count = options?.limit || 6;

    const isInstagramQuery = query.toLowerCase().includes('site:instagram.com');
    const isFacebookQuery = query.toLowerCase().includes('site:facebook.com');

    for (let i = 0; i < count; i++) {
      const prefix = this.getRandomItem(tmpl.businessPrefixes);
      const suffix = this.getRandomItem(tmpl.businessSuffixes);
      const name = `${prefix} ${suffix}`;
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const handle = `${slug}_${this.getRandomItem(tmpl.socialHandles)}`;

      // Generate phone numbers matching typical regional format
      const areaCode = location.toLowerCase().includes('limerick') ? '061' :
                       location.toLowerCase().includes('dublin') ? '01' :
                       location.toLowerCase().includes('cork') ? '021' : '087';
      const phone = `+353 ${areaCode} ${Math.floor(200 + Math.random() * 700)} ${Math.floor(1000 + Math.random() * 9000)}`;
      const email = Math.random() < tmpl.hasEmailProb ? `${slug.slice(0, 8)}@gmail.com` : undefined;

      const hasWebsite = Math.random() < tmpl.hasWebsiteProb;
      const websiteUrl = hasWebsite ? `https://www.${slug}${location.toLowerCase().replace(/[^a-z]/g, '')}.ie` : undefined;

      let link = '';
      let displayLink = '';
      let detectedSocial: 'instagram' | 'facebook' | 'google_business' | null = null;
      let title = '';

      if (isInstagramQuery || (!isFacebookQuery && Math.random() < 0.6)) {
        link = `https://www.instagram.com/${handle}/`;
        displayLink = `instagram.com › ${handle}`;
        detectedSocial = 'instagram';
        title = `${name} (@${handle}) • Instagram photos and videos`;
      } else if (isFacebookQuery || Math.random() < 0.4) {
        link = `https://www.facebook.com/${slug}official/`;
        displayLink = `facebook.com › ${slug}official`;
        detectedSocial = 'facebook';
        title = `${name} - Home | Facebook`;
      } else {
        link = websiteUrl || `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + location)}`;
        displayLink = hasWebsite ? `${slug}.ie` : 'google.com/search';
        detectedSocial = null;
        title = `${name} | ${location}`;
      }

      // Build realistic Google Snippet with rich contact signals
      const serviceDetail = this.getRandomItem(tmpl.services);
      let snippetParts: string[] = [];

      if (detectedSocial === 'instagram') {
        snippetParts.push(`See photos and updates from ${name} in ${location}.`);
      }

      snippetParts.push(`Offering ${serviceDetail} in ${location} and surrounding areas.`);
      if (phone) snippetParts.push(`Call: ${phone}.`);
      if (email) snippetParts.push(`Email: ${email}.`);
      if (!hasWebsite) {
        snippetParts.push(`Book via DM or phone. Direct local bookings.`);
      } else {
        snippetParts.push(`Visit our official website for full pricing.`);
      }

      results.push({
        title,
        link,
        displayLink,
        snippet: snippetParts.join(' '),
        sourceQuery: query,
        detectedSocialPlatform: detectedSocial,
        searchProvider: this.providerName,
        isDemo: true
      });
    }

    return results;
  }
}
