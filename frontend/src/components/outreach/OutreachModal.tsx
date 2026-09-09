import React, { useState, useEffect } from 'react';
import { Lead, OutreachMessage } from '../../types';
import { apiService } from '../../services/api';
import { 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  MessageCircle,
  RefreshCw,
  History,
  CheckCircle2,
  Globe2,
  AlertCircle,
  Send,
  Layers
} from 'lucide-react';

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onMarkContacted?: (id: string) => void;
  onShowToast?: (message: string) => void;
}

type ToneOption = 'Friendly' | 'Professional' | 'Direct' | 'Casual' | 'Short';
type LanguageOption = 'en' | 'pt';

export const OutreachModal: React.FC<Props> = ({ 
  lead, 
  onClose, 
  onMarkContacted,
  onShowToast 
}) => {
  if (!lead) return null;

  // Detect if demo already exists
  const initialHasDemo = Boolean(
    lead.demoGenerated || 
    (lead.websiteDemoPrompts && lead.websiteDemoPrompts.length > 0)
  );

  const [tone, setTone] = useState<ToneOption>('Friendly');
  const [language, setLanguage] = useState<LanguageOption>('en');
  const [hasDemo, setHasDemo] = useState<boolean>(initialHasDemo);
  const [contactName, setContactName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<OutreachMessage[]>(lead.outreachMessages || []);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Parse phone verification state
  let contactVerifications: Record<string, any> = {};
  if (lead.contactVerifications) {
    try {
      contactVerifications = typeof lead.contactVerifications === 'string' 
        ? JSON.parse(lead.contactVerifications) 
        : lead.contactVerifications;
    } catch {
      contactVerifications = {};
    }
  }
  const phoneVerification = contactVerifications.phone;
  const isPhoneVerified = Boolean(
    lead.phone &&
    (phoneVerification?.status === 'verified' ||
     phoneVerification?.status === 'valid' ||
     (!phoneVerification && (lead.validationStatus === 'VERIFIED' || lead.validationConfidence >= 70)))
  );

  const fetchHistory = async () => {
    try {
      const list = await apiService.getOutreachMessages(lead.id);
      setHistoryList(list);
    } catch (err) {
      console.error('Failed to load outreach history:', err);
    }
  };

  const generateMessage = async (customTone?: ToneOption, customLang?: LanguageOption, demoOverride?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.generateOutreach(lead.id, {
        tone: customTone || tone,
        language: customLang || language,
        hasDemo: demoOverride !== undefined ? demoOverride : hasDemo,
        contactName: contactName.trim() || undefined,
        save: true
      });
      setMessage(res.messageText);
      setHistoryList((prev) => [res, ...prev.filter((m) => m.id !== res.id)]);
    } catch (err: any) {
      console.error('Outreach generation error:', err);
      setError('Unable to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateMessage(tone, language, hasDemo);
    fetchHistory();
  }, [lead.id, tone, language, hasDemo]);

  const handleCopy = () => {
    if (!message) return;
    navigator.clipboard.writeText(message);
    setCopied(true);
    if (onShowToast) {
      onShowToast('Message copied to clipboard');
    }
    setTimeout(() => setCopied(false), 2000);
    if (onMarkContacted && lead.status === 'New') {
      onMarkContacted(lead.id);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!lead.phone) return;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (onMarkContacted && lead.status === 'New') {
      onMarkContacted(lead.id);
    }
  };

  const toneOptions: Array<{ id: ToneOption; label: string; desc: string }> = [
    { id: 'Friendly', label: 'Friendly', desc: 'Natural & conversational' },
    { id: 'Professional', label: 'Professional', desc: 'Polished & business-focused' },
    { id: 'Direct', label: 'Direct', desc: 'Short & high impact' },
    { id: 'Casual', label: 'Casual', desc: 'Relaxed & approachable' },
    { id: 'Short', label: 'Short', desc: '2-3 punchy sentences' }
  ];

  const wordCount = message ? message.trim().split(/\s+/).length : 0;
  const charCount = message ? message.length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">WhatsApp Outreach Generator</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> High Conversion
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized conversation starter for <span className="text-emerald-300 font-semibold">{lead.businessName}</span> ({lead.location})
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
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Outreach History ({historyList.length})</span>
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

          {/* History Drawer */}
          {showHistory && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Past Generated Messages
                </span>
                <span className="text-[11px] text-slate-500">Click to load into editor</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {historyList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 flex items-start justify-between text-xs transition-colors cursor-pointer group gap-2"
                    onClick={() => {
                      setMessage(item.messageText);
                      setTone((item.style || item.tone || 'Friendly') as ToneOption);
                      if (item.language) setLanguage(item.language as LanguageOption);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                          {item.style || item.tone || 'Friendly'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {item.language || 'en'}
                        </span>
                        {item.demoGeneratedAtGeneration && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]">
                            Demo Concept
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 ml-auto">
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate">
                        {item.messageText}
                      </p>
                    </div>
                    <span className="text-emerald-400 opacity-0 group-hover:opacity-100 text-[11px] shrink-0 font-medium">
                      Load →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Controls Grid: Tone, Language, Demo Toggle, Contact Name */}
          <div className="space-y-3">
            
            {/* Tone Selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Outreach Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {toneOptions.map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setTone(btn.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      tone === btn.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{btn.label}</span>
                      {tone === btn.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </div>
                    <div className={`text-[10px] truncate ${tone === btn.id ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {btn.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Demo Awareness Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Language Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                  Language
                </label>
                <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      language === 'en'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English (IE/UK)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('pt')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      language === 'pt'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Português
                  </button>
                </div>
              </div>

              {/* Demo-Aware Outreach Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Website Demo Status
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors h-[38px]">
                  <input
                    type="checkbox"
                    checked={hasDemo}
                    onChange={(e) => setHasDemo(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-900 cursor-pointer"
                  />
                  <span className="text-xs text-slate-200 font-medium select-none">
                    I already created a demo
                  </span>
                </label>
              </div>

              {/* Contact Name (Optional) */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Contact Person (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John, Mary..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  onBlur={() => generateMessage(tone, language, hasDemo)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[38px]"
                />
              </div>

            </div>

          </div>

          {/* Editable Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                Personalized WhatsApp Copy (Editable):
              </span>
              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} characters</span>
              </div>
            </div>

            {loading ? (
              <div className="h-48 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <p className="text-xs">Crafting non-spammy conversation starter...</p>
              </div>
            ) : (
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Personalized WhatsApp message will appear here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
              />
            )}
          </div>

          {/* Safety & Best Practice Notice */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              💡 <strong className="text-slate-300">Best Practice:</strong> Goal is to start a conversation, not hard-sell. Review and adjust before sending.
            </span>
            {isPhoneVerified ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1 shrink-0 ml-2">
                <Check className="w-3 h-3" /> Phone Verified: {lead.phone}
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1 shrink-0 ml-2">
                Phone not verified (WhatsApp link disabled)
              </span>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => generateMessage(tone, language, hasDemo)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Regenerating...' : 'Regenerate'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>

            {/* Open WhatsApp Button: ONLY if phone is verified */}
            {isPhoneVerified && (
              <button
                type="button"
                disabled={loading || !message}
                onClick={handleOpenWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title={`Open WhatsApp chat with ${lead.phone}`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open WhatsApp</span>
              </button>
            )}

            <button
              type="button"
              disabled={loading || !message}
              onClick={handleCopy}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-glow"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Copied ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Message</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
