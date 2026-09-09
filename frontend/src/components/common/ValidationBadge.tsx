import React from 'react';
import { ValidationStatus } from '../../types';
import { ShieldCheck, HelpCircle, XCircle, Sparkles } from 'lucide-react';

interface Props {
  status: ValidationStatus;
  confidence?: number;
  isDemo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
}

export const ValidationBadge: React.FC<Props> = ({
  status,
  confidence,
  isDemo = false,
  size = 'md',
  showConfidence = true
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'VERIFIED':
        return {
          container: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          dot: 'bg-emerald-400',
          icon: <ShieldCheck className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />,
          label: 'VERIFIED'
        };
      case 'POTENTIAL':
        return {
          container: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400',
          icon: <HelpCircle className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />,
          label: 'POTENTIAL'
        };
      case 'INVALID':
      default:
        return {
          container: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          dot: 'bg-rose-400',
          icon: <XCircle className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />,
          label: 'INVALID'
        };
    }
  };

  const style = getBadgeStyle();
  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1.5 text-xs gap-2' 
    : size === 'sm' 
      ? 'px-2 py-0.5 text-[10px] gap-1' 
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <div
        className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border shadow-sm ${style.container} ${sizeClasses}`}
        title={`Validation Status: ${style.label}${confidence !== undefined ? ` (${confidence}% confidence)` : ''}`}
      >
        {style.icon}
        <span>{style.label}</span>
        {showConfidence && confidence !== undefined && (
          <span className="opacity-80 font-mono font-normal ml-0.5 text-[11px]">
            {confidence}%
          </span>
        )}
      </div>

      {isDemo && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-medium"
          title="Generated via Mock Search Provider with simulated demo values"
        >
          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
          <span>Demo Data</span>
        </span>
      )}
    </div>
  );
};
