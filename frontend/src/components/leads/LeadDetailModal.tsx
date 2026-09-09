import React, { useState } from 'react';
import { Lead, LeadStatus, EvidenceItem } from '../../types';
import { OpportunityBadge } from '../common/OpportunityBadge';
import { WebsiteStatusBadge } from '../common/WebsiteStatusBadge';
import { LeadStatusPill } from '../common/LeadStatusPill';
import { ValidationBadge } from '../common/ValidationBadge';
import { 
  X, 
  Phone, 
  Mail, 
  ExternalLink, 
  Calendar, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  FileText,
  Save,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Instagram,
  Facebook,
  MapPin,
  Check,
  HelpCircle,
  XCircle,
  Database,
  Star,
  Monitor,
  Send
} from 'lucide-react';

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (id: string, updates: { status?: LeadStatus; notes?: string }) => void;
  onOpenOutreach: (lead: Lead) => void;
  onOpenWebsiteDemo?: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<Props> = ({
  lead,
  onClose,
  onUpdate,
  onOpenOutreach,
  onOpenWebsiteDemo
}) => {
  if (!lead) return null;

  const [notes, setNotes] = useState<string>(lead.notes || '');
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSaveNotes = () => {
    onUpdate(lead.id, { notes, status });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Parse evidence
  let evidenceList: EvidenceItem[] = [];
  if (lead.evidence) {
    try {
      evidenceList = typeof lead.evidence === 'string' ? JSON.parse(lead.evidence) : lead.evidence;
    } catch {
      evidenceList = [];
    }
  }

  // Parse contact verifications
  let contactVerifications: Record<string, any> = {};
  if (lead.contactVerifications) {
    try {
      contactVerifications = typeof lead.contactVerifications === 'string' ? JSON.parse(lead.contactVerifications) : lead.contactVerifications;
    } catch {
      contactVerifications = {};
    }
  }

  const phoneVerification = contactVerifications.phone;
  const emailVerification = contactVerifications.email;
  const igVerification = contactVerifications.instagram;
  const fbVerification = contactVerifications.facebook;

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'search_result':
        return <Search className="w-3.5 h-3.5 text-indigo-400" />;
      case 'website':
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-400" />;
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5 text-blue-400" />;
      case 'google_business':
        return <MapPin className="w-3.5 h-3.5 text-emerald-400" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr.toLowerCase()) {
      case 'verified':
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
            <Check className="w-2.5 h-2.5" />
            Verified
          </span>
        );
      case 'invalid':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-semibold">
            <XCircle className="w-2.5 h-2.5" />
            Invalid
          </span>
        );
      case 'unreachable':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
            <AlertTriangle className="w-2.5 h-2.5" />
            Unreachable
          </span>
        );
      case 'unverified':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">
            <HelpCircle className="w-2.5 h-2.5" />
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <ValidationBadge
                status={lead.validationStatus || 'POTENTIAL'}
                confidence={lead.validationConfidence}
                isDemo={lead.isDemo}
                size="md"
              />
              <OpportunityBadge score={lead.opportunityScore} tier={lead.scoreTier} size="md" />
              <LeadStatusPill
                status={status}
                onChange={(newStatus) => {
                  setStatus(newStatus);
                  onUpdate(lead.id, { status: newStatus });
                }}
              />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight pt-1 flex items-center gap-2">
              <span>{lead.businessName}</span>
              {lead.validationStatus === 'INVALID' && (
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs font-semibold">
                  Rejected Lead
                </span>
              )}
            </h2>
            <div className="text-xs text-slate-400">
              {lead.niche} • {lead.location}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenWebsiteDemo ? onOpenWebsiteDemo(lead) : null}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Generate Website Demo Prompt"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website Demo</span>
            </button>
            <button
              onClick={() => onOpenOutreach(lead)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Generate WhatsApp Outreach Pitch"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Pitch</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Sales Tools & Conversion Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sales Tools
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Turn Lead into Sales Opportunity
                </h3>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {(lead.demoGenerated || (lead.websiteDemoPrompts && lead.websiteDemoPrompts.length > 0)) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Demo Prompt Generated
                  </span>
                )}
                {(lead.outreachMessages && lead.outreachMessages.length > 0) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    Outreach Generated
                  </span>
                )}
              </div>
            </div>

            {/* Metrics: Opportunity Score, Validation Confidence, Website Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Opportunity Score
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-bold text-indigo-300">{lead.opportunityScore}/100</span>
                  <span className="text-xs text-indigo-400 font-semibold">{lead.scoreTier}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Validation Confidence
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-bold text-emerald-400">{lead.validationConfidence}%</span>
                  <span className="text-xs text-slate-400 font-semibold">{lead.validationStatus}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-400" /> Website Status
                </div>
                <div className="pt-0.5">
                  <WebsiteStatusBadge status={lead.websiteStatus} url={lead.websiteUrl} />
                </div>
              </div>
            </div>

            {/* Sales Actions Buttons: Desktop side-by-side, Mobile stacked */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenWebsiteDemo ? onOpenWebsiteDemo(lead) : null}
                className="p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-between gap-3 shadow-lg hover:shadow-blue-500/25 transition-all group border border-blue-400/30 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-tight">Generate Website Demo</div>
                    <div className="text-[11px] text-blue-100/80">Tailored Lovable prompt for {lead.niche}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-white/15 group-hover:bg-white/25 transition-colors shrink-0">
                  Prompt →
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenOutreach(lead)}
                className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-between gap-3 shadow-lg hover:shadow-emerald-500/25 transition-all group border border-emerald-400/30 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-tight">Generate WhatsApp Message</div>
                    <div className="text-[11px] text-emerald-100/80">Personalized outreach conversation</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-white/15 group-hover:bg-white/25 transition-colors shrink-0">
                  Pitch →
                </span>
              </button>
            </div>
          </div>
          {/* Dual Metric Header: Validation Confidence vs Opportunity Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Validation Confidence Metric */}
            <div className={`p-4 rounded-xl border ${
              lead.validationStatus === 'VERIFIED'
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : lead.validationStatus === 'INVALID'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-amber-950/20 border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  {lead.validationStatus === 'VERIFIED' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : lead.validationStatus === 'INVALID' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                  )}
                  Validation Confidence
                </span>
                <span className={`text-lg font-bold font-mono ${
                  lead.validationStatus === 'VERIFIED'
                    ? 'text-emerald-400'
                    : lead.validationStatus === 'INVALID'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                }`}>
                  {lead.validationConfidence}/100
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lead.validationStatus === 'VERIFIED'
                  ? 'High confidence: external profiles and business signals are verified real entities.'
                  : lead.validationStatus === 'INVALID'
                    ? 'Lead rejected: signals failed verification or contact details appear fabricated.'
                    : 'Plausible business but contact signals cannot be fully confirmed.'}
              </p>
            </div>

            {/* Opportunity Score Metric */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Opportunity Score
                </span>
                <span className="text-lg font-bold font-mono text-indigo-300">
                  {lead.opportunityScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lead.scoreReason || `${lead.scoreTier} opportunity based on web presence and contact availability.`}
              </p>
            </div>
          </div>

          {/* Evidence System: Why the system trusts (or rejects) the lead */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Evidence & Verification Signals
            </h3>
            {evidenceList.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No structured evidence recorded for this lead.</p>
            ) : (
              <div className="space-y-2">
                {evidenceList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="mt-0.5 shrink-0">{getEvidenceIcon(item.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-200 font-medium">{item.description}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                          Source: {item.source}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">{getStatusBadge(item.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Google Maps Physical Presence Card */}
          {(lead.googlePlaceId || lead.address || lead.googleMapsUrl || lead.rating) && (
            <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Google Maps Physical Presence
                </h3>
                {lead.googleMapsUrl && (
                  <a
                    href={lead.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 hover:underline"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {lead.address && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Physical Address:</span>
                    <span className="text-slate-200 font-medium">{lead.address}</span>
                  </div>
                )}

                {lead.rating ? (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Google Rating & Reviews:</span>
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{lead.rating.toFixed(1)}</span>
                      {lead.reviewsCount && (
                        <span className="text-slate-400 font-normal">({lead.reviewsCount} customer reviews)</span>
                      )}
                    </div>
                  </div>
                ) : null}

                {lead.googlePlaceId && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Google Place ID:</span>
                    <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded text-[11px] font-mono select-all">
                      {lead.googlePlaceId}
                    </code>
                  </div>
                )}

                {lead.googleCid && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Google CID:</span>
                    <code className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded text-[11px] font-mono select-all">
                      {lead.googleCid}
                    </code>
                  </div>
                )}

                {lead.latitude && lead.longitude ? (
                  <div>
                    <span className="text-slate-400 block mb-0.5">GPS Coordinates:</span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      {lead.latitude.toFixed(5)}, {lead.longitude.toFixed(5)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Core Info Grid with Verification State for Every Field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contact Information
              </h3>
              <div className="space-y-3 text-xs">
                {/* Phone */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone:
                  </span>
                  <div className="flex items-center gap-2">
                    {lead.phone ? (
                      <>
                        <a href={`tel:${lead.phone}`} className="text-emerald-400 font-semibold hover:underline">
                          {lead.phone}
                        </a>
                        {phoneVerification?.status === 'verified' ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-medium">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            ? Unverified
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-600">Not detected</span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> Email:
                  </span>
                  <div className="flex items-center gap-2">
                    {lead.email ? (
                      <>
                        <a href={`mailto:${lead.email}`} className="text-blue-400 font-semibold hover:underline max-w-[170px] truncate">
                          {lead.email}
                        </a>
                        {emailVerification?.status === 'verified' ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-medium">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            ? Unverified
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-600">Not detected</span>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" /> Website:
                  </span>
                  <WebsiteStatusBadge status={lead.websiteStatus} url={lead.websiteUrl} />
                </div>
              </div>
            </div>

            {/* Online Footprint & Socials with Verification State */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Online Footprint & Socials
              </h3>
              <div className="space-y-3 text-xs">
                {/* Instagram */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram:
                  </span>
                  <div className="flex items-center gap-2">
                    {lead.instagram ? (
                      <>
                        <a
                          href={lead.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="text-pink-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>Open Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {igVerification?.status === 'valid' ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Unverified
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-600">None</span>
                    )}
                  </div>
                </div>

                {/* Facebook */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-blue-400" /> Facebook:
                  </span>
                  <div className="flex items-center gap-2">
                    {lead.facebook ? (
                      <>
                        <a
                          href={lead.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>Open Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {fbVerification?.status === 'valid' ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Unverified
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-600">None</span>
                    )}
                  </div>
                </div>

                {/* Google Business */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Google Maps:
                  </span>
                  <div>
                    {lead.googleBusinessUrl ? (
                      <a
                        href={lead.googleBusinessUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>View Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600">Not listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Discovery & Traceability Metadata */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              Search Traceability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Search Query Used:</span>
                <code className="text-emerald-400 bg-slate-900 px-2 py-1 rounded block font-mono text-[11px] truncate">
                  {lead.searchQuery || 'Direct operator discovery'}
                </code>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Search Provider:</span>
                <div className="flex items-center gap-2">
                  <code className="text-slate-300 bg-slate-900 px-2 py-1 rounded font-mono text-[11px] flex items-center gap-1">
                    <Database className="w-3 h-3 text-slate-500" />
                    {lead.searchProvider || 'MockSearchProvider'}
                  </code>
                  {lead.isDemo && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-medium">
                      Demo Mode
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Source URL:</span>
                {lead.sourceUrl ? (
                  <a
                    href={lead.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1 truncate text-[11px]"
                  >
                    <span className="truncate">{lead.sourceUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-600">Direct snippet</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Date Discovered:</span>
                <div className="text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(lead.discoveredAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Internal CRM Log */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Notes & Outreach Log
              </label>
              {isSaved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent IG DM on Tuesday, owner interested in landing page demo with online booking link..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
