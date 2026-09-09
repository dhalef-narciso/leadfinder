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

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser calls (like health checks, curl)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production' ||
      !process.env.FRONTEND_URL ||
      process.env.CORS_ORIGIN === '*'
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
  const portNum = Number(PORT) || 5001;
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`LeadFinder Backend running on port ${portNum} (host: 0.0.0.0)`);
    console.log(`Active Search Provider: ${process.env.SEARCH_PROVIDER || 'mock'}`);
  });
}

export default app;
