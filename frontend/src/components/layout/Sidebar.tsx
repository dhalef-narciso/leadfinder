import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  Bookmark, 
  Tags, 
  Settings, 
  Target, 
  Radio
} from 'lucide-react';

export type NavItem = 'dashboard' | 'find-leads' | 'leads' | 'saved-searches' | 'niches' | 'settings';

interface Props {
  activeItem: NavItem;
  onSelect: (item: NavItem) => void;
  newLeadsCount?: number;
}

export const Sidebar: React.FC<Props> = ({ activeItem, onSelect, newLeadsCount = 0 }) => {
  const menuItems: Array<{ id: NavItem; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'find-leads', label: 'Find Leads', icon: <Search className="w-4 h-4" /> },
    { id: 'leads', label: 'Leads', icon: <Users className="w-4 h-4" />, badge: newLeadsCount },
    { id: 'saved-searches', label: 'Saved Searches', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'niches', label: 'Niches', icon: <Tags className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen shrink-0 sticky top-0">
      <div>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-glow text-white font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              LeadFinder
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <div className="text-xs text-slate-400">Prospecting Engine</div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 m-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Search Engine Active</span>
        </div>
        <div className="text-slate-400 text-[11px] leading-relaxed">
          Modular SearchProvider ready for SerpAPI & Google Programmable Search.
        </div>
      </div>
    </aside>
  );
};
