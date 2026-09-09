import { Router, Request, Response } from 'express';
import { ProviderFactory } from '../providers/ProviderFactory';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json({
    activeProvider: ProviderFactory.getActiveProviderName(),
    activeMapsProvider: ProviderFactory.getActiveMapsProviderName(),
    hasApiKey: !!process.env.SEARCH_API_KEY,
    availableProviders: [
      { id: 'serpapi', name: 'SerpApi (Google Maps Discovery & Google Search Enrichment)', active: process.env.SEARCH_PROVIDER === 'serpapi' },
      { id: 'mock', name: 'Mock Provider (Instant Demo / Zero API Key)', active: process.env.SEARCH_PROVIDER === 'mock' || !process.env.SEARCH_PROVIDER },
      { id: 'google', name: 'Google Programmable Search Engine API', active: process.env.SEARCH_PROVIDER === 'google' }
    ]
  });
});

export default router;
