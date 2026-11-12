import React, { useState } from 'react';
import { usePageant } from '../../context/PageantContext';
import { 
  ShieldCheck, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  AlertOctagon, 
  Clock, 
  Key, 
  Edit2,
  Lock
} from 'lucide-react';
import { DigitalSignatureModal } from '../modals/DigitalSignatureModal';
import { sounds } from '../../utils/soundEffects';

export const AuditorAuditTrail: React.FC = () => {
  const {
    currentUser,
    auditLogs,
    eventConfig,
    certifyAuditorResults,
    overrideScoreByAuditor,
    scores,
    contestants,
    segments,
    judges
  } = usePageant();

  const isAuditor = currentUser.role === 'auditor' || currentUser.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [isCertifyModalOpen, setIsCertifyModalOpen] = useState(false);

  // Score override tool state
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedScoreId, setSelectedScoreId] = useState<string>('');
  const [overrideScoreVal, setOverrideScoreVal] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideFeedback, setOverrideFeedback] = useState<string | null>(null);

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const handleCertify = (signatureData: string) => {
    setIsCertifyModalOpen(false);
    certifyAuditorResults(currentUser.name, signatureData);
  };

  const handleOpenOverride = () => {
    if (scores.length > 0) {
      setSelectedScoreId(scores[0].id);
      setOverrideScoreVal(scores[0].totalScore.toString());
      setOverrideReason('');
      setIsOverrideModalOpen(true);
    }
  };

  const handleConfirmOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(overrideScoreVal);
    if (isNaN(val) || val < 0 || val > 100) {
      alert('Please enter a valid numeric score between 0 and 100.');
      return;
    }
    if (!overrideReason.trim()) {
      alert('A formal justification reason is strictly required for auditor score overrides.');
      return;
    }

    overrideScoreByAuditor(selectedScoreId, val, overrideReason.trim());
    setIsOverrideModalOpen(false);
    setOverrideFeedback('Auditor score override logged with tamper-evident audit trail hash!');
    setTimeout(() => setOverrideFeedback(null), 4000);
  };

  const handleExportAuditJson = () => {
    sounds.playTap();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `crowntab_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
              <span>Independent Board of Scrutineers</span>
              <span aria-hidden="true">·</span>
              <span>Audit & Assurance</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-100 tracking-wide">
              Certified Audit Trail & Verification
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tamper-evident chronological log of all judge ballots, segment locks, overrides, and digital signatures.
            </p>
          </div>
        </div>

        {/* Auditor Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {eventConfig.auditorCertified ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Certified & Sealed ({new Date(eventConfig.auditorCertifiedAt || '').toLocaleTimeString()})</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCertifyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Certify Official Results
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenOverride}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Auditor Override Tool
          </button>

          <button
            type="button"
            onClick={handleExportAuditJson}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Log
          </button>
        </div>
      </div>

      {overrideFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{overrideFeedback}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, user, or hash..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Audit Actions</option>
            <option value="SCORE_SUBMITTED">Score Submissions</option>
            <option value="AUDITOR_OVERRIDE">Auditor Overrides</option>
            <option value="AUDITOR_CERTIFIED">Auditor Certifications</option>
            <option value="SEGMENT_LOCKED">Segment Locks</option>
            <option value="PHASE_ADVANCED">Phase Cuts</option>
            <option value="OFFLINE_SYNC_EXECUTED">Offline Syncs</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-base text-slate-100">
            Log Entries ({filteredLogs.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">Cryptographically Chained</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Operator</th>
                <th className="px-4 py-3 font-semibold">Details</th>
                <th className="px-4 py-3 text-right font-semibold">Audit Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredLogs.map((log) => {
                const isOverride = log.action === 'AUDITOR_OVERRIDE';
                const isCertified = log.action === 'AUDITOR_CERTIFIED';
                const isLock = log.action === 'SEGMENT_LOCKED';

                return (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                      <span className="text-[10px] text-slate-600 ml-1">
                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          isOverride
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : isCertified
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : isLock
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-200">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.userRole}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-md">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-400 tabular-nums">
                      {log.hash}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auditor Certification Modal */}
      <DigitalSignatureModal
        isOpen={isCertifyModalOpen}
        onClose={() => setIsCertifyModalOpen(false)}
        onConfirm={handleCertify}
        title="Official Scrutineer Final Tabulation Certification"
        subtitle={`${eventConfig.eventName} · Certified Final Results`}
        signeeName={currentUser.name}
        signeeRole="Lead Certified Public Accountant & Scrutineer"
      />

      {/* Score Override Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-slate-100">Auditor Score Override</h3>
                <p className="text-xs text-slate-400">Dispute resolution and technical error correction</p>
              </div>
            </div>

            <form onSubmit={handleConfirmOverride} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Select Ballot to Adjust
                </label>
                <select
                  value={selectedScoreId}
                  onChange={(e) => {
                    setSelectedScoreId(e.target.value);
                    const found = scores.find((s) => s.id === e.target.value);
                    if (found) setOverrideScoreVal(found.totalScore.toString());
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {scores.map((s) => {
                    const c = contestants.find((co) => co.id === s.contestantId);
                    const seg = segments.find((se) => se.id === s.segmentId);
                    return (
                      <option key={s.id} value={s.id}>
                        #{c?.number} {c?.name} · {seg?.name} (J{s.judgeNumber}: {s.totalScore.toFixed(1)} pts)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Adjusted Score (0.0 to 100.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={overrideScoreVal}
                  onChange={(e) => setOverrideScoreVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Mandatory Auditor Justification & Audit Note
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Typographical error corrected upon physical ballot verification with Judge 2."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-semibold"
                >
                  Confirm & Commit Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
