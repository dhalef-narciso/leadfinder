import React from 'react';
import { DashboardStats, Lead } from '../../types';
import { OpportunityBadge } from '../common/OpportunityBadge';
import { WebsiteStatusBadge } from '../common/WebsiteStatusBadge';
import { LeadStatusPill } from '../common/LeadStatusPill';
import { 
  Users, 
  Flame, 
  GlobeLock, 
  Send, 
  TrendingUp, 
  Search, 
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Props {
  stats: DashboardStats | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onNavigate: (view: any) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
}

export const DashboardView: React.FC<Props> = ({
  stats,
  loading,
  error,
  onRetry,
  onNavigate,
  onSelectLead,
  onOpenOutreach
}) => {
  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-800/60 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-800/40 rounded-xl"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-glow">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Não foi possível carregar o Dashboard</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {error || 'O backend na porta 5001 não está respondendo. Certifique-se de que o servidor Node.js/Express está rodando.'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left max-w-lg w-full text-xs text-slate-300 space-y-2">
          <div className="font-semibold text-slate-200">Como resolver:</div>
          <div className="space-y-1 font-mono text-[11px] text-indigo-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div># Abra um terminal e inicie o backend:</div>
            <div>cd backend && npm run dev</div>
            <div className="text-slate-400 mt-1"># Ou na raiz do projeto:</div>
            <div>npm run dev</div>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-glow"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        )}
      </div>
    );
  }

  const { metrics, tierBreakdown, topProspects } = stats;

  const statCards = [
    {
      label: 'Total Leads Found',
      value: metrics.totalLeads,
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      label: 'New Leads',
      value: metrics.newLeads,
      icon: <Sparkles className="w-5 h-5 text-blue-400" />,
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'High Opportunity',
      value: metrics.highOpportunityLeads,
      icon: <Flame className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Without Websites',
      value: metrics.leadsWithoutWebsites,
      icon: <GlobeLock className="w-5 h-5 text-rose-400" />,
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      label: 'Leads Contacted',
      value: metrics.leadsContacted,
      icon: <Send className="w-5 h-5 text-purple-400" />,
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      label: 'Conversion Rate',
      value: `${metrics.conversionRate}%`,
      icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Prospecting Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track local businesses with strong social presence that need a professional website or landing page.
          </p>
        </div>
        <button
          onClick={() => onNavigate('find-leads')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-glow self-start"
        >
          <Search className="w-4 h-4" />
          <span>New Lead Search</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`p-4 rounded-xl border ${card.bg} flex flex-col justify-between transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              {card.icon}
            </div>
            <div className="mt-3 text-2xl font-bold text-white tracking-tight">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Opportunity Breakdown & Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier distribution card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Lead Opportunity Breakdown</h2>
            <span className="text-xs text-slate-400">{metrics.totalLeads} Total Analyzed</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">Very High (80-100)</span>
                <span className="text-slate-300 font-bold">{tierBreakdown.veryHigh}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.totalLeads ? (tierBreakdown.veryHigh / metrics.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-indigo-300 font-medium">High (60-79)</span>
                <span className="text-slate-300 font-bold">{tierBreakdown.high}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.totalLeads ? (tierBreakdown.high / metrics.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-300 font-medium">Medium (40-59)</span>
                <span className="text-slate-300 font-bold">{tierBreakdown.medium}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.totalLeads ? (tierBreakdown.medium / metrics.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Low (0-39)</span>
                <span className="text-slate-400 font-bold">{tierBreakdown.low}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-700 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.totalLeads ? (tierBreakdown.low / metrics.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Client Conversion Funnel</span>
            <span className="font-semibold text-emerald-400">{metrics.clientsWon} Clients Won</span>
          </div>
        </div>

        {/* Value Proposition Tip Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Freelance Web Developer Strategy
            </div>
            <h3 className="text-lg font-bold text-white">How to Convert Local Businesses</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Local service businesses (barbers, contractors, restaurants) with strong Instagram accounts already know the value of branding. Reach out with a personalized message offering a mobile-optimized 1-page booking landing page that connects directly to their Instagram bio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('find-leads')}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
            >
              Start Prospecting Search
            </button>
            <button
              onClick={() => onNavigate('leads')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              Browse All Leads ({metrics.totalLeads})
            </button>
          </div>
        </div>
      </div>

      {/* Top High-Opportunity Prospects Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Top High-Opportunity Prospects</h2>
            <p className="text-xs text-slate-400">High-scoring businesses missing a website with direct contact details</p>
          </div>
          <button
            onClick={() => onNavigate('leads')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>View all leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-medium">
                <th className="pb-3 pl-2">Opportunity</th>
                <th className="pb-3">Business</th>
                <th className="pb-3">Niche & Location</th>
                <th className="pb-3">Website Status</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topProspects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No leads found yet. Click "New Lead Search" above to start prospecting.
                  </td>
                </tr>
              ) : (
                topProspects.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 pl-2">
                      <OpportunityBadge score={lead.opportunityScore} tier={lead.scoreTier} />
                    </td>
                    <td className="py-3.5">
                      <div 
                        onClick={() => onSelectLead(lead)}
                        className="font-semibold text-white cursor-pointer hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{lead.businessName}</span>
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 max-w-[260px]">
                        {lead.description || 'Discovered via search operator'}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="text-xs font-medium text-slate-200">{lead.niche}</div>
                      <div className="text-xs text-slate-400">{lead.location}</div>
                    </td>
                    <td className="py-3.5">
                      <WebsiteStatusBadge status={lead.websiteStatus} url={lead.websiteUrl} />
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        {lead.phone && (
                          <span title={lead.phone} className="p-1 rounded bg-slate-800 text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                        {lead.email && (
                          <span title={lead.email} className="p-1 rounded bg-slate-800 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                          </span>
                        )}
                        {lead.instagram && (
                          <a
                            href={lead.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded bg-slate-800 text-pink-400 hover:bg-slate-700"
                            title="Open Instagram"
                          >
                            <span className="text-xs font-bold">IG</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <LeadStatusPill status={lead.status} />
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onOpenOutreach(lead)}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Outreach</span>
                        </button>
                        <button
                          onClick={() => onSelectLead(lead)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
