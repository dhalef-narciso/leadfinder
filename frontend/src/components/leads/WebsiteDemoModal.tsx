import React, { useState, useEffect } from 'react';
import { Lead, WebsiteDemoPrompt } from '../../types';
import { apiService } from '../../services/api';
import { 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Globe, 
  History, 
  ExternalLink,
  Layers,
  AlertCircle
} from 'lucide-react';

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onPromptGenerated?: (leadId: string) => void;
  onShowToast?: (message: string) => void;
}

export const WebsiteDemoModal: React.FC<Props> = ({
  lead,
  onClose,
  onPromptGenerated,
  onShowToast
}) => {
  if (!lead) return null;

  const [promptText, setPromptText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<WebsiteDemoPrompt[]>(lead.websiteDemoPrompts || []);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const fetchPrompts = async () => {
    try {
      const list = await apiService.getWebsiteDemoPrompts(lead.id);
      setHistoryList(list);
      if (list.length > 0 && !promptText) {
        setPromptText(list[0].prompt);
      }
    } catch (err: any) {
      console.error('Failed to load prompts history:', err);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.generateWebsiteDemoPrompt(lead.id);
      setPromptText(res.prompt);
      setHistoryList((prev) => [res, ...prev.filter((p) => p.id !== res.id)]);
      if (onPromptGenerated) {
        onPromptGenerated(lead.id);
      }
    } catch (err: any) {
      console.error('Failed to generate Lovable prompt:', err);
      setError('Unable to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If lead already has prompts, show the latest one; otherwise generate
    if (lead.websiteDemoPrompts && lead.websiteDemoPrompts.length > 0) {
      setPromptText(lead.websiteDemoPrompts[0].prompt);
      setHistoryList(lead.websiteDemoPrompts);
    } else {
      handleGenerate();
    }
    fetchPrompts();
  }, [lead.id]);

  const handleCopy = () => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    if (onShowToast) {
      onShowToast('Prompt copied to clipboard');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = promptText ? promptText.trim().split(/\s+/).length : 0;
  const charCount = promptText ? promptText.length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Website Demo Prompt Generator</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold">
                  Lovable Optimized
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Targeting <span className="text-blue-300 font-semibold">{lead.businessName}</span> • {lead.niche} ({lead.location})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  showHistory 
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({historyList.length})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* History Drawer if toggled */}
          {showHistory && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Previous Lovable Prompts
                </span>
                <span className="text-[11px] text-slate-500">Click to load</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {historyList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                    onClick={() => {
                      setPromptText(item.prompt);
                      setShowHistory(false);
                    }}
                  >
                    <div className="truncate pr-3">
                      <span className="text-slate-300 font-medium">Prompt #{historyList.length - idx}</span>
                      <span className="text-slate-500 text-[11px] ml-2">
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span className="text-indigo-400 opacity-0 group-hover:opacity-100 text-[11px] transition-opacity">
                      Load →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Editor & Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Lovable Landing Page Prompt:
              </span>
              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} characters</span>
              </div>
            </div>

            {loading ? (
              <div className="h-72 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                <p className="text-xs font-medium">Generating complete, niche-tailored Lovable prompt...</p>
              </div>
            ) : (
              <textarea
                rows={12}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Generated prompt will appear here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
              />
            )}
          </div>

          {/* Step guidance */}
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-start gap-2.5 text-xs text-slate-300">
            <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-300">Workflow: </span>
              Copy this prompt, open <a href="https://lovable.dev" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">Lovable.dev <ExternalLink className="w-2.5 h-2.5" /></a>, paste into the project chat, and watch it generate a custom landing page for this business in 60 seconds.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating...' : 'Regenerate'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={loading || !promptText}
              onClick={handleCopy}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-glow"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
