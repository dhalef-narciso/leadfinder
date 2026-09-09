"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpApiMapsProvider = void 0;
class SerpApiMapsProvider {
    providerName = 'SerpApiMapsProvider';
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.SEARCH_API_KEY || '';
    }
    /**
     * Normalizes the location string for Google Maps search.
     * e.g., "Ennis" -> "Ennis, Ireland" if no country is specified.
     */
    static normalizeLocation(location) {
        const trimmed = location.trim();
        if (!trimmed)
            return 'Ireland';
        // If the location already has a country or detailed specification, preserve it
        if (trimmed.includes(',')) {
            return trimmed;
        }
        // Default country context for region
        return `${trimmed}, Ireland`;
    }
    async search(query, location, options) {
        if (!this.apiKey) {
            throw new Error('SerpApi authentication failed. Check SEARCH_API_KEY.');
        }
        const normalizedLoc = SerpApiMapsProvider.normalizeLocation(location);
        const targetLimit = Math.min(options?.limit || 25, 100);
        const results = [];
        const seenPlaceIds = new Set();
        let currentStart = options?.offset || 0;
        const batchSize = 20;
        let hasMore = true;
        let consecutiveEmptyBatches = 0;
        while (results.length < targetLimit && hasMore) {
            // SerpApi Google Maps engine query
            const url = new URL('https://serpapi.com/search.json');
            url.searchParams.append('engine', 'google_maps');
            // Using query formatted with location ensures Google Maps returns precise geographic local results
            url.searchParams.append('q', `${query} in ${normalizedLoc}`);
            url.searchParams.append('type', 'search');
            url.searchParams.append('start', String(currentStart));
            url.searchParams.append('api_key', this.apiKey);
            let response;
            try {
                response = await fetch(url.toString());
            }
            catch (err) {
                throw new Error(`Google Maps discovery failed: ${err.message}`);
            }
            if (response.status === 401 || response.status === 403) {
                throw new Error('SerpApi authentication failed. Check SEARCH_API_KEY.');
            }
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Google Maps discovery failed. Status: ${response.status}. ${errText}`);
            }
            const data = (await response.json());
            if (data.error) {
                throw new Error(`Google Maps discovery failed. ${data.error}`);
            }
            const localResults = Array.isArray(data.local_results) ? data.local_results : [];
            if (localResults.length === 0) {
                consecutiveEmptyBatches++;
                if (consecutiveEmptyBatches >= 1) {
                    hasMore = false;
                    break;
                }
            }
            else {
                consecutiveEmptyBatches = 0;
            }
            for (const item of localResults) {
                if (!item || !item.title)
                    continue;
                const placeId = item.place_id ? String(item.place_id) : null;
                if (placeId && seenPlaceIds.has(placeId)) {
                    continue;
                }
                if (placeId)
                    seenPlaceIds.add(placeId);
                const category = item.type || (Array.isArray(item.types) && item.types[0]) || null;
                const cid = item.data_cid ? String(item.data_cid) : (item.data_id ? String(item.data_id) : null);
                const mapsUrl = (item.data_cid ? `https://www.google.com/maps?cid=${item.data_cid}` : null) ||
                    (placeId ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : null) ||
                    (item.link && item.link.includes('google.com') ? item.link : null);
                const business = {
                    name: item.title.trim(),
                    category: category ? String(category) : null,
                    address: item.address ? String(item.address) : null,
                    phone: item.phone ? String(item.phone).trim() : null,
                    website: item.website ? String(item.website).trim() : null,
                    rating: typeof item.rating === 'number' ? item.rating : (parseFloat(item.rating) || null),
                    reviews: typeof item.reviews === 'number' ? item.reviews : (parseInt(item.reviews, 10) || null),
                    latitude: item.gps_coordinates?.latitude ? Number(item.gps_coordinates.latitude) : null,
                    longitude: item.gps_coordinates?.longitude ? Number(item.gps_coordinates.longitude) : null,
                    placeId,
                    cid,
                    googleMapsUrl: mapsUrl,
                    thumbnail: item.thumbnail || item.serpapi_thumbnail || null,
                    openState: item.open_state || item.hours || null,
                    operatingHours: item.operating_hours || null,
                    priceLevel: item.price ? String(item.price) : null,
                    description: item.description ? String(item.description) : null,
                    serviceOptions: item.service_options || null,
                    sourceQuery: query,
                    sourceProvider: this.providerName,
                    isDemo: false
                };
                results.push(business);
                if (results.length >= targetLimit) {
                    hasMore = false;
                    break;
                }
            }
            // Check if SerpApi returned pagination for next page
            if (data.serpapi_pagination?.next && hasMore) {
                currentStart += batchSize;
            }
            else {
                hasMore = false;
            }
        }
        return results;
    }
}
exports.SerpApiMapsProvider = SerpApiMapsProvider;
