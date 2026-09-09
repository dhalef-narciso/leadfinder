import React, { useState } from 'react';
import { SavedSearch, Lead } from '../../types';
import { apiService } from '../../services/api';
import { 
  Bookmark, 
  Play, 
  Trash2, 
  Calendar, 
  MapPin, 
  Loader2, 
  Layers,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface Props {
  searches: SavedSearch[];
  onRefresh: () => void;
  onSearchReRun: (leads: Lead[], searchId: string) => void;
}

export const SavedSearchesView: React.FC<Props> = ({
  searches,
  onRefresh,
  onSearchReRun
}) => {
  const [runningId, setRunningId] = useState<string | null>(null);

  const handleReRun = async (search: SavedSearch) => {
    try {
      setRunningId(search.id);
      let parsedLocations: string[] = ['Limerick'];
      try {
        parsedLocations = JSON.parse(search.locations);
      } catch {
        parsedLocations = search.locations.split(',').map((s) => s.trim());
      }

      let parsedOptions: any = {};
      if (search.options) {
        try {
          parsedOptions = JSON.parse(search.options);
        } catch {}
      }

      const res = await apiService.runSearch({
        niche: search.nicheName,
        locations: parsedLocations,
        searchDepth: parsedOptions.searchDepth || 1,
        numLeads: parsedOptions.numLeads || 25,
        includeGoogleSearch: parsedOptions.includeGoogleSearch ?? true,
        includeInstagram: parsedOptions.includeInstagram ?? true,
        includeFacebook: parsedOptions.includeFacebook ?? true,
        includeWebsite: parsedOptions.includeWebsite ?? true,
        searchName: search.name
      });

      onSearchReRun(res.leads, res.searchId);
    } catch (err: any) {
      alert(`Failed to run search: ${err.message}`);
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;
    try {
      await apiService.deleteSavedSearch(id);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all saved searches?')) return;
    try {
      await apiService.clearAllSavedSearches();
      onRefresh();
    } catch (err: any) {
      alert(`Failed to clear all searches: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Saved Searches</h1>
          <p className="text-sm text-slate-400 mt-1">
            Rerun your configured prospecting campaigns or view previous search operator runs.
          </p>
        </div>
        {searches.length > 0 && (
          <button
            onClick={handleClearAll}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All Searches
          </button>
        )}
      </div>

      {searches.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
          <Bookmark className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm">No saved searches yet. Run a search from the Find Leads page to save configurations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searches.map((search) => {
            let locationsArray: string[] = [];
            try {
              locationsArray = JSON.parse(search.locations);
            } catch {
              locationsArray = [search.locations];
            }

            const isRunning = runningId === search.id;

            return (
              <div
                key={search.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {search.nicheName}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{search.name}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(search.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                      title="Delete saved search"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Locations */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {locationsArray.map((loc) => (
                      <span
                        key={loc}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                      >
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        {loc}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(search.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {search.totalFound} Leads Found
                    </span>
                  </div>

                  {/* Queries count if available */}
                  {search.queries && search.queries.length > 0 && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {search.queries.length} search operator queries executed
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    disabled={isRunning}
                    onClick={() => handleReRun(search)}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-glow disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Running Search...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Again</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
