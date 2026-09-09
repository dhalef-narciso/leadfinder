"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSearchProvider = void 0;
class GoogleSearchProvider {
    providerName = 'GoogleSearchProvider';
    apiKey;
    cx;
    constructor(apiKey, cx) {
        this.apiKey = apiKey || process.env.SEARCH_API_KEY || '';
        this.cx = cx || process.env.GOOGLE_SEARCH_CX || '';
    }
    async search(query, location, options) {
        if (!this.apiKey || !this.cx) {
            throw new Error('Google Programmable Search requires SEARCH_API_KEY and GOOGLE_SEARCH_CX.');
        }
        const fullQuery = `${query} ${location}`.trim();
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.append('key', this.apiKey);
        url.searchParams.append('cx', this.cx);
        url.searchParams.append('q', fullQuery);
        url.searchParams.append('num', String(options?.limit || 10));
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Google Custom Search request failed with status: ${response.status}`);
        }
        const data = (await response.json());
        const items = data.items || [];
        return items.map((item) => {
            let detectedSocial = null;
            if (item.link?.includes('instagram.com'))
                detectedSocial = 'instagram';
            else if (item.link?.includes('facebook.com'))
                detectedSocial = 'facebook';
            return {
                title: item.title || '',
                link: item.link || '',
                snippet: item.snippet || '',
                displayLink: item.displayLink || '',
                sourceQuery: query,
                detectedSocialPlatform: detectedSocial,
                searchProvider: this.providerName,
                isDemo: false
            };
        });
    }
}
exports.GoogleSearchProvider = GoogleSearchProvider;
