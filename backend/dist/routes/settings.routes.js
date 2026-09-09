"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProviderFactory_1 = require("../providers/ProviderFactory");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    return res.json({
        activeProvider: ProviderFactory_1.ProviderFactory.getActiveProviderName(),
        activeMapsProvider: ProviderFactory_1.ProviderFactory.getActiveMapsProviderName(),
        hasApiKey: !!process.env.SEARCH_API_KEY,
        availableProviders: [
            { id: 'serpapi', name: 'SerpApi (Google Maps Discovery & Google Search Enrichment)', active: process.env.SEARCH_PROVIDER === 'serpapi' },
            { id: 'mock', name: 'Mock Provider (Instant Demo / Zero API Key)', active: process.env.SEARCH_PROVIDER === 'mock' || !process.env.SEARCH_PROVIDER },
            { id: 'google', name: 'Google Programmable Search Engine API', active: process.env.SEARCH_PROVIDER === 'google' }
        ]
    });
});
exports.default = router;
