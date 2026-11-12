import React from 'react';
import { PageantProvider, usePageant } from './context/PageantContext';
import { HeaderNav } from './components/common/HeaderNav';
import { OfflineSyncBanner } from './components/common/OfflineSyncBanner';
import { JudgePortal } from './components/judge/JudgePortal';
import { OrganizerDashboard } from './components/organizer/OrganizerDashboard';
import { RankingsTable } from './components/organizer/RankingsTable';
import { AuditorAuditTrail } from './components/auditor/AuditorAuditTrail';
import { EmceeTeleprompter } from './components/emcee/EmceeTeleprompter';
import { PrintableTabulationReport } from './components/reports/PrintableTabulationReport';

const MainAppContent: React.FC = () => {
  const { activeView, eventConfig, currentUser } = usePageant();

  // If currentUser is a Judge, isolate views: they only have access to JudgePortal and RankingsTable
  const effectiveView = currentUser.role === 'judge' && !['judge_pad', 'rankings'].includes(activeView)
    ? 'judge_pad'
    : activeView;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      <HeaderNav />
      <OfflineSyncBanner />

      <main className="flex-1 w-full">
        {effectiveView === 'judge_pad' && <JudgePortal />}
        {effectiveView === 'organizer_dashboard' && <OrganizerDashboard />}
        {effectiveView === 'rankings' && <RankingsTable />}
        {effectiveView === 'audit_trail' && <AuditorAuditTrail />}
        {effectiveView === 'emcee_stage' && <EmceeTeleprompter />}
        {effectiveView === 'reports' && <PrintableTabulationReport />}
      </main>

      {/* Quiet, clean footer */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950 text-xs text-slate-400 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-300">CrownTab</span>
            <span aria-hidden="true">·</span>
            <span>{eventConfig.sanctioningBody}</span>
            <span aria-hidden="true">·</span>
            <span>{eventConfig.edition}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Offline-Resilient Real-Time Tabulation</span>
            <span aria-hidden="true">·</span>
            <span>Audited & Certified by Board of Scrutineers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <PageantProvider>
      <MainAppContent />
    </PageantProvider>
  );
}
