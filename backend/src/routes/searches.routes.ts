import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { QueryGeneratorService } from '../services/QueryGeneratorService';
import { ProviderFactory } from '../providers/ProviderFactory';
import { LeadExtractorService } from '../services/LeadExtractorService';

const router = Router();

// Preview queries without running search
router.post('/preview-queries', async (req: Request, res: Response) => {
  try {
    const { niche, locations, includeInstagram, includeFacebook, depth } = req.body;
    if (!niche || !locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ error: 'Niche and at least one location are required.' });
    }

    // Check if custom niche has custom synonyms in DB
    const nicheRecord = await prisma.niche.findFirst({ where: { name: niche } });
    const customSynonyms = nicheRecord?.synonyms ? nicheRecord.synonyms.split(',').map((s) => s.trim()) : undefined;

    // 1. Google Maps Discovery Queries (3-5 variations)
    const mapsQueries = QueryGeneratorService.generateMapsQueries(niche, customSynonyms, 4);

    // 2. Google Search Enrichment Queries
    const enrichmentQueries = QueryGeneratorService.generate({
      niche,
      locations,
      synonyms: customSynonyms,
      includeInstagram: includeInstagram ?? true,
      includeFacebook: includeFacebook ?? true,
      depth: depth ?? 1
    });

    return res.json({
      mapsQueries,
      queries: enrichmentQueries,
      count: mapsQueries.length + enrichmentQueries.length
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate queries.' });
  }
});

