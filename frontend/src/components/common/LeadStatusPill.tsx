import React from 'react';
import { LeadStatus } from '../../types';

interface Props {
  status: LeadStatus;
  onChange?: (newStatus: LeadStatus) => void;
  disabled?: boolean;
}

const statusConfig: Record<LeadStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  New: { label: 'New', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  Contacted: { label: 'Contacted', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  Interested: { label: 'Interested', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'Not Interested': { label: 'Not Interested', bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', dot: 'bg-slate-500' },
  Client: { label: 'Client Won 🏆', bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40', dot: 'bg-amber-400' },
  Closed: { label: 'Closed', bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', dot: 'bg-slate-600' }
};

export const LeadStatusPill: React.FC<Props> = ({ status, onChange, disabled }) => {
  const current = statusConfig[status] || statusConfig.New;

  if (!onChange) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        {current.label}
      </span>
    );
  }

  return (
    <select
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      className={`text-xs font-medium rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${current.bg} ${current.text} ${current.border}`}
    >
      <option value="New">New</option>
      <option value="Contacted">Contacted</option>
      <option value="Interested">Interested</option>
      <option value="Not Interested">Not Interested</option>
      <option value="Client">Client Won</option>
      <option value="Closed">Closed</option>
    </select>
  );
};
