import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchesRouter from './routes/searches.routes';
import leadsRouter from './routes/leads.routes';
import nichesRouter from './routes/niches.routes';
import dashboardRouter from './routes/dashboard.routes';
import settingsRouter from './routes/settings.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Routes
app.use('/api/searches', searchesRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/niches', nichesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    appName: 'LeadFinder API',
    timestamp: new Date().toISOString()
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`LeadFinder Backend running on port ${PORT}`);
    console.log(`Active Search Provider: ${process.env.SEARCH_PROVIDER || 'mock'}`);
  });
}

export default app;
