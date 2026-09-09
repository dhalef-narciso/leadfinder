"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryGeneratorService = void 0;
class QueryGeneratorService {
    // Common synonym map for popular niches
    static defaultSynonyms = {
        'barber': ['barber', 'barbershop', 'barber shop', 'mens barber', 'fade barber'],
        'hairdresser': ['hairdresser', 'hair salon', 'hair stylist', 'hair cut salon'],
        'beauty salon': ['beauty salon', 'beautician', 'aesthetics clinic', 'beauty lounge', 'skin clinic'],
        'nail salon': ['nail salon', 'nail bar', 'nail tech', 'manicure pedicure'],
        'tattoo studio': ['tattoo studio', 'tattoo artist', 'tattoo parlour', 'ink studio'],
        'gym': ['gym', 'fitness centre', 'crossfit', 'fitness studio', 'strength gym'],
        'personal trainer': ['personal trainer', 'fitness coach', 'online PT', 'pt coach'],
        'restaurant': ['restaurant', 'bistro', 'eatery', 'dining', 'food'],
        'cafe': ['cafe', 'coffee shop', 'coffee house', 'café', 'espresso bar'],
        'café': ['café', 'coffee shop', 'espresso bar', 'coffee house', 'bakery café'],
        'pub': ['pub', 'gastropub', 'traditional pub', 'tavern', 'bar'],
        'plumber': ['plumber', 'plumbing', 'plumbing services', 'plumber contractor', 'heating and plumbing'],
        'electrician': ['electrician', 'electrical', 'electrical services', 'electrical contractor', 'sparky'],
        'painter': ['painter', 'painting and decorating', 'painter decorator', 'commercial painter'],
        'carpenter': ['carpenter', 'carpentry', 'joinery', 'woodwork', 'cabinet maker'],
        'flooring contractor': ['flooring contractor', 'hardwood floors', 'tiling and flooring', 'carpet fitting'],
        'roofing contractor': ['roofing contractor', 'roof repairs', 'roofing specialist', 'guttering & roofing'],
        'mechanic': ['mechanic', 'auto repair', 'car service', 'garage mechanic', 'motor repair'],
        'car detailer': ['car detailer', 'auto detailing', 'car valeting', 'paint correction', 'ceramic coating'],
        'cleaning company': ['cleaning company', 'cleaning services', 'commercial cleaners', 'deep cleaning'],
        'landscaping': ['landscaping', 'gardening services', 'landscape gardener', 'paving & lawn'],
        'photographer': ['photographer', 'photography studio', 'wedding photographer', 'portrait photographer'],
        'dentist': ['dentist', 'dental clinic', 'dental practice', 'orthodontist'],
        'physiotherapist': ['physiotherapist', 'physiotherapy', 'physical therapy', 'sports physio'],
        'accountant': ['accountant', 'accountancy firm', 'tax consultant', 'bookkeeper'],
        'real estate agent': ['real estate agent', 'estate agent', 'property broker', 'letting agency']
    };
    static getSynonymsForNiche(niche, customSynonyms) {
        if (customSynonyms && customSynonyms.length > 0) {
            return Array.from(new Set([niche.toLowerCase(), ...customSynonyms.map(s => s.toLowerCase().trim())]));
        }
        const key = niche.toLowerCase().trim();
        if (this.defaultSynonyms[key]) {
            return this.defaultSynonyms[key];
        }
        // Fallback if not specifically mapped
        return [niche.toLowerCase(), `${niche.toLowerCase()} services`, `${niche.toLowerCase()} company`];
    }
    /**
     * Generates 3-5 high-relevance variations for Google Maps discovery.
     */
    static generateMapsQueries(niche, customSynonyms, limit = 4) {
        const synonyms = this.getSynonymsForNiche(niche, customSynonyms);
        return synonyms.slice(0, Math.min(synonyms.length, limit));
    }
    static generate(options) {
        const { niche, locations, includeInstagram = true, includeFacebook = true } = options;
        const synonyms = this.getSynonymsForNiche(niche, options.synonyms);
        const queries = [];
        locations.forEach((loc) => {
            const cleanLoc = loc.trim();
            if (!cleanLoc)
                return;
            synonyms.slice(0, 3).forEach((term) => {
                // 1. Instagram profile hunt: "term" site:instagram.com "Location"
                if (includeInstagram) {
                    queries.push({
                        query: `"${term}" site:instagram.com "${cleanLoc}"`,
                        location: cleanLoc,
                        operatorType: 'instagram',
                        description: `Targeting active Instagram pages in ${cleanLoc}`
                    });
                }
                // 2. Direct contact signal: "term" "Location" "contact"
                queries.push({
                    query: `"${term}" "${cleanLoc}" "contact"`,
                    location: cleanLoc,
                    operatorType: 'contact',
                    description: `Finding direct contact numbers/emails in ${cleanLoc}`
                });
                // 3. Booking intent: "term" "Location" "book now"
                queries.push({
                    query: `"${term}" "${cleanLoc}" "book now"`,
                    location: cleanLoc,
                    operatorType: 'booking',
                    description: `Capturing businesses asking for bookings without proper funnels`
                });
                // 4. Missing website search: "term" "Location" -website
                queries.push({
                    query: `"${term}" "${cleanLoc}" -website`,
                    location: cleanLoc,
                    operatorType: 'exclude_website',
                    description: `Filtering out existing websites to surface unhosted businesses`
                });
                // 5. Exclude facebook to isolate Instagram/Google business leads
                if (includeFacebook) {
                    queries.push({
                        query: `"${term}" "${cleanLoc}" -site:facebook.com`,
                        location: cleanLoc,
                        operatorType: 'exclude_social',
                        description: `Excluding Facebook directory noise`
                    });
                }
            });
        });
        // Deduplicate queries by query string
        const seen = new Set();
        return queries.filter((q) => {
            if (seen.has(q.query))
                return false;
            seen.add(q.query);
            return true;
        });
    }
}
exports.QueryGeneratorService = QueryGeneratorService;
