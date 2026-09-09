import React, { useState, useEffect } from 'react';
import { Niche, GeneratedQuery, Lead, SearchResultsSummary } from '../../types';
import { apiService } from '../../services/api';
import { 
  Search, 
  MapPin, 
  Filter, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Plus,
  X,
  Compass,
  Globe,
  Instagram,
  Facebook,
  ShieldCheck,
  Building2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface Props {
  niches: Niche[];
  onSearchComplete: (leads: Lead[], searchId: string) => void;
}

export const FindLeadsView: React.FC<Props> = ({ niches, onSearchComplete }) => {
  const [selectedNiche, setSelectedNiche] = useState<string>('Cafe');
  const [customNicheInput, setCustomNicheInput] = useState<string>('');
  const [locations, setLocations] = useState<string[]>(['Ennis, Ireland']);
  const [newLocationInput, setNewLocationInput] = useState<string>('');
  const [numLeads, setNumLeads] = useState<number>(50);
  const [searchDepth, setSearchDepth] = useState<number>(1);
  const [searchName, setSearchName] = useState<string>('');

  // Discovery & Enrichment Toggles
  const [includeGoogleSearch, setIncludeGoogleSearch] = useState<boolean>(true);
  const [includeInstagram, setIncludeInstagram] = useState<boolean>(true);
  const [includeFacebook, setIncludeFacebook] = useState<boolean>(true);
  const [includeWebsite, setIncludeWebsite] = useState<boolean>(true);

  // Query preview state
  const [previewQueries, setPreviewQueries] = useState<GeneratedQuery[]>([]);
  const [mapsQueryVariations, setMapsQueryVariations] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  // Search progress state
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Search result summary modal state
  const [completedResults, setCompletedResults] = useState<{
    leads: Lead[];
    searchId: string;
    summary: SearchResultsSummary;
  } | null>(null);

  const activeNicheName = selectedNiche === 'custom' ? customNicheInput.trim() || 'Business' : selectedNiche;

  // Auto-refresh query previews
  useEffect(() => {
    if (!activeNicheName || locations.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        setPreviewLoading(true);
        const data = await apiService.previewQueries({
          niche: activeNicheName,
          locations,
          includeInstagram,
          includeFacebook,
        });
        setPreviewQueries(data.queries || []);
        setMapsQueryVariations(data.mapsQueries || [activeNicheName.toLowerCase()]);
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        setPreviewLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [activeNicheName, locations, includeInstagram, includeFacebook]);

  const handleAddLocation = () => {
    if (!newLocationInput.trim()) return;
    const split = newLocationInput.split(',').map((s) => s.trim()).filter(Boolean);
    const updated = Array.from(new Set([...locations, ...split]));
    setLocations(updated);
    setNewLocationInput('');
  };

  const handleRemoveLocation = (locToRemove: string) => {
    if (locations.length <= 1) return;
    setLocations(locations.filter((l) => l !== locToRemove));
  };

  const progressSteps = [
    'Discovering businesses on Google Maps...',
    'Fetching location details and ratings...',
    'Removing duplicate listings...',
    'Checking official websites...',
    'Enriching social profiles (Instagram & Facebook)...',
    'Validating lead legitimacy & scoring opportunities...',
    'Complete!'
  ];

  const handleRunSearch = async () => {
    if (!activeNicheName) {
      alert('Please specify a business niche.');
      return;
    }
    if (locations.length === 0) {
      alert('Please enter at least one location/city.');
      return;
    }

    setIsSearching(true);
    setCurrentStepIndex(0);
    setSearchError(null);
    setCompletedResults(null);

    // Realistic multi-step progress progression
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 900);

    try {
      const response = await apiService.runSearch({
        niche: activeNicheName,
        locations,
        searchDepth,
        numLeads,
        includeGoogleSearch,
        includeInstagram,
        includeFacebook,
        includeWebsite,
        searchName: searchName || `${activeNicheName} in ${locations.join(', ')}`
      });

      clearInterval(stepInterval);
      setCurrentStepIndex(6); // 'Complete!'

      setTimeout(() => {
        setIsSearching(false);
        const fallbackSummary: SearchResultsSummary = {
          discovered: response.leads.length,
          withWebsite: response.leads.filter((l) => l.websiteStatus === 'Website Found').length,
          withoutWebsite: response.leads.filter((l) => l.websiteStatus === 'Website Not Found').length,
          highOpportunity: response.leads.filter((l) => l.scoreTier === 'Very High' || l.scoreTier === 'High').length,
          needsVerification: response.leads.filter((l) => l.validationStatus === 'POTENTIAL').length,
          rejected: response.leads.filter((l) => l.validationStatus === 'INVALID').length
        };

        setCompletedResults({
          leads: response.leads,
          searchId: response.searchId,
          summary: response.summary || fallbackSummary
        });
      }, 700);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsSearching(false);
      setSearchError(err.response?.data?.error || err.message || 'Google Maps discovery failed. Please check your search provider configuration.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Google Maps Discovery Engine
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Google Search Enrichment
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Find Real Local Businesses</h1>
        <p className="text-sm text-slate-400 mt-1">
          Discover verified businesses on Google Maps and enrich them with Google Search to identify high-value website opportunities.
        </p>
      </div>

      {searchError && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>{searchError}</div>
        </div>
      )}

      {/* Results Summary Modal / Card if just finished */}
      {completedResults && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-5 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Discovery Complete!</h3>
                <p className="text-xs text-slate-400">
                  Google Maps found {completedResults.summary.discovered} verified local businesses in {locations.join(', ')}.
                </p>
              </div>
            </div>

            <button
              onClick={() => setCompletedResults(null)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-black text-white">{completedResults.summary.discovered}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Businesses Discovered</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-black text-rose-400">{completedResults.summary.withoutWebsite}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Without Website</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-black text-amber-400">{completedResults.summary.highOpportunity}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">High Opportunity</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-black text-emerald-400">{completedResults.summary.withWebsite}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">With Website</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-black text-indigo-400">{completedResults.summary.needsVerification}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Needs Verification</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-2xl font-black text-slate-500">{completedResults.summary.rejected}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Rejected</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onSearchComplete(completedResults.leads, completedResults.searchId)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-glow flex items-center justify-center gap-2"
            >
              <span>View Discovered Leads ({completedResults.leads.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCompletedResults(null)}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Run Another Search</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Search Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              Discovery Parameters
            </h2>

            {/* 1. Niche Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                1. Select Business Niche
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Cafe', 'Barber', 'Restaurant', 'Plumber', 'Beauty Salon', 'Electrician'].map((nicheOption) => (
                  <button
                    key={nicheOption}
                    type="button"
                    onClick={() => setSelectedNiche(nicheOption)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                      selectedNiche === nicheOption
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {nicheOption}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedNiche('custom')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                    selectedNiche === 'custom'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Custom Niche...
                </button>
              </div>

              {selectedNiche === 'custom' && (
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="e.g. Physiotherapist, Boutique, Car Detailer"
                    value={customNicheInput}
                    onChange={(e) => setCustomNicheInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* 2. Target Locations */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                2. Target Location / Cities
              </label>

              <div className="flex flex-wrap gap-2 mb-2">
                {locations.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs font-medium"
                  >
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    {loc}
                    {locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(loc)}
                        className="hover:text-rose-400 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter location (e.g. Ennis, Ireland or Limerick)"
                  value={newLocationInput}
                  onChange={(e) => setNewLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Quick suggestion chips */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span>Quick Add:</span>
                {['Ennis, Ireland', 'Limerick, Ireland', 'Shannon, Ireland', 'Galway, Ireland', 'Dublin, Ireland'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (!locations.includes(s)) setLocations([...locations, s]);
                    }}
                    className="hover:text-indigo-400 underline decoration-slate-700"
                  >
                    +{s.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Number of Businesses */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                3. Number of Businesses to Discover
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[25, 50, 100].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setNumLeads(count)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      numLeads === count
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {count} Businesses
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Discovery Source & Enrichment */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  4. Discovery Source & Enrichment
                </label>
              </div>

              {/* Primary Discovery Source Badge */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-xs font-semibold text-white">Google Maps Discovery (Primary)</div>
                    <div className="text-[11px] text-slate-400">Finds real physical businesses, coordinates, ratings, and phone numbers.</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>

              {/* Enrichment Options */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs text-slate-400 font-medium">Information Enrichment Sources:</div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeGoogleSearch}
                      onChange={(e) => setIncludeGoogleSearch(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Google Search</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeInstagram}
                      onChange={(e) => setIncludeInstagram(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>Instagram Profile</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeFacebook}
                      onChange={(e) => setIncludeFacebook(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Facebook className="w-3.5 h-3.5 text-blue-400" />
                    <span>Facebook Page</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeWebsite}
                      onChange={(e) => setIncludeWebsite(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Website Detection</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Search Name (Optional) */}
            <div className="pt-2">
              <label className="text-xs text-slate-400 block mb-1">Search Label (Optional)</label>
              <input
                type="text"
                placeholder={`e.g. ${activeNicheName} in ${locations.join(', ')}`}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Primary CTA button */}
            <button
              type="button"
              disabled={isSearching}
              onClick={handleRunSearch}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-indigo-500 hover:from-emerald-500 hover:to-indigo-400 text-white font-semibold text-sm transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Building2 className="w-4 h-4" />
              <span>Find Businesses ({numLeads})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Query Generator Engine & Operator Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                Discovery & Enrichment Engine
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Google Maps + Search
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Google Maps serves as the primary ground-truth discovery source for physical businesses. Google Search is subsequently targeted to enrich profiles and verify online presence.
            </p>

            {/* Google Maps Discovery Variations */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                Google Maps Discovery Variations ({mapsQueryVariations.length}):
              </div>

              <div className="space-y-1.5">
                {mapsQueryVariations.map((v, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono flex items-center justify-between"
                  >
                    <span>{v} in {locations[0] || 'Ennis'}</span>
                    <span className="text-[10px] text-emerald-400">Maps Search</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrichment Queries Preview */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Targeted Search Enrichment Operators:
              </div>

              <div className="space-y-2">
                {previewLoading ? (
                  <div className="py-6 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin mb-2 text-indigo-400" />
                    Updating queries...
                  </div>
                ) : (
                  [
                    { query: `"${activeNicheName} Business" "${locations[0] || 'Ennis'}"`, desc: 'Targeted website & phone extraction' },
                    { query: `"${activeNicheName} Business" "${locations[0] || 'Ennis'}" Instagram`, desc: 'Profile handle discovery' },
                    { query: `"${activeNicheName} Business" "${locations[0] || 'Ennis'}" Facebook`, desc: 'Facebook business page validation' }
                  ].map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-1 hover:border-slate-700 transition-colors"
                    >
                      <div className="text-indigo-300 break-all select-all font-semibold">
                        {q.query}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {q.desc}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Anti-Hallucination Policy:</strong> Instagram posts, Reels, and photos are strictly excluded. Only confirmed business profiles and Google Maps verified places become leads.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Multi-Step Search Progress Modal */}
      {isSearching && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Discovering Businesses</h3>
              <p className="text-xs text-slate-400">
                Searching Google Maps for <span className="text-emerald-300 font-medium">{activeNicheName}</span> in <span className="text-indigo-300 font-medium">{locations.join(', ')}</span> (Target: {numLeads} leads)
              </p>
            </div>

            {/* Step-by-step indicator */}
            <div className="space-y-2.5">
              {progressSteps.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs p-2.5 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-emerald-600/15 border border-emerald-500/30 text-emerald-200 font-semibold'
                        : isPassed
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
