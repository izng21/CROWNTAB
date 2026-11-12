import React, { useState } from 'react';
import { usePageant } from '../../context/PageantContext';
import { 
  Lock, 
  Unlock, 
  Settings2, 
  CheckCircle2, 
  Clock, 
  Download, 
  Printer, 
  Users, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { RankingSystem, CompetitionPhase } from '../../types/pageant';
import { exportTabulationCSV } from '../../utils/exportUtils';
import { sounds } from '../../utils/soundEffects';

export const OrganizerDashboard: React.FC = () => {
  const {
    eventConfig,
    contestants,
    segments,
    scores,
    judges,
    activeSegment,
    setActiveSegment,
    toggleSegmentLock,
    setRankingSystem,
    advanceCompetitionPhase,
    tabulationRankings,
    setActiveView
  } = usePageant();

  const [selectedSegmentId, setSelectedSegmentId] = useState(activeSegment.id);
  const currentViewSegment = segments.find((s) => s.id === selectedSegmentId) || activeSegment;

  // Calculate judge completion status for this segment
  const applicableContestants = contestants.filter((c) => {
    if (currentViewSegment.phase === 'top5') return c.status === 'finalist';
    return true;
  });

  const judgeProgress = judges.map((j) => {
    const judgeScores = scores.filter(
      (s) => s.judgeId === j.id && s.segmentId === currentViewSegment.id && s.status !== 'draft'
    );
    const completedCount = judgeScores.length;
    const totalRequired = applicableContestants.length;
    const isFinished = completedCount >= totalRequired && totalRequired > 0;
    return {
      judge: j,
      completedCount,
      totalRequired,
      isFinished,
      percentage: totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0
    };
  });

  const allJudgesFinished = judgeProgress.every((jp) => jp.isFinished);

  const handleExportCSV = () => {
    sounds.playTap();
    exportTabulationCSV(eventConfig, contestants, segments, judges, tabulationRankings);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Event Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <span>{eventConfig.sanctioningBody}</span>
            <span aria-hidden="true">·</span>
            <span>Live Tabulation Center</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide">
            {eventConfig.eventName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {eventConfig.edition} · {eventConfig.venue} · {eventConfig.date}
          </p>
        </div>

        {/* Global Control CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveView('judge_pad')}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-2 border border-amber-500/30 transition-colors"
          >
            <span>Open Judge Tablet View</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setActiveView('reports')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Certificates & Print
          </button>
          <button
            type="button"
            onClick={() => setActiveView('emcee_stage')}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
          >
            Stage Teleprompter
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Control Panel Strip: Segment, Lock, Algorithm, Phase */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Active Segment & Lock Toggle */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Competition Segment
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedSegmentId}
              onChange={(e) => {
                setSelectedSegmentId(e.target.value);
                setActiveSegment(e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.weight}%) {s.isLocked ? '🔒' : '✓'}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => toggleSegmentLock(currentViewSegment.id)}
              title={currentViewSegment.isLocked ? 'Unlock segment for scoring' : 'Lock segment scores'}
              className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                currentViewSegment.isLocked
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {currentViewSegment.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 2. Ranking Algorithm Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Tabulation Algorithm
          </label>
          <select
            value={eventConfig.rankingSystem}
            onChange={(e) => setRankingSystem(e.target.value as RankingSystem)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="weighted_average">Weighted Average (Standard)</option>
            <option value="olympic_drop_high_low">Olympic System (Drop High & Low)</option>
            <option value="rank_points">Olympic Ordinal Rank Points</option>
            <option value="raw_total">Raw Sum of Points</option>
          </select>
        </div>

        {/* 3. Phase Advancement */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Competition Phase Cut
          </label>
          <select
            value={eventConfig.currentPhase}
            onChange={(e) => advanceCompetitionPhase(e.target.value as CompetitionPhase)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="preliminaries">Preliminaries (All 8 Candidates)</option>
            <option value="top10">Semi-Finals Cut</option>
            <option value="top5">Top 5 Finalists Cut</option>
            <option value="final_coronation">Coronation & Final Announcement</option>
          </select>
        </div>

        {/* 4. Auditor Certification Status */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Scrutineer Certification
          </label>
          <div className="flex items-center gap-2 h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            {eventConfig.auditorCertified ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auditor Certified & Sealed</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Live Audit in Progress</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Judge Progress Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base text-slate-100">
              Live Judge Submission Status · {currentViewSegment.name}
            </h3>
            <p className="text-xs text-slate-400">
              {allJudgesFinished
                ? 'All 5 judges have submitted certified ballots for this round.'
                : 'Waiting for remaining judge ballots before locking segment.'}
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300">
            {applicableContestants.length} Candidates Required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {judgeProgress.map(({ judge, completedCount, totalRequired, isFinished, percentage }) => (
            <div
              key={judge.id}
              className={`p-3.5 rounded-xl border space-y-2.5 ${
                isFinished
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : completedCount > 0
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-950/50 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-400 font-mono">
                    Judge #{judge.judgeNumber}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate">{judge.name}</div>
                </div>
                {isFinished ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Ballots: {completedCount}/{totalRequired}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFinished ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Density Tabulation Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg text-slate-100">
              Detailed Tabulation Matrix · {currentViewSegment.name}
            </h3>
            <p className="text-xs text-slate-400">
              System: <span className="font-medium text-amber-400 capitalize">{eventConfig.rankingSystem.replace(/_/g, ' ')}</span>
              {eventConfig.rankingSystem === 'olympic_drop_high_low' && (
                <span className="ml-2 text-slate-400">(Highest & lowest scores discarded to eliminate bias)</span>
              )}
            </p>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Submitted</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block ml-2" />
            <span>Pending</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">No.</th>
                <th className="px-4 py-3 font-semibold">Candidate</th>
                <th className="px-4 py-3 font-semibold">Representing</th>
                {judges.map((j) => (
                  <th key={j.id} className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                    J{j.judgeNumber} <span className="text-[10px] text-slate-400 lowercase font-sans">({j.name.split(' ')[0]})</span>
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-bold text-amber-400">Round Avg</th>
                <th className="px-4 py-3 text-right font-bold text-slate-200">Overall Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {tabulationRankings.map((row) => {
                const segInfo = row.segmentScores[currentViewSegment.id];
                const scoresList = judges
                  .map((j) => segInfo?.judgeScores[j.id])
                  .filter((v): v is number => typeof v === 'number');

                // Determine min & max for olympic highlight
                let minVal = -1;
                let maxVal = -1;
                if (eventConfig.rankingSystem === 'olympic_drop_high_low' && scoresList.length >= 4) {
                  minVal = Math.min(...scoresList);
                  maxVal = Math.max(...scoresList);
                }

                return (
                  <tr
                    key={row.contestant.id}
                    className="hover:bg-slate-850/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${
                          row.currentRank === 1
                            ? 'bg-amber-400 text-slate-950 font-extrabold'
                            : row.currentRank <= 3
                            ? 'bg-slate-800 text-amber-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {row.currentRank}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400 text-sm">
                      #{row.contestant.number}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {row.contestant.photoUrl ? (
                          <img
                            src={row.contestant.photoUrl}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                        ) : null}
                        <span>{row.contestant.name}</span>
                        {row.isTied && (
                          <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800 px-1.5 py-0.2 rounded font-mono">
                            TIED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {row.contestant.representing}
                    </td>

                    {/* Judge Individual Columns */}
                    {judges.map((j) => {
                      const val = segInfo?.judgeScores[j.id];
                      const isMin = val === minVal && minVal !== -1;
                      const isMax = val === maxVal && maxVal !== -1;
                      const isDropped = (isMin || isMax) && eventConfig.rankingSystem === 'olympic_drop_high_low';

                      return (
                        <td key={j.id} className="px-3 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                          {typeof val === 'number' ? (
                            <span
                              className={`${
                                isDropped
                                  ? 'line-through text-slate-600'
                                  : 'text-slate-200 font-medium'
                              }`}
                              title={isDropped ? 'Dropped Olympic High/Low' : undefined}
                            >
                              {val.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-600 font-mono">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Round Tabulated Average */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-400 text-sm tabular-nums">
                      {segInfo ? segInfo.effectiveScore.toFixed(2) : '0.00'}
                    </td>

                    {/* Overall Cumulative Score */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-100 text-sm tabular-nums">
                      {row.totalWeightedScore.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
