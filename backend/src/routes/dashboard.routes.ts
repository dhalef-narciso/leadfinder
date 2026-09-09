import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const validWhere = { validationStatus: { not: 'INVALID' } };

    const totalLeads = await prisma.lead.count({ where: validWhere });
    const newLeads = await prisma.lead.count({ where: { status: 'New', ...validWhere } });
    const highOpportunityLeads = await prisma.lead.count({
      where: {
        scoreTier: { in: ['Very High', 'High'] },
        ...validWhere
      }
    });
    const leadsWithoutWebsites = await prisma.lead.count({
      where: { websiteStatus: 'Website Not Found', ...validWhere }
    });
    const leadsContacted = await prisma.lead.count({
      where: { status: { in: ['Contacted', 'Interested', 'Client'] }, ...validWhere }
    });
    const leadsInterested = await prisma.lead.count({
      where: { status: 'Interested', ...validWhere }
    });
    const clientsWon = await prisma.lead.count({
      where: { status: 'Client', ...validWhere }
    });

    // Conversion rate: Contacted -> Interested/Client
    const conversionRate = leadsContacted > 0
      ? Math.round(((leadsInterested + clientsWon) / leadsContacted) * 100)
      : 0;

    // Breakdown by score tier
    const veryHighCount = await prisma.lead.count({ where: { scoreTier: 'Very High', ...validWhere } });
    const highCount = await prisma.lead.count({ where: { scoreTier: 'High', ...validWhere } });
    const mediumCount = await prisma.lead.count({ where: { scoreTier: 'Medium', ...validWhere } });
    const lowCount = await prisma.lead.count({ where: { scoreTier: 'Low', ...validWhere } });

    // Recent high-opportunity leads (exclude invalid leads)
    const topProspects = await prisma.lead.findMany({
      where: { scoreTier: { in: ['Very High', 'High'] }, ...validWhere },
      orderBy: { opportunityScore: 'desc' },
      take: 6
    });

    // Recent saved searches
    const recentSearches = await prisma.search.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    return res.json({
      metrics: {
        totalLeads,
        newLeads,
        highOpportunityLeads,
        leadsWithoutWebsites,
        leadsContacted,
        leadsInterested,
        clientsWon,
        conversionRate
      },
      tierBreakdown: {
        veryHigh: veryHighCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount
      },
      topProspects,
      recentSearches
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
