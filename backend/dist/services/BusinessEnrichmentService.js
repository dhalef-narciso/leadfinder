"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessEnrichmentService = void 0;
const ProviderFactory_1 = require("../providers/ProviderFactory");
const SocialValidationService_1 = require("./SocialValidationService");
const UrlValidationService_1 = require("./UrlValidationService");
const GENERIC_DIRECTORIES = new Set([
    'facebook.com',
    'instagram.com',
    'tripadvisor.com',
    'tripadvisor.ie',
    'yelp.com',
    'yelp.ie',
    'goldenpages.ie',
    'yellowpages.com',
    'google.com',
    'youtube.com',
    'tiktok.com',
    'linkedin.com',
    'twitter.com',
    'x.com',
    'pinterest.com',
    'booking.com',
    'just-eat.ie',
    'deliveroo.ie',
    'irishtimes.com',
    'wikipedia.org'
]);
class BusinessEnrichmentService {
    /**
     * Enriches a real Google Maps business with website verification,
     * targeted search enrichment, social profile extraction, and email discovery.
     */
    static async enrichBusiness(mapsBusiness, location, options = {}) {
        const evidence = {};
        let websiteUrl = null;
        let websiteStatus = 'Website Not Found';
        let instagram = null;
        let facebook = null;
        let phone = mapsBusiness.phone || null;
        let email = null;
        // 1. Base Google Maps Evidence
        if (mapsBusiness.googleMapsUrl || mapsBusiness.placeId) {
            evidence.googleMaps = {
                value: mapsBusiness.googleMapsUrl || `https://www.google.com/maps/place/?q=place_id:${mapsBusiness.placeId}`,
                source: 'google_maps',
                status: 'verified',
                notes: `Place ID: ${mapsBusiness.placeId || 'N/A'}`
            };
        }
        if (phone) {
            evidence.phone = {
                value: phone,
                source: 'google_maps',
                status: 'verified',
                notes: 'Direct phone number from Google Maps profile'
            };
        }
        else {
            evidence.phone = {
                value: null,
                source: 'google_maps',
                status: 'not_found'
            };
        }
        // 2. Classify raw website from Google Maps
        // Often Google Maps listings put Instagram or Facebook in the website field
        if (mapsBusiness.website) {
            const rawWeb = mapsBusiness.website.trim();
            const lowerWeb = rawWeb.toLowerCase();
            if (lowerWeb.includes('instagram.com')) {
                const igCheck = await SocialValidationService_1.SocialValidationService.validateInstagram(rawWeb, { isDemo: mapsBusiness.isDemo });
                if (igCheck.status !== 'INVALID' && igCheck.url) {
                    instagram = igCheck.url;
                    evidence.instagram = {
                        value: instagram,
                        source: 'google_maps',
                        status: igCheck.status === 'VALID' ? 'verified' : 'unverified',
                        notes: 'Instagram profile found in Google Maps website field'
                    };
                }
            }
            else if (lowerWeb.includes('facebook.com')) {
                const fbCheck = await SocialValidationService_1.SocialValidationService.validateFacebook(rawWeb, { isDemo: mapsBusiness.isDemo });
                if (fbCheck.status !== 'INVALID' && fbCheck.url) {
                    facebook = fbCheck.url;
                    evidence.facebook = {
                        value: facebook,
                        source: 'google_maps',
                        status: fbCheck.status === 'VALID' ? 'verified' : 'unverified',
                        notes: 'Facebook page found in Google Maps website field'
                    };
                }
            }
            else if (UrlValidationService_1.UrlValidationService.isValidUrlFormat(rawWeb)) {
                websiteUrl = rawWeb;
                websiteStatus = 'Website Found';
                evidence.website = {
                    value: websiteUrl,
                    source: 'google_maps',
                    status: 'found',
                    notes: 'Official website provided on Google Maps'
                };
            }
        }
        // 3. Google Search Enrichment
        // If enabled, execute targeted enrichment query for missing pieces
        const shouldEnrich = (options.includeGoogleSearch || options.includeInstagram || options.includeFacebook || options.includeWebsite) && !mapsBusiness.isDemo;
        if (shouldEnrich && (!websiteUrl || !instagram || !facebook || !email)) {
            try {
                const searchProvider = ProviderFactory_1.ProviderFactory.getProvider();
                const targetedQuery = `"${mapsBusiness.name}" "${location}"`;
                const searchResults = await searchProvider.search(targetedQuery, location, { limit: 5 });
                for (const res of searchResults) {
                    // A. Website detection if still missing
                    if (!websiteUrl && res.link) {
                        try {
                            const parsed = new URL(res.link.startsWith('http') ? res.link : `https://${res.link}`);
                            const domain = parsed.hostname.replace(/^www\./, '').toLowerCase();
                            if (!GENERIC_DIRECTORIES.has(domain) && !domain.endsWith('.google.com')) {
                                // Check if domain resembles business name
                                const nameTokens = mapsBusiness.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                                const domainTokens = domain.replace(/[^a-z0-9]/g, '');
                                if (nameTokens.includes(domainTokens) || domainTokens.includes(nameTokens.slice(0, 5))) {
                                    websiteUrl = `https://${parsed.hostname}`;
                                    websiteStatus = 'Website Found';
                                    evidence.website = {
                                        value: websiteUrl,
                                        source: 'google_search',
                                        status: 'found',
                                        notes: `Found via targeted search result: ${res.title}`
                                    };
                                }
                            }
                        }
                        catch {
                            // ignore invalid url
                        }
                    }
                    // B. Instagram detection if missing
                    if (!instagram && options.includeInstagram && res.link && res.link.includes('instagram.com')) {
                        const igCheck = await SocialValidationService_1.SocialValidationService.validateInstagram(res.link);
                        if (igCheck.status !== 'INVALID' && igCheck.url) {
                            instagram = igCheck.url;
                            evidence.instagram = {
                                value: instagram,
                                source: 'google_search',
                                status: 'unverified',
                                notes: `Found via targeted search query "${targetedQuery}"`
                            };
                        }
                    }
                    // C. Facebook detection if missing
                    if (!facebook && options.includeFacebook && res.link && res.link.includes('facebook.com')) {
                        const fbCheck = await SocialValidationService_1.SocialValidationService.validateFacebook(res.link);
                        if (fbCheck.status !== 'INVALID' && fbCheck.url) {
                            facebook = fbCheck.url;
                            evidence.facebook = {
                                value: facebook,
                                source: 'google_search',
                                status: 'unverified',
                                notes: `Found via targeted search query "${targetedQuery}"`
                            };
                        }
                    }
                    // D. Email detection from snippet
                    if (!email && res.snippet) {
                        const emailMatch = res.snippet.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
                        if (emailMatch) {
                            const candidateEmail = emailMatch[0].trim().toLowerCase();
                            const domain = candidateEmail.split('@')[1];
                            // Avoid generic emails
                            if (!['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) {
                                email = candidateEmail;
                                evidence.email = {
                                    value: email,
                                    source: 'google_search',
                                    status: 'unverified',
                                    notes: `Extracted from search snippet domain: ${domain}`
                                };
                                // Email domain check: if we have no website yet, and email domain matches
                                if (!websiteUrl) {
                                    websiteUrl = `https://${domain}`;
                                    websiteStatus = 'Website Found';
                                    evidence.website = {
                                        value: websiteUrl,
                                        source: 'website_domain',
                                        status: 'found',
                                        notes: `Inferred from email domain ${domain}`
                                    };
                                }
                            }
                        }
                    }
                }
            }
            catch (enrichErr) {
                // Non-fatal: log and proceed with Google Maps data
                console.warn(`Enrichment query skipped/failed for ${mapsBusiness.name}:`, enrichErr.message);
            }
        }
        // Default missing evidence
        if (!websiteUrl) {
            evidence.website = {
                value: null,
                source: 'google_maps',
                status: 'no_website_detected',
                notes: 'No official website found on Google Maps or targeted search'
            };
        }
        if (!instagram) {
            evidence.instagram = {
                value: null,
                source: 'none',
                status: 'not_found'
            };
        }
        if (!facebook) {
            evidence.facebook = {
                value: null,
                source: 'none',
                status: 'not_found'
            };
        }
        if (!email) {
            evidence.email = {
                value: null,
                source: 'none',
                status: 'not_found'
            };
        }
        return {
            businessName: mapsBusiness.name,
            category: mapsBusiness.category,
            address: mapsBusiness.address,
            phone,
            email,
            websiteUrl,
            websiteStatus,
            instagram,
            facebook,
            googleMapsUrl: mapsBusiness.googleMapsUrl,
            googlePlaceId: mapsBusiness.placeId,
            googleCid: mapsBusiness.cid,
            rating: mapsBusiness.rating,
            reviewsCount: mapsBusiness.reviews,
            latitude: mapsBusiness.latitude,
            longitude: mapsBusiness.longitude,
            fieldEvidence: evidence,
            discoverySource: 'google_maps',
            searchProvider: mapsBusiness.sourceProvider
        };
    }
}
exports.BusinessEnrichmentService = BusinessEnrichmentService;
