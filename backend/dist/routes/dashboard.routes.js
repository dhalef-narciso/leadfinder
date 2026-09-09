"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../db/prisma"));
const router = (0, express_1.Router)();
// GET /api/dashboard/stats
router.get('/stats', async (_req, res) => {
    try {
        const validWhere = { validationStatus: { not: 'INVALID' } };
        const totalLeads = await prisma_1.default.lead.count({ where: validWhere });
        const newLeads = await prisma_1.default.lead.count({ where: { status: 'New', ...validWhere } });
        const highOpportunityLeads = await prisma_1.default.lead.count({
            where: {
                scoreTier: { in: ['Very High', 'High'] },
                ...validWhere
            }
        });
        const leadsWithoutWebsites = await prisma_1.default.lead.count({
            where: { websiteStatus: 'Website Not Found', ...validWhere }
        });
        const leadsContacted = await prisma_1.default.lead.count({
            where: { status: { in: ['Contacted', 'Interested', 'Client'] }, ...validWhere }
        });
        const leadsInterested = await prisma_1.default.lead.count({
            where: { status: 'Interested', ...validWhere }
        });
        const clientsWon = await prisma_1.default.lead.count({
            where: { status: 'Client', ...validWhere }
        });
        // Conversion rate: Contacted -> Interested/Client
        const conversionRate = leadsContacted > 0
            ? Math.round(((leadsInterested + clientsWon) / leadsContacted) * 100)
            : 0;
        // Breakdown by score tier
        const veryHighCount = await prisma_1.default.lead.count({ where: { scoreTier: 'Very High', ...validWhere } });
        const highCount = await prisma_1.default.lead.count({ where: { scoreTier: 'High', ...validWhere } });
        const mediumCount = await prisma_1.default.lead.count({ where: { scoreTier: 'Medium', ...validWhere } });
        const lowCount = await prisma_1.default.lead.count({ where: { scoreTier: 'Low', ...validWhere } });
        // Recent high-opportunity leads (exclude invalid leads)
        const topProspects = await prisma_1.default.lead.findMany({
            where: { scoreTier: { in: ['Very High', 'High'] }, ...validWhere },
            orderBy: { opportunityScore: 'desc' },
            take: 6
        });
        // Recent saved searches
        const recentSearches = await prisma_1.default.search.findMany({
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
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
