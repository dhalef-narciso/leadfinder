"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../db/prisma"));
const WebsitePromptGenerator_1 = require("../services/WebsitePromptGenerator");
const OutreachMessageGenerator_1 = require("../services/OutreachMessageGenerator");
const router = (0, express_1.Router)();
// GET /api/leads - Filterable, sortable list
router.get('/', async (req, res) => {
    try {
        const { niche, location, opportunityTier, websiteStatus, status, validationStatus, showRejected, hasPhone, hasEmail, hasInstagram, search, sortBy = 'opportunityScore', order = 'desc' } = req.query;
        const where = {};
        // Validation Status Filtering
        // Default view: Verified + Potential. Hide Invalid leads unless explicitly requested or showRejected is true.
        if (validationStatus === 'VERIFIED') {
            where.validationStatus = 'VERIFIED';
        }
        else if (validationStatus === 'POTENTIAL' || validationStatus === 'needs_verification') {
            where.validationStatus = 'POTENTIAL';
        }
        else if (validationStatus === 'INVALID') {
            where.validationStatus = 'INVALID';
        }
        else if (validationStatus === 'all') {
            if (showRejected !== 'true') {
                where.validationStatus = { in: ['VERIFIED', 'POTENTIAL'] };
            }
        }
        else {
            // Default: exclude INVALID unless showRejected is true
            if (showRejected !== 'true') {
                where.validationStatus = { in: ['VERIFIED', 'POTENTIAL'] };
            }
        }
        if (niche && niche !== 'all') {
            where.niche = { contains: String(niche) };
        }
        if (location && location !== 'all') {
            where.location = { contains: String(location) };
        }
        if (opportunityTier && opportunityTier !== 'all') {
            if (opportunityTier === 'high_opportunity') {
                where.scoreTier = { in: ['Very High', 'High'] };
            }
            else {
                where.scoreTier = String(opportunityTier);
            }
        }
        if (websiteStatus && websiteStatus !== 'all') {
            if (websiteStatus === 'no_website') {
                where.websiteStatus = 'Website Not Found';
            }
            else if (websiteStatus === 'has_website') {
                where.websiteStatus = 'Website Found';
            }
            else {
                where.websiteStatus = String(websiteStatus);
            }
        }
        if (status && status !== 'all') {
            where.status = String(status);
        }
        if (hasPhone === 'true') {
            where.phone = { not: null };
        }
        if (hasEmail === 'true') {
            where.email = { not: null };
        }
        if (hasInstagram === 'true') {
            where.instagram = { not: null };
        }
        if (search) {
            where.OR = [
                { businessName: { contains: String(search) } },
                { location: { contains: String(search) } },
                { niche: { contains: String(search) } }
            ];
        }
        const orderBy = {};
        if (sortBy === 'opportunityScore') {
            orderBy.opportunityScore = order === 'asc' ? 'asc' : 'desc';
        }
        else if (sortBy === 'discoveredAt') {
            orderBy.discoveredAt = order === 'asc' ? 'asc' : 'desc';
        }
        else if (sortBy === 'businessName') {
            orderBy.businessName = order === 'asc' ? 'asc' : 'desc';
        }
        else {
            orderBy.opportunityScore = 'desc';
        }
        const leads = await prisma_1.default.lead.findMany({
            where,
            orderBy
        });
        return res.json(leads);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// GET /api/leads/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await prisma_1.default.lead.findUnique({
            where: { id },
            include: {
                statusHistory: { orderBy: { changedAt: 'desc' } },
                outreachMessages: { orderBy: { createdAt: 'desc' } },
                websiteDemoPrompts: { orderBy: { createdAt: 'desc' } }
            }
        });
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found.' });
        }
        return res.json(lead);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// PATCH /api/leads/:id
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, contactName } = req.body;
        const currentLead = await prisma_1.default.lead.findUnique({ where: { id } });
        if (!currentLead) {
            return res.status(404).json({ error: 'Lead not found.' });
        }
        // Record status history if status changed
        if (status && status !== currentLead.status) {
            await prisma_1.default.leadStatusHistory.create({
                data: {
                    leadId: id,
                    oldStatus: currentLead.status,
                    newStatus: status,
                    note: notes || undefined
                }
            });
        }
        const updated = await prisma_1.default.lead.update({
            where: { id },
            data: {
                ...(status ? { status } : {}),
                ...(notes !== undefined ? { notes } : {})
            },
            include: {
                statusHistory: { orderBy: { changedAt: 'desc' } },
                outreachMessages: { orderBy: { createdAt: 'desc' } }
            }
        });
        return res.json(updated);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// DELETE /api/leads - Delete all leads