// Run full prospecting search: GOOGLE MAPS DISCOVERY -> DEDUPLICATE -> ENRICH -> VALIDATE -> SCORE
router.post('/run', async (req: Request, res: Response) => {
  try {
    const {
      niche,
      locations,
      searchDepth = 1,
      numLeads = 25,
      includeGoogleSearch = true,
      includeInstagram = true,
      includeFacebook = true,
      includeWebsite = true,
      searchName
    } = req.body;

    if (!niche || !locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ error: 'Niche and at least one location are required.' });
    }

    const targetLeadsCount = Math.min(Math.max(Number(numLeads) || 25, 10), 100);

    // 1. Fetch synonyms if defined
    const nicheRecord = await prisma.niche.findFirst({ where: { name: niche } });
    const customSynonyms = nicheRecord?.synonyms ? nicheRecord.synonyms.split(',').map((s) => s.trim()) : undefined;

    // 2. Generate 3-5 Google Maps Discovery variations
    const mapsQueries = QueryGeneratorService.generateMapsQueries(niche, customSynonyms, 4);

    // 3. Discover real local businesses via Google Maps Provider
    const mapsProvider = ProviderFactory.getMapsProvider();
    const allDiscoveredBusinesses = [];

    for (const loc of locations) {
      for (const queryVariation of mapsQueries) {
        if (allDiscoveredBusinesses.length >= targetLeadsCount * 1.5) break;

        const needed = Math.max(targetLeadsCount - allDiscoveredBusinesses.length, 10);
        try {
          const batch = await mapsProvider.search(queryVariation, loc, {
            limit: needed,
            maxResults: targetLeadsCount
          });
          allDiscoveredBusinesses.push(...batch);
        } catch (err: any) {
          console.warn(`Maps query "${queryVariation}" for "${loc}" warning:`, err.message);
          // If 401 or auth failure, bubble up immediately
          if (err.message.includes('authentication failed')) {
            throw err;
          }
        }
      }
    }

    if (allDiscoveredBusinesses.length === 0) {
      return res.status(404).json({
        error: 'No businesses were found for this search. Please check your search provider configuration or try another location.'
      });
    }

    // 4. Run through Pipeline: Deduplicate -> Website Detection -> Search Enrichment -> Validation -> Opportunity Scoring
    const primaryLocation = locations.join(', ');
    const extractedLeads = await LeadExtractorService.extractFromMapsBusinesses(
      allDiscoveredBusinesses,
      niche,
      primaryLocation,
      {
        enrichment: {
          includeGoogleSearch,
          includeInstagram,
          includeFacebook,
          includeWebsite
        }
      }
    );

    // Limit to requested count
    const finalLeads = extractedLeads.slice(0, targetLeadsCount);

    // 5. Upsert leads in Database
    const savedLeads = [];
    for (const item of finalLeads) {
      const saved = await prisma.lead.upsert({
        where: { normalizedIdentityKey: item.normalizedIdentityKey },
        update: {
          businessName: item.businessName,
          niche: item.niche,
          location: item.location,
          description: item.description,
          websiteStatus: item.websiteStatus,
          websiteUrl: item.websiteUrl || undefined,
          instagram: item.instagram || undefined,
          facebook: item.facebook || undefined,
          phone: item.phone || undefined,
          email: item.email || undefined,
          googleBusinessUrl: item.googleBusinessUrl || undefined,
          discoverySource: item.discoverySource,
          googlePlaceId: item.googlePlaceId || undefined,
          googleCid: item.googleCid || undefined,
          googleMapsUrl: item.googleMapsUrl || undefined,
          address: item.address || undefined,
          rating: item.rating !== null ? item.rating : undefined,
          reviewsCount: item.reviewsCount !== null ? item.reviewsCount : undefined,
          category: item.category || undefined,
          latitude: item.latitude !== null ? item.latitude : undefined,
          longitude: item.longitude !== null ? item.longitude : undefined,
          fieldEvidence: item.fieldEvidence,
          opportunityScore: item.opportunityScore,
          scoreTier: item.scoreTier,
          scoreReason: item.scoreReason,
          searchQuery: item.searchQuery,
          searchProvider: item.searchProvider || undefined,
          sourceUrl: item.sourceUrl,
          validationStatus: item.validationStatus,
          validationConfidence: item.validationConfidence,
          isDemo: item.isDemo,
          evidence: item.evidence,
          urlValidations: item.urlValidations,
          contactVerifications: item.contactVerifications
        },
        create: {
          normalizedIdentityKey: item.normalizedIdentityKey,
          businessName: item.businessName,
          niche: item.niche,
          location: item.location,
          description: item.description,
          websiteStatus: item.websiteStatus,
          websiteUrl: item.websiteUrl,
          instagram: item.instagram,
          facebook: item.facebook,
          phone: item.phone,
          email: item.email,
          googleBusinessUrl: item.googleBusinessUrl,
          discoverySource: item.discoverySource,
          googlePlaceId: item.googlePlaceId,
          googleCid: item.googleCid,
          googleMapsUrl: item.googleMapsUrl,
          address: item.address,
          rating: item.rating,
          reviewsCount: item.reviewsCount,
          category: item.category,
          latitude: item.latitude,
          longitude: item.longitude,
          fieldEvidence: item.fieldEvidence,
          sourceUrl: item.sourceUrl,
          searchQuery: item.searchQuery,
          searchProvider: item.searchProvider,
          validationStatus: item.validationStatus,
          validationConfidence: item.validationConfidence,
          isDemo: item.isDemo,
          evidence: item.evidence,
          urlValidations: item.urlValidations,
          contactVerifications: item.contactVerifications,
          opportunityScore: item.opportunityScore,
          scoreTier: item.scoreTier,
          scoreReason: item.scoreReason,
          status: 'New'
        }
      });
      savedLeads.push(saved);
    }

    // 6. Save this search run history
    const savedSearch = await prisma.search.create({
      data: {
        name: searchName || `${niche} in ${locations.join(', ')}`,
        nicheId: nicheRecord?.id,
        nicheName: niche,
        locations: JSON.stringify(locations),
        options: JSON.stringify({
          discoverySource: 'google_maps',
          includeGoogleSearch,
          includeInstagram,
          includeFacebook,
          includeWebsite,
          searchDepth,
          numLeads: targetLeadsCount
        }),
        totalFound: savedLeads.length,
        queries: {
          create: mapsQueries.map((q) => ({
            queryText: `Maps: ${q}`,
            operatorType: 'standard',
            resultsCount: Math.ceil(savedLeads.length / mapsQueries.length)
          }))
        }
      }
    });

    // Compute summary breakdown
    const summary = {
      discovered: savedLeads.length,
      withWebsite: savedLeads.filter((l) => l.websiteStatus === 'Website Found').length,
      withoutWebsite: savedLeads.filter((l) => l.websiteStatus === 'Website Not Found').length,
      highOpportunity: savedLeads.filter((l) => l.scoreTier === 'Very High' || l.scoreTier === 'High').length,
      needsVerification: savedLeads.filter((l) => l.validationStatus === 'POTENTIAL').length,
      rejected: savedLeads.filter((l) => l.validationStatus === 'INVALID').length
    };

    return res.json({
      success: true,
      searchId: savedSearch.id,
      summary,
      queriesRun: mapsQueries.map((q) => ({ query: q, operatorType: 'maps_discovery' })),
      leadsFound: savedLeads.length,
      leads: savedLeads
    });
  } catch (error: any) {
    console.error('Search run error:', error);
    return res.status(500).json({ error: error.message || 'Error occurred while running search.' });
  }
});

// List saved searches
router.get('/', async (_req: Request, res: Response) => {
  try {
    const searches = await prisma.search.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        queries: true
      }
    });
    return res.json(searches);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create/Save a search
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, nicheName, locations, options } = req.body;
    const nicheRecord = await prisma.niche.findFirst({ where: { name: nicheName } });

    const search = await prisma.search.create({
      data: {
        name,
        nicheId: nicheRecord?.id,
        nicheName,
        locations: JSON.stringify(locations),
        options: JSON.stringify(options || {})
      }
    });
    return res.status(201).json(search);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete all saved searches
router.delete('/', async (_req: Request, res: Response) => {
  try {
    await prisma.searchQuery.deleteMany();
    const result = await prisma.search.deleteMany();
    return res.json({ success: true, count: result.count, message: 'All searches deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete saved search
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.search.delete({ where: { id } });
    return res.json({ success: true, message: 'Search deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
