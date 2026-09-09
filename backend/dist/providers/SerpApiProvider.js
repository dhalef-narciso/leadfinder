"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpApiProvider = void 0;
class SerpApiProvider {
    providerName = 'SerpApiProvider';
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.SEARCH_API_KEY || '';
    }
    async search(query, location, options) {
        if (!this.apiKey) {
            throw new Error('SERPAPI_API_KEY is not configured in environment variables.');
        }
        // Prepare SerpAPI Google Search endpoint
        const url = new URL('https://serpapi.com/search.json');
        url.searchParams.append('engine', 'google');
        url.searchParams.append('q', query);
        url.searchParams.append('location', location);
        url.searchParams.append('api_key', this.apiKey);
        url.searchParams.append('num', String(options?.limit || 10));
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`SerpApi request failed with status: ${response.status}`);
        }
        const data = (await response.json());
        const organicResults = data.organic_results || [];
        return organicResults.map((item) => {
            let detectedSocial = null;
            if (item.link?.includes('instagram.com'))
                detectedSocial = 'instagram';
            else if (item.link?.includes('facebook.com'))
                detectedSocial = 'facebook';
            return {
                title: item.title || '',
                link: item.link || '',
                snippet: item.snippet || '',
                displayLink: item.displayed_link || '',
                sourceQuery: query,
                detectedSocialPlatform: detectedSocial,
                searchProvider: this.providerName,
                isDemo: false
            };
        });
    }
}
exports.SerpApiProvider = SerpApiProvider;
