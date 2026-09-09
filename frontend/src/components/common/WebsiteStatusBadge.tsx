import React from 'react';
import { WebsiteStatus } from '../../types';
import { Globe, GlobeLock, HelpCircle } from 'lucide-react';

interface Props {
  status: WebsiteStatus;
  url?: string | null;
}

export const WebsiteStatusBadge: React.FC<Props> = ({ status, url }) => {
  if (status === 'Website Not Found') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300">
        <GlobeLock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span>No Website Detected</span>
      </span>
    );
  }

  if (status === 'Website Found') {
    return (
      <a
        href={url || '#'}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => !url && e.preventDefault()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="truncate max-w-[120px]">{url ? url.replace(/^https?:\/\/(www\.)?/, '') : 'Website Found'}</span>
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300">
      <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Website Unclear</span>
    </span>
  );
};
