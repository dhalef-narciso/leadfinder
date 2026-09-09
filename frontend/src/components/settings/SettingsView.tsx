import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  Settings, 
  Layers, 
  Key, 
  CheckCircle, 
  Cpu, 
  Database, 
  Calculator,
  Terminal,
  ExternalLink
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiService.getSettings()
      .then((data) => setSettings(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings & Architecture</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure search provider integrations, API credentials, and lead scoring algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Search Provider Architecture */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                SearchProvider Architecture
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Active: {settings?.activeProvider?.toUpperCase() || 'MOCK'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              LeadFinder implements a strict provider interface (<code className="text-indigo-300 font-mono">ISearchProvider</code>). The engine does not scrape directly or bypass CAPTCHAs, preventing IP blocks and ensuring reliability.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    MockSearchProvider (Default Demo)
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    Zero-Config
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Generates realistic local businesses with full phone numbers, Instagram accounts, and website detection signals for any tested city and niche.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    SerpAPI Provider (Google Search Engine)
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    Plug-and-Play
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  To connect SerpApi, set in <code className="text-indigo-300 font-mono">backend/.env</code>:
                </p>
                <pre className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-emerald-400 overflow-x-auto">
SEARCH_PROVIDER=serpapi
SEARCH_API_KEY=your_serpapi_key_here
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    Google Programmable Search (Custom Search JSON API)
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    Official API
                  </span>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-emerald-400 overflow-x-auto">
SEARCH_PROVIDER=google
SEARCH_API_KEY=your_google_cloud_api_key
GOOGLE_SEARCH_CX=your_programmable_engine_cx
                </pre>
              </div>
            </div>
          </div>

          {/* Database Setup Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Relational Database Configuration
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Currently running on Prisma with local SQLite storage for instant zero-setup execution. Full PostgreSQL support is built into the schema.
            </p>

            <div className="space-y-2 text-xs">
              <span className="text-slate-300 font-medium block">To switch to PostgreSQL:</span>
              <ol className="list-decimal pl-5 text-slate-400 space-y-1 text-[11px]">
                <li>In <code className="text-indigo-300 font-mono">backend/prisma/schema.prisma</code>, change <code className="text-indigo-300 font-mono">provider = "sqlite"</code> to <code className="text-indigo-300 font-mono">provider = "postgresql"</code></li>
                <li>In <code className="text-indigo-300 font-mono">backend/.env</code>, set: <code className="text-indigo-300 font-mono">DATABASE_URL="postgresql://user:password@localhost:5432/leadfinder?schema=public"</code></li>
                <li>Run <code className="text-indigo-300 font-mono">npx prisma db push</code></li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column: Lead Scoring Rules */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              Opportunity Scoring System (0-100)
            </h2>
            <p className="text-xs text-slate-400">
              Leads are scored dynamically using the following weights:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">No professional website detected</span>
                <span className="font-bold text-emerald-400 font-mono">+40 pts</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Active Instagram found</span>
                <span className="font-bold text-emerald-400 font-mono">+15 pts</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Direct phone number found</span>
                <span className="font-bold text-emerald-400 font-mono">+10 pts</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Business email found</span>
                <span className="font-bold text-emerald-400 font-mono">+10 pts</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Google Business presence</span>
                <span className="font-bold text-emerald-400 font-mono">+10 pts</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Facebook business page</span>
                <span className="font-bold text-emerald-400 font-mono">+5 pts</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Active follower base</span>
                <span className="font-bold text-emerald-400 font-mono">+5 pts</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Professional website already in place</span>
                <span className="font-bold text-rose-400 font-mono">-40 pts</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300">Score Tiers:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="font-bold">80 - 100:</span> Very High
                </div>
                <div className="p-2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <span className="font-bold">60 - 79:</span> High
                </div>
                <div className="p-2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <span className="font-bold">40 - 59:</span> Medium
                </div>
                <div className="p-2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  <span className="font-bold">0 - 39:</span> Low
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
