import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { FindLeadsView } from './components/find-leads/FindLeadsView';
import { LeadsView } from './components/leads/LeadsView';
import { SavedSearchesView } from './components/saved-searches/SavedSearchesView';
import { NichesView } from './components/niches/NichesView';
import { SettingsView } from './components/settings/SettingsView';
import { LeadDetailModal } from './components/leads/LeadDetailModal';
import { WebsiteDemoModal } from './components/leads/WebsiteDemoModal';
import { OutreachModal } from './components/outreach/OutreachModal';
import { apiService } from './services/api';
import { Lead, Niche, SavedSearch, DashboardStats, LeadStatus } from './types';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<NavItem>('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Active Modals
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [selectedLeadForOutreach, setSelectedLeadForOutreach] = useState<Lead | null>(null);
  const [selectedLeadForWebsiteDemo, setSelectedLeadForWebsiteDemo] = useState<Lead | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [statsData, leadsData, nichesData, searchesData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getLeads(),
        apiService.getNiches(),
        apiService.getSavedSearches()
      ]);

      setDashboardStats(statsData);
      setLeads(leadsData);
      setNiches(nichesData);
      setSavedSearches(searchesData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setApiError('Não foi possível conectar ao servidor backend. Certifique-se de que o backend está rodando e acessível na URL configurada.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: LeadStatus) => {
    try {
      const updated = await apiService.updateLead(id, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      if (selectedLeadForDetail?.id === id) {
        setSelectedLeadForDetail(updated);
      }
      showToast(`Lead status updated to "${newStatus}"`);
      // Refresh dashboard stats
      apiService.getDashboardStats().then(setDashboardStats);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleUpdateNotes = async (id: string, updates: { status?: LeadStatus; notes?: string }) => {
    try {
      const updated = await apiService.updateLead(id, updates);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setSelectedLeadForDetail(updated);
      showToast('Lead details saved');
      apiService.getDashboardStats().then(setDashboardStats);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await apiService.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLeadForDetail?.id === id) {
        setSelectedLeadForDetail(null);
      }
      showToast('Lead removed.');
      apiService.getDashboardStats().then(setDashboardStats);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleClearAllLeads = async () => {
    if (!confirm(`Are you sure you want to delete all ${leads.length} discovered leads? This action cannot be undone.`)) return;
    try {
      await apiService.clearAllLeads();
      setLeads([]);
      setSelectedLeadForDetail(null);
      setSelectedLeadForOutreach(null);
      showToast('All leads cleared successfully.');
      apiService.getDashboardStats().then(setDashboardStats);
    } catch (err: any) {
      alert(`Clear failed: ${err.message}`);
    }
  };

  const handleSearchComplete = (newLeads: Lead[], _searchId: string) => {
    showToast(`Search complete! Found ${newLeads.length} leads.`);
    loadAllData();
    setActiveView('leads');
  };

  const newLeadsCount = leads.filter((l) => l.status === 'New').length;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeView}
        onSelect={setActiveView}
        newLeadsCount={newLeadsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen pb-16">
        {activeView === 'dashboard' && (
          <DashboardView
            stats={dashboardStats}
            loading={loading}
            error={apiError}
            onRetry={loadAllData}
            onNavigate={setActiveView}
            onSelectLead={setSelectedLeadForDetail}
            onOpenOutreach={setSelectedLeadForOutreach}
          />
        )}

        {activeView === 'find-leads' && (
          <FindLeadsView
            niches={niches}
            onSearchComplete={handleSearchComplete}
          />
        )}

        {activeView === 'leads' && (
          <LeadsView
            leads={leads}
            onUpdateStatus={handleUpdateStatus}
            onDeleteLead={handleDeleteLead}
            onClearAllLeads={handleClearAllLeads}
            onSelectLead={setSelectedLeadForDetail}
            onOpenOutreach={setSelectedLeadForOutreach}
          />
        )}

        {activeView === 'saved-searches' && (
          <SavedSearchesView
            searches={savedSearches}
            onRefresh={loadAllData}
            onSearchReRun={handleSearchComplete}
          />
        )}

        {activeView === 'niches' && (
          <NichesView
            niches={niches}
            onRefresh={loadAllData}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Lead Dossier Modal */}
      {selectedLeadForDetail && (
        <LeadDetailModal
          lead={selectedLeadForDetail}
          onClose={() => setSelectedLeadForDetail(null)}
          onUpdate={handleUpdateNotes}
          onOpenOutreach={(lead) => {
            setSelectedLeadForOutreach(lead);
          }}
          onOpenWebsiteDemo={(lead) => {
            setSelectedLeadForWebsiteDemo(lead);
          }}
        />
      )}

      {/* Website Demo Prompt Generator Modal */}
      {selectedLeadForWebsiteDemo && (
        <WebsiteDemoModal
          lead={selectedLeadForWebsiteDemo}
          onClose={() => setSelectedLeadForWebsiteDemo(null)}
          onPromptGenerated={(leadId) => {
            setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, demoGenerated: true } : l));
            if (selectedLeadForDetail?.id === leadId) {
              setSelectedLeadForDetail((prev) => prev ? { ...prev, demoGenerated: true } : prev);
            }
          }}
          onShowToast={showToast}
        />
      )}

      {/* WhatsApp Outreach Pitch Generator Modal */}
      {selectedLeadForOutreach && (
        <OutreachModal
          lead={selectedLeadForOutreach}
          onClose={() => setSelectedLeadForOutreach(null)}
          onMarkContacted={(id) => handleUpdateStatus(id, 'Contacted')}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-white text-xs font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
