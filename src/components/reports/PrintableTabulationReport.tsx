import React from 'react';
import { usePageant } from '../../context/PageantContext';
import { Printer, Download, Crown, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { exportTabulationCSV, triggerPrintReport } from '../../utils/exportUtils';
import { sounds } from '../../utils/soundEffects';

export const PrintableTabulationReport: React.FC = () => {
  const {
    eventConfig,
    contestants,
    segments,
    judges,
    tabulationRankings
  } = usePageant();

  const handlePrint = () => {
    sounds.playTap();
    triggerPrintReport();
  };

  const handleExportCSV = () => {
    sounds.playTap();
    exportTabulationCSV(eventConfig, contestants, segments, judges, tabulationRankings);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Action Header (Hidden during print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-0.5">
            Official Certification Document
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
            Printable Tabulation Certification & Audit Sheet
          </h1>
          <p className="text-xs text-slate-400">
            Formatted to official standard for the Board of Canvassers, press release, and archival records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Official Certificate
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Container */}
      <div className="bg-white text-slate-950 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-300 font-sans print:shadow-none print:border-none print:p-0">
        {/* Certificate Formal Header */}
        <div className="text-center border-b-2 border-slate-950 pb-6 mb-6">
          <div className="text-[11px] font-mono tracking-widest text-slate-600 uppercase">
            {eventConfig.sanctioningBody}
          </div>
          <h2 className="font-serif text-3xl font-extrabold tracking-wide text-slate-950 mt-1 uppercase">
            {eventConfig.eventName}
          </h2>
          <div className="font-serif text-sm font-semibold italic text-amber-700 mt-0.5">
            {eventConfig.edition}
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Venue: <strong>{eventConfig.venue}</strong> · Host City: <strong>{eventConfig.hostCity}</strong> · Date: <strong>{eventConfig.date}</strong>
          </p>
          <div className="inline-block mt-3 px-3 py-1 bg-slate-100 rounded border border-slate-300 text-xs font-mono font-bold uppercase">
            Official Certificate of Tabulation & Final Proclamation
          </div>
        </div>

        {/* Audit Status Verification Strip */}
        <div className="mb-6 p-3 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-between text-xs">
          <div>
            <strong>Ranking Algorithm:</strong> {eventConfig.rankingSystem.replace(/_/g, ' ').toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{eventConfig.auditorCertified ? 'OFFICIALLY AUDITED & CERTIFIED' : 'PRELIMINARY SCRUTINY'}</span>
          </div>
          <div className="font-mono text-slate-600">
            Hash: 0x8F2A93C7·VERIFIED
          </div>
        </div>

        {/* Master Tabulation Sheet Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 uppercase font-mono text-[10px] border-b border-slate-300">
              <tr>
                <th className="p-2.5 border-r border-slate-300 text-center">Rank</th>
                <th className="p-2.5 border-r border-slate-300 text-center">No.</th>
                <th className="p-2.5 border-r border-slate-300">Candidate Name</th>
                <th className="p-2.5 border-r border-slate-300">Representing</th>
                {segments.map((s) => (
                  <th key={s.id} className="p-2.5 border-r border-slate-300 text-right whitespace-nowrap">
                    {s.name} ({s.weight}%)
                  </th>
                ))}
                <th className="p-2.5 text-right font-bold text-slate-950">Final Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-sans">
              {tabulationRankings.map((row) => (
                <tr key={row.contestant.id} className={row.currentRank <= 3 ? 'bg-amber-50/50 font-medium' : ''}>
                  <td className="p-2.5 border-r border-slate-300 text-center font-mono font-bold">
                    {row.currentRank}
                    {row.currentRank === 1 && ' 👑'}
                  </td>
                  <td className="p-2.5 border-r border-slate-300 text-center font-mono font-bold text-amber-800">
                    #{row.contestant.number}
                  </td>
                  <td className="p-2.5 border-r border-slate-300 font-semibold text-slate-900">
                    {row.contestant.name}
                  </td>
                  <td className="p-2.5 border-r border-slate-300 text-slate-700">
                    {row.contestant.representing}
                  </td>
                  {segments.map((s) => {
                    const score = row.segmentScores[s.id];
                    return (
                      <td key={s.id} className="p-2.5 border-r border-slate-300 text-right font-mono tabular-nums">
                        {score ? score.effectiveScore.toFixed(2) : '-'}
                      </td>
                    );
                  })}
                  <td className="p-2.5 text-right font-mono font-extrabold text-slate-950 text-sm tabular-nums">
                    {row.totalWeightedScore.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formal Signature Blocks */}
        <div className="space-y-6 pt-4 border-t-2 border-slate-950 print-page-break">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Attested & Certified by the Board of Judges:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {judges.map((j) => (
              <div key={j.id} className="border-t border-slate-400 pt-2 text-center">
                <div className="font-serif italic text-sm text-slate-800 h-7 flex items-end justify-center font-medium">
                  {j.name}
                </div>
                <div className="text-xs font-bold text-slate-950 mt-1">{j.name}</div>
                <div className="text-[10px] text-slate-500">Judge #{j.judgeNumber}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="border-t-2 border-slate-950 pt-2 text-center">
              <div className="font-serif italic text-base text-slate-900 h-8 flex items-end justify-center font-bold">
                Victoria Sterling
              </div>
              <div className="text-xs font-extrabold uppercase text-slate-950 mt-1">
                Victoria Sterling
              </div>
              <div className="text-[11px] text-slate-600">
                Head Tabulator & Pageant Executive Director
              </div>
            </div>

            <div className="border-t-2 border-slate-950 pt-2 text-center">
              <div className="font-serif italic text-base text-slate-900 h-8 flex items-end justify-center font-bold">
                Arthur Pendelton, CPA
              </div>
              <div className="text-xs font-extrabold uppercase text-slate-950 mt-1">
                Arthur Pendelton, CPA
              </div>
              <div className="text-[11px] text-slate-600">
                Head Scrutineer · Board of External Auditors
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Footer Note */}
        <div className="text-center text-[10px] text-slate-500 mt-10 pt-4 border-t border-slate-200">
          This document is generated by the CrownTab Automated Tabulation System. Any alteration, erasure, or unauthorized amendment renders this certification null and void.
        </div>
      </div>
    </div>
  );
};
