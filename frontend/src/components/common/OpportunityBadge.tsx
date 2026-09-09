import React from 'react';
import { OpportunityTier } from '../../types';
import { Sparkles, Flame, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  score: number;
  tier: OpportunityTier;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OpportunityBadge: React.FC<Props> = ({ score, tier, showScore = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size];

  switch (tier) {
    case 'Very High':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-glowEmerald ${sizeClasses}`}>
          <Flame className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{tier}</span>
          {showScore && <span className="ml-0.5 font-bold text-emerald-300">({score})</span>}
        </span>
      );
    case 'High':
      return (
        <span className={`inline-flex items-center rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 ${sizeClasses}`}>
          <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{tier}</span>
          {showScore && <span className="ml-0.5 font-bold text-indigo-200">({score})</span>}
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 ${sizeClasses}`}>
          <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{tier}</span>
          {showScore && <span className="ml-0.5 font-bold text-amber-200">({score})</span>}
        </span>
      );
    case 'Low':
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 ${sizeClasses}`}>
          <CheckCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{tier}</span>
          {showScore && <span className="ml-0.5 font-medium text-slate-400">({score})</span>}
        </span>
      );
  }
};
