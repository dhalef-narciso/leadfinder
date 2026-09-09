import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';

const router = Router();

// GET /api/niches
router.get('/', async (_req: Request, res: Response) => {
  try {
    const niches = await prisma.niche.findMany({
      orderBy: [{ isCustom: 'desc' }, { name: 'asc' }]
    });
    return res.json(niches);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/niches - Create custom niche
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category = 'Custom', keywords, synonyms, searchOperators } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Niche name is required.' });
    }

    const existing = await prisma.niche.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'A niche with this name already exists.' });
    }

    const newNiche = await prisma.niche.create({
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
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/niches/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const niche = await prisma.niche.findUnique({ where: { id } });
    if (!niche) {
      return res.status(404).json({ error: 'Niche not found.' });
    }
    if (!niche.isCustom) {
      return res.status(400).json({ error: 'Cannot delete default system niches.' });
    }

    await prisma.niche.delete({ where: { id } });
    return res.json({ success: true, message: 'Custom niche deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
