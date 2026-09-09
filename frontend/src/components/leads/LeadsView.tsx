import React, { useState } from 'react';
import { Lead, LeadStatus } from '../../types';
import { OpportunityBadge } from '../common/OpportunityBadge';
import { WebsiteStatusBadge } from '../common/WebsiteStatusBadge';
import { LeadStatusPill } from '../common/LeadStatusPill';
import { ValidationBadge } from '../common/ValidationBadge';
import { 
  Search, 
  Phone, 
  Mail, 
  Copy, 
  Check, 
  MessageSquare, 
  Eye, 
  Trash2, 
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  Star,
  MapPin,
  Globe
} from 'lucide-react';

interface Props {
  leads: Lead[];
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onDeleteLead: (id: string) => void;
  onClearAllLeads?: () => void;
  onSelectLead: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
}

type FilterPreset = 'default' | 'all' | 'verified' | 'potential' | 'invalid' | 'high_opportunity' | 'no_website' | 'needs_verification';

export const LeadsView: React.FC<Props> = ({
  leads,
  onUpdateStatus,
  onDeleteLead,
  onClearAllLeads,
  onSelectLead,
  onOpenOutreach
}) => {
  const [activePreset, setActivePreset] = useState<FilterPreset>('default');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showRejected, setShowRejected] = useState<boolean>(false);
  const [filterWebsite, setFilterWebsite] = useState<'all' | 'no_website' | 'has_website'>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPhoneOnly, setFilterPhoneOnly] = useState<boolean>(false);
  const [filterEmailOnly, setFilterEmailOnly] = useState<boolean>(false);
  const [filterInstagramOnly, setFilterInstagramOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'score' | 'confidence' | 'name' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    // 1. Rejection / Validation Status Handling
    const isInvalid = lead.validationStatus === 'INVALID';

    if (activePreset === 'invalid') {
      if (!isInvalid) return false;
    } else if (activePreset === 'verified') {
      if (lead.validationStatus !== 'VERIFIED') return false;
    } else if (activePreset === 'potential') {
      if (lead.validationStatus !== 'POTENTIAL') return false;
    } else if (activePreset === 'needs_verification') {
      if (lead.validationStatus !== 'POTENTIAL') return false;
    } else if (activePreset === 'high_opportunity') {
      if (lead.scoreTier !== 'Very High' && lead.scoreTier !== 'High') return false;
      if (isInvalid && !showRejected) return false;
    } else if (activePreset === 'no_website') {
      if (lead.websiteStatus !== 'Website Not Found') return false;
      if (isInvalid && !showRejected) return false;
    } else if (activePreset === 'default') {
      // Default: Verified + Potential. Hide Invalid leads unless showRejected is checked.
      if (isInvalid && !showRejected) return false;
    } else if (activePreset === 'all') {
      if (isInvalid && !showRejected) return false;
    }

    // 2. Search text
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = lead.businessName.toLowerCase().includes(q);
      const matchNiche = lead.niche.toLowerCase().includes(q);
      const matchLoc = lead.location.toLowerCase().includes(q);
      if (!matchName && !matchNiche && !matchLoc) return false;
    }

    // 3. Website filter
    if (filterWebsite === 'no_website' && lead.websiteStatus !== 'Website Not Found') return false;
    if (filterWebsite === 'has_website' && lead.websiteStatus !== 'Website Found') return false;

    // 4. Tier filter
    if (filterTier === 'high_opportunity' && lead.scoreTier !== 'Very High' && lead.scoreTier !== 'High') return false;
    if (filterTier !== 'all' && filterTier !== 'high_opportunity' && lead.scoreTier !== filterTier) return false;

    // 5. Status filter
    if (filterStatus === 'contacted' && lead.status === 'New') return false;
    if (filterStatus === 'not_contacted' && lead.status !== 'New') return false;
    if (filterStatus !== 'all' && filterStatus !== 'contacted' && filterStatus !== 'not_contacted' && lead.status !== filterStatus) return false;

    // 6. Contact availability filters
    if (filterPhoneOnly && !lead.phone) return false;
    if (filterEmailOnly && !lead.email) return false;
    if (filterInstagramOnly && !lead.instagram) return false;

    return true;
  });

  // Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === 'score') {
      return sortOrder === 'desc' ? b.opportunityScore - a.opportunityScore : a.opportunityScore - b.opportunityScore;
    }
    if (sortBy === 'confidence') {
      const confA = a.validationConfidence ?? 50;
      const confB = b.validationConfidence ?? 50;
      return sortOrder === 'desc' ? confB - confA : confA - confB;
    }
    if (sortBy === 'name') {
      return sortOrder === 'desc' ? b.businessName.localeCompare(a.businessName) : a.businessName.localeCompare(b.businessName);
    }
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime()
        : new Date(a.discoveredAt).getTime() - new Date(b.discoveredAt).getTime();
    }
    return 0;
  });

  const handleCopyContact = (lead: Lead) => {
    const lines = [
      `Business: ${lead.businessName}`,
      `Niche: ${lead.niche} (${lead.location})`,
      lead.phone ? `Phone: ${lead.phone}` : null,
      lead.email ? `Email: ${lead.email}` : null,
      lead.instagram ? `Instagram: ${lead.instagram}` : null,
      lead.websiteUrl ? `Website: ${lead.websiteUrl}` : 'Website: None detected'
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Business Name',
      'Niche',
      'Location',
      'Validation Status',
      'Validation Confidence',
      'Opportunity Score',
      'Score Tier',
      'Website Status',
      'Phone',
      'Email',
      'Instagram',
      'Is Demo',
      'Status'
    ];
    const rows = sortedLeads.map(l => [
      `"${l.businessName.replace(/"/g, '""')}"`,
      `"${l.niche}"`,
      `"${l.location}"`,
      l.validationStatus || 'POTENTIAL',
      l.validationConfidence || 0,
      l.opportunityScore,
      l.scoreTier,
      `"${l.websiteStatus}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.instagram || ''}"`,
      l.isDemo ? 'Yes' : 'No',
      l.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadfinder_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rejectedCount = leads.filter(l => l.validationStatus === 'INVALID').length;
  const verifiedCount = leads.filter(l => l.validationStatus === 'VERIFIED').length;
  const potentialCount = leads.filter(l => l.validationStatus === 'POTENTIAL').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Discovered Leads</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse verified prospects, assess confidence ratings, and qualify opportunities. Showing {sortedLeads.length} of {leads.length} leads.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {leads.length > 0 && onClearAllLeads && (
            <button
              onClick={onClearAllLeads}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all"
              title="Clear all leads"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Leads
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Preset Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActivePreset('default')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activePreset === 'default'
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
          <span>Verified + Potential</span>
        </button>

        <button
          onClick={() => setActivePreset('verified')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activePreset === 'verified'
              ? 'bg-emerald-600 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified ({verifiedCount})</span>
        </button>

        <button
          onClick={() => setActivePreset('potential')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activePreset === 'potential'
              ? 'bg-amber-600 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Potential ({potentialCount})</span>
        </button>

        <button
          onClick={() => setActivePreset('high_opportunity')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activePreset === 'high_opportunity'
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          <span>High Opportunity</span>
        </button>

        <button
          onClick={() => setActivePreset('no_website')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activePreset === 'no_website'
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>No Website</span>
        </button>

        <button
          onClick={() => setActivePreset('needs_verification')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activePreset === 'needs_verification'
              ? 'bg-amber-600 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Needs Verification</span>
        </button>

        <button
          onClick={() => setActivePreset('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activePreset === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All Leads</span>
        </button>

        <button
          onClick={() => setActivePreset('invalid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activePreset === 'invalid'
              ? 'bg-rose-600 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-rose-400/80 hover:text-rose-300'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Invalid / Rejected ({rejectedCount})</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by business name, niche, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Quick filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={filterWebsite}
              onChange={(e: any) => setFilterWebsite(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Websites</option>
              <option value="no_website">No Website (Prospects)</option>
              <option value="has_website">Website Found</option>
            </select>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Opportunity Scores</option>
              <option value="high_opportunity">High Opportunity (60-100)</option>
              <option value="Very High">Very High (80-100)</option>
              <option value="High">High (60-79)</option>
              <option value="Medium">Medium (40-59)</option>
              <option value="Low">Low (0-39)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="not_contacted">Not Contacted (New)</option>
              <option value="contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Client">Client Won</option>
            </select>
          </div>
        </div>

        {/* Checkbox pills for contact attributes & sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <SlidersHorizontal className="w-3 h-3" /> Filters:
            </span>

            <button
              onClick={() => setFilterPhoneOnly(!filterPhoneOnly)}
              className={`px-2.5 py-1 rounded-full border transition-all ${
                filterPhoneOnly
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Phone Available
            </button>

            <button
              onClick={() => setFilterEmailOnly(!filterEmailOnly)}
              className={`px-2.5 py-1 rounded-full border transition-all ${
                filterEmailOnly
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Email Available
            </button>

            <button
              onClick={() => setFilterInstagramOnly(!filterInstagramOnly)}
              className={`px-2.5 py-1 rounded-full border transition-all ${
                filterInstagramOnly
                  ? 'bg-pink-500/20 border-pink-500/40 text-pink-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Instagram Available
            </button>

            {/* Debugging Toggle: Show rejected leads */}
            <label className="flex items-center gap-1.5 ml-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={showRejected}
                onChange={(e) => setShowRejected(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span className="text-[11px]">Show rejected leads</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300"
            >
              <option value="score">Opportunity Score</option>
              <option value="confidence">Validation Confidence</option>
              <option value="name">Business Name</option>
              <option value="date">Date Discovered</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs uppercase font-medium">
                <th className="py-3.5 pl-4">Opportunity</th>
                <th className="py-3.5">Business</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5">Location</th>
                <th className="py-3.5">Website</th>
                <th className="py-3.5">Instagram</th>
                <th className="py-3.5">Phone</th>
                <th className="py-3.5">Validation & Sources</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 text-sm">
                    No leads match the selected filters.
                  </td>
                </tr>
              ) : (
                sortedLeads.map((lead) => {
                  const isInvalid = lead.validationStatus === 'INVALID';
                  let parsedEvidence: Record<string, any> = {};
                  if (lead.fieldEvidence) {
                    try {
                      parsedEvidence = typeof lead.fieldEvidence === 'string' ? JSON.parse(lead.fieldEvidence) : lead.fieldEvidence;
                    } catch {
                      parsedEvidence = {};
                    }
                  }

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        isInvalid ? 'bg-rose-950/10 opacity-75' : ''
                      }`}
                    >
                      {/* 1. Opportunity Badge */}
                      <td className="py-4 pl-4 whitespace-nowrap">
                        <OpportunityBadge score={lead.opportunityScore} tier={lead.scoreTier} size="sm" />
                      </td>

                      {/* 2. Business Name & Rating */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div 
                            onClick={() => onSelectLead(lead)}
                            className="font-semibold text-white cursor-pointer hover:text-indigo-400 transition-colors text-sm"
                          >
                            {lead.businessName}
                          </div>
                          {isInvalid && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                              REJECTED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {lead.rating ? (
                            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{lead.rating.toFixed(1)}</span>
                              {lead.reviewsCount && (
                                <span className="text-slate-500">({lead.reviewsCount})</span>
                              )}
                            </div>
                          ) : null}

                          {/* Discovery Source Badge */}
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                            <MapPin className="w-2.5 h-2.5" />
                            Google Maps
                          </span>
                        </div>
                      </td>

                      {/* 3. Category */}
                      <td className="py-4 whitespace-nowrap">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                          {lead.category || lead.niche}
                        </span>
                      </td>

                      {/* 4. Location & Address */}
                      <td className="py-4">
                        <div className="text-xs font-semibold text-slate-200">{lead.location}</div>
                        {lead.address && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px]" title={lead.address}>
                            {lead.address}
                          </div>
                        )}
                      </td>

                      {/* 5. Website Status */}
                      <td className="py-4 whitespace-nowrap">
                        <WebsiteStatusBadge status={lead.websiteStatus} url={lead.websiteUrl} />
                      </td>

                      {/* 6. Instagram */}
                      <td className="py-4 whitespace-nowrap">
                        {lead.instagram ? (
                          <a
                            href={lead.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 hover:bg-pink-500/20 transition-colors font-medium"
                            title={lead.instagram}
                          >
                            <span>Instagram ✓</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-600">None</span>
                        )}
                      </td>

                      {/* 7. Phone */}
                      <td className="py-4 whitespace-nowrap">
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors font-medium"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>{lead.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-600">None</span>
                        )}
                      </td>

                      {/* 8. Validation & Enrichment Sources */}
                      <td className="py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <ValidationBadge
                            status={lead.validationStatus || 'POTENTIAL'}
                            confidence={lead.validationConfidence}
                            isDemo={lead.isDemo}
                            size="sm"
                          />
                          <div className="flex items-center gap-1 flex-wrap">
                            {parsedEvidence.website?.source === 'google_search' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/15 text-indigo-300">Search</span>
                            )}
                            {lead.facebook && (
                              <a
                                href={lead.facebook}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] px-1 py-0.2 rounded bg-blue-500/15 text-blue-300 hover:underline"
                              >
                                FB
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 9. CRM Status */}
                      <td className="py-4 whitespace-nowrap">
                        <LeadStatusPill
                          status={lead.status}
                          onChange={(newStatus) => onUpdateStatus(lead.id, newStatus)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenOutreach(lead)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-glow"
                            title="Generate personalized pitch"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Pitch</span>
                          </button>

                          <button
                            onClick={() => handleCopyContact(lead)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Copy contact information"
                          >
                            {copiedId === lead.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => onSelectLead(lead)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="View lead dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove ${lead.businessName} from leads?`)) {
                                onDeleteLead(lead.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
