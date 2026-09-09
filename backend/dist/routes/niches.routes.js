"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../db/prisma"));
const router = (0, express_1.Router)();
// GET /api/niches
router.get('/', async (_req, res) => {
    try {
        const niches = await prisma_1.default.niche.findMany({
            orderBy: [{ isCustom: 'desc' }, { name: 'asc' }]
        });
        return res.json(niches);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// POST /api/niches - Create custom niche
router.post('/', async (req, res) => {
    try {
        const { name, category = 'Custom', keywords, synonyms, searchOperators } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Niche name is required.' });
        }
        const existing = await prisma_1.default.niche.findUnique({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: 'A niche with this name already exists.' });
        }
        const newNiche = await prisma_1.default.niche.create({
            data: {
                name: name.trim(),
                category,
                keywords: Array.isArray(keywords) ? keywords.join(', ') : (keywords || name),
                synonyms: Array.isArray(synonyms) ? synonyms.join(', ') : (synonyms || name),
                searchOperators: searchOperators ? JSON.stringify(searchOperators) : null,
                isCustom: true
            }
        });
        return res.status(201).json(newNiche);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// DELETE /api/niches/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const niche = await prisma_1.default.niche.findUnique({ where: { id } });
        if (!niche) {
            return res.status(404).json({ error: 'Niche not found.' });
        }
        if (!niche.isCustom) {
            return res.status(400).json({ error: 'Cannot delete default system niches.' });
        }
        await prisma_1.default.niche.delete({ where: { id } });
        return res.json({ success: true, message: 'Custom niche deleted.' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
