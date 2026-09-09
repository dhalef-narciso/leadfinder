"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const MockSearchProvider_1 = require("./MockSearchProvider");
const SerpApiProvider_1 = require("./SerpApiProvider");
const GoogleSearchProvider_1 = require("./GoogleSearchProvider");
const SerpApiMapsProvider_1 = require("./SerpApiMapsProvider");
const MockMapsProvider_1 = require("./MockMapsProvider");
class ProviderFactory {
    static cachedSearchProvider = null;
    static activeSearchProviderName = '';
    static cachedMapsProvider = null;
    static activeMapsProviderName = '';
    /**
     * Returns search provider for enrichment (Google Search)
     */
    static getProvider(overrideType) {
        const providerType = (overrideType || process.env.SEARCH_PROVIDER || 'mock').toLowerCase();
        if (this.cachedSearchProvider && this.activeSearchProviderName === providerType) {
            return this.cachedSearchProvider;
        }
        let provider;
        switch (providerType) {
            case 'serpapi':
                provider = new SerpApiProvider_1.SerpApiProvider();
                break;
            case 'google':
            case 'googlesearch':
                provider = new GoogleSearchProvider_1.GoogleSearchProvider();
                break;
            case 'mock':
            default:
                provider = new MockSearchProvider_1.MockSearchProvider();
                break;
        }
        this.cachedSearchProvider = provider;
        this.activeSearchProviderName = providerType;
        return provider;
    }
    /**
     * Returns Google Maps provider for business discovery
     */
    static getMapsProvider(overrideType) {
        const defaultMaps = process.env.MAPS_PROVIDER || (process.env.SEARCH_API_KEY ? 'serpapi' : 'mock');
        const providerType = (overrideType || defaultMaps).toLowerCase();
        if (this.cachedMapsProvider && this.activeMapsProviderName === providerType) {
            return this.cachedMapsProvider;
        }
        let provider;
        switch (providerType) {
            case 'serpapi':
                provider = new SerpApiMapsProvider_1.SerpApiMapsProvider();
                break;
            case 'mock':
            default:
                provider = new MockMapsProvider_1.MockMapsProvider();
                break;
        }
        this.cachedMapsProvider = provider;
        this.activeMapsProviderName = providerType;
        return provider;
    }
    static getActiveProviderName() {
        return process.env.SEARCH_PROVIDER || 'mock';
    }
    static getActiveMapsProviderName() {
        return process.env.MAPS_PROVIDER || (process.env.SEARCH_API_KEY ? 'serpapi' : 'mock');
    }
}
exports.ProviderFactory = ProviderFactory;
