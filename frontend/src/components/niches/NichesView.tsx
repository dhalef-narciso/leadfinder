import React, { useState } from 'react';
import { Niche } from '../../types';
import { apiService } from '../../services/api';
import { 
  Tags, 
  Plus, 
  Trash2, 
  Sparkles, 
  Search, 
  Check, 
  Terminal, 
  X,
  Layers
} from 'lucide-react';

interface Props {
  niches: Niche[];
  onRefresh: () => void;
}

export const NichesView: React.FC<Props> = ({ niches, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New custom niche form state
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Custom Services');
  const [keywords, setKeywords] = useState<string>('');
  const [synonyms, setSynonyms] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filteredNiches = niches.filter((n) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.synonyms.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await apiService.createNiche({
        name: name.trim(),
        category: category.trim(),
        keywords: keywords.split(',').map((s) => s.trim()).filter(Boolean),
        synonyms: synonyms.split(',').map((s) => s.trim()).filter(Boolean)
      });
      setShowAddModal(false);
      setName('');
      setKeywords('');
      setSynonyms('');
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create custom niche.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete custom niche "${name}"?`)) return;
    try {
      await apiService.deleteNiche(id);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Niches & Synonym Engine</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage target professions and the dynamic synonym dictionary used for search operator expansion.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-glow self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Niche</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search niches, categories, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Niches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNiches.map((niche) => {
          const synonymList = niche.synonyms ? niche.synonyms.split(',').map((s) => s.trim()) : [];

          return (
            <div
              key={niche.id}
              className={`p-5 rounded-2xl bg-slate-900 border flex flex-col justify-between transition-all ${
                niche.isCustom ? 'border-indigo-500/40 bg-indigo-950/10' : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {niche.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                      <span>{niche.name}</span>
                      {niche.isCustom && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Custom
                        </span>
                      )}
                    </h3>
                  </div>

                  {niche.isCustom && (
                    <button
                      onClick={() => handleDelete(niche.id, niche.name)}
                      className="p-1.5 rounded bg-slate-800 text-slate-500 hover:text-rose-400"
                      title="Delete custom niche"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Expanded Synonyms:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {synonymList.map((syn, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300 font-mono"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Auto-generates 5+ Boolean operators</span>
                <Terminal className="w-3 h-3 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Niche Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Add Custom Business Niche
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Niche / Profession Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dog Groomer, Solar Panel Installer, Yoga Studio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Pet Care, Renewable Energy, Fitness"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="dog grooming, pet wash, puppy haircut, pet salon"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Synonyms for Search Operators (comma separated)</label>
                <input
                  type="text"
                  placeholder="dog groomer, dog spa, canine grooming, pet groomer"
                  value={synonyms}
                  onChange={(e) => setSynonyms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  These synonyms will be dynamically plugged into <code className="text-indigo-400 font-mono">site:instagram.com</code> and <code className="text-indigo-400 font-mono">-website</code> queries.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {submitting ? 'Saving...' : 'Save Niche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