router.delete('/', async (_req, res) => {
    try {
        await prisma_1.default.leadContact.deleteMany();
        await prisma_1.default.leadSocialProfile.deleteMany();
        await prisma_1.default.leadStatusHistory.deleteMany();
        await prisma_1.default.outreachMessage.deleteMany();
        const result = await prisma_1.default.lead.deleteMany();
        return res.json({ success: true, count: result.count, message: 'All leads deleted.' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.lead.delete({ where: { id } });
        return res.json({ success: true, message: 'Lead removed.' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// POST /api/leads/:id/demo-prompt - Generate and save Lovable prompt
router.post('/:id/demo-prompt', async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await prisma_1.default.lead.findUnique({ where: { id } });
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found.' });
        }
        const prompt = WebsitePromptGenerator_1.WebsitePromptGenerator.generate(lead);
        const [savedPrompt] = await prisma_1.default.$transaction([
            prisma_1.default.websiteDemoPrompt.create({
                data: {
                    leadId: id,
                    prompt
                }
            }),
            prisma_1.default.lead.update({
                where: { id },
                data: { demoGenerated: true }
            })
        ]);
        return res.json({
            id: savedPrompt.id,
            prompt: savedPrompt.prompt,
            createdAt: savedPrompt.createdAt,
            demoGenerated: true
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// GET /api/leads/:id/demo-prompts - Retrieve demo prompt history
router.get('/:id/demo-prompts', async (req, res) => {
    try {
        const { id } = req.params;
        const prompts = await prisma_1.default.websiteDemoPrompt.findMany({
            where: { leadId: id },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(prompts);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// POST /api/leads/:id/outreach - Generate and optionally save outreach message
router.post('/:id/outreach', async (req, res) => {
    try {
        const { id } = req.params;
        const { tone = 'Friendly', style, language = 'en', hasDemo, contactName, save = true } = req.body;
        const lead = await prisma_1.default.lead.findUnique({ where: { id } });
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found.' });
        }
        const selectedTone = (tone || style || 'Friendly');
        // If hasDemo is explicitly passed use it; otherwise check if lead.demoGenerated is true
        const demoAware = hasDemo !== undefined ? Boolean(hasDemo) : Boolean(lead.demoGenerated);
        const messageText = OutreachMessageGenerator_1.OutreachMessageGenerator.generate({
            businessName: lead.businessName,
            niche: lead.niche,
            location: lead.location,
            contactName: contactName || undefined,
            hasWebsite: lead.websiteStatus === 'Website Found',
            websiteUrl: lead.websiteUrl,
            instagram: lead.instagram,
            facebook: lead.facebook,
            phone: lead.phone,
            rating: lead.rating,
            reviewsCount: lead.reviewsCount,
            hasDemo: demoAware,
            tone: selectedTone,
            language: language === 'pt' ? 'pt' : 'en'
        });
        let savedMessage = null;
        if (save) {
            savedMessage = await prisma_1.default.outreachMessage.create({
                data: {
                    leadId: id,
                    style: selectedTone,
                    language: String(language || 'en'),
                    messageText,
                    demoGeneratedAtGeneration: demoAware
                }
            });
        }
        return res.json({
            id: savedMessage?.id,
            style: selectedTone,
            tone: selectedTone,
            language: language || 'en',
            messageText,
            demoGeneratedAtGeneration: demoAware,
            createdAt: savedMessage?.createdAt || new Date()
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// GET /api/leads/:id/outreach - Retrieve outreach history
router.get('/:id/outreach', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await prisma_1.default.outreachMessage.findMany({
            where: { leadId: id },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(messages);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
