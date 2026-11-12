import React, { useState, useMemo, useEffect } from 'react';
import { usePageant } from '../../context/PageantContext';
import { 
  CheckCircle, 
  Lock, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Trophy, 
  Send, 
  Minus, 
  Plus, 
  BookOpen, 
  Sparkles,
  Heart
} from 'lucide-react';
import { Contestant, Criterion } from '../../types/pageant';
import { DigitalSignatureModal } from '../modals/DigitalSignatureModal';
import { JudgeCandidateProfile } from './JudgeCandidateProfile';
import { sounds } from '../../utils/soundEffects';

export const JudgePortal: React.FC = () => {
  const {
    currentUser,
    contestants,
    segments,
    scores,
    activeSegment,
    setActiveSegment,
    submitJudgeScore,
    tabulationRankings,
    eventConfig
  } = usePageant();

  const judgeNumber = currentUser.judgeNumber || 1;

  // Internal judge view: 'scoring' | 'profile' | 'leaderboard'
  const [judgeView, setJudgeView] = useState<'scoring' | 'profile' | 'leaderboard'>('scoring');
  const [selectedContestantId, setSelectedContestantId] = useState<string>(contestants[0]?.id || '');
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  // Criteria scores: criterionId -> number
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState('');

  // Active Contestant
  const activeContestant = useMemo(
    () => contestants.find((c) => c.id === selectedContestantId) || contestants[0],
    [contestants, selectedContestantId]
  );

  // Existing score if any
  const existingScore = useMemo(() => {
    return scores.find(
      (s) =>
        s.contestantId === activeContestant?.id &&
        s.segmentId === activeSegment?.id &&
        s.judgeId === currentUser.id
    );
  }, [scores, activeContestant?.id, activeSegment?.id, currentUser.id]);

  useEffect(() => {
    if (existingScore) {
      setCriterionScores(existingScore.scores || {});
      setRemarks(existingScore.remarks || '');
    } else {
      const defaults: Record<string, number> = {};
      activeSegment.criteria.forEach((crit) => {
        defaults[crit.id] = 90;
      });
      setCriterionScores(defaults);
      setRemarks('');
    }
  }, [existingScore, activeContestant?.id, activeSegment?.id]);

  const handleScoreChange = (criterionId: string, val: number, crit: Criterion) => {
    sounds.playTap();
    const clamped = Math.max(crit.minScore, Math.min(crit.maxScore, Math.round(val * 10) / 10));
    setCriterionScores((prev) => ({
      ...prev,
      [criterionId]: clamped
    }));
  };

  const handleStep = (criterionId: string, delta: number, crit: Criterion) => {
    const current = criterionScores[criterionId] ?? 90;
    handleScoreChange(criterionId, current + delta, crit);
  };

  const calculatedTotal = useMemo(() => {
    let total = 0;
    activeSegment.criteria.forEach((c) => {
      const val = criterionScores[c.id] || 0;
      total += (val * c.weight) / 100;
    });
    return Math.round(total * 100) / 100;
  }, [activeSegment, criterionScores]);

  const isContestantScored = (cId: string) => {
    return scores.some(
      (s) =>
        s.contestantId === cId &&
        s.segmentId === activeSegment.id &&
        s.judgeId === currentUser.id &&
        s.status !== 'draft'
    );
  };

  const handleSelectContestant = (c: Contestant) => {
    sounds.playTap();
    setSelectedContestantId(c.id);
  };

  const handlePrevContestant = () => {
    const currentIndex = contestants.findIndex((c) => c.id === selectedContestantId);
    if (currentIndex > 0) {
      handleSelectContestant(contestants[currentIndex - 1]);
    }
  };

  const handleNextContestant = () => {
    const currentIndex = contestants.findIndex((c) => c.id === selectedContestantId);
    if (currentIndex < contestants.length - 1) {
      handleSelectContestant(contestants[currentIndex + 1]);
    }
  };

  const handleConfirmSignature = async (signatureData: string) => {
    setIsSigModalOpen(false);
    const result = await submitJudgeScore(
      {
        judgeId: currentUser.id,
        judgeName: currentUser.name,
        judgeNumber,
        contestantId: activeContestant.id,
        segmentId: activeSegment.id,
        scores: criterionScores,
        totalScore: calculatedTotal,
        remarks: remarks.trim()
      },
      signatureData
    );

    if (result.isOffline) {
      setSubmittedFeedback(`Ballot for Candidate #${activeContestant.number} saved in offline queue!`);
    } else {
      setSubmittedFeedback(`Ballot for Candidate #${activeContestant.number} (${activeContestant.name}) officially certified!`);
    }

    setTimeout(() => setSubmittedFeedback(null), 3500);

    const nextUnscored = contestants.find((c) => c.id !== activeContestant.id && !isContestantScored(c.id));
    if (nextUnscored) {
      setTimeout(() => setSelectedContestantId(nextUnscored.id), 1200);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Judge Page Top Bar & Sub-Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-0.5">
            <span>Official Board of Judges Portal</span>
            <span aria-hidden="true">·</span>
            <span>Judge #{judgeNumber}: {currentUser.name}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            {eventConfig.eventName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Segment: <strong className="text-slate-200">{activeSegment.name}</strong> ({activeSegment.weight}%)
            {activeSegment.isLocked && <span className="ml-2 text-rose-400 font-semibold">[Round Locked]</span>}
          </p>
        </div>

        {/* Isolated Judge Navigation Tabs: Only Scoring & Profile and Leaderboard! */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setJudgeView('scoring');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              judgeView === 'scoring'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Score Ballot</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setJudgeView('profile');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              judgeView === 'profile'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Candidate Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setJudgeView('leaderboard');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              judgeView === 'leaderboard'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Contestant Reel (Horizontal Scroll with instant tap targets) */}
      {judgeView !== 'leaderboard' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Contestants Reel ({contestants.length} Candidates)</span>
            <span>Tap to inspect & score</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {contestants.map((c) => {
              const isSelected = c.id === activeContestant?.id;
              const isScored = isContestantScored(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectContestant(c)}
                  className={`min-w-[130px] sm:min-w-[150px] p-2.5 rounded-xl border text-left transition-all shrink-0 flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : isScored
                      ? 'bg-slate-900 border-emerald-500/30 hover:border-slate-700'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 relative border border-slate-700/60">
                    {c.photoUrl ? (
                      <img
                        src={c.photoUrl}
                        alt={c.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-amber-400">
                        #{c.number}
                      </div>
                    )}
                    {isScored && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 p-0.5 rounded-bl">
                        <CheckCircle className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-amber-400 font-bold">#{c.number}</div>
                    <div className="text-xs font-semibold text-slate-100 truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{c.representing}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 1: CANDIDATE PROFILE & SCORING */}
      {judgeView === 'scoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Candidate Profile Column (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="relative aspect-square max-h-[360px] bg-slate-950 overflow-hidden flex items-center justify-center">
              {activeContestant?.photoUrl ? (
                <img
                  src={activeContestant.photoUrl}
                  alt={activeContestant.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 to-slate-950">
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-3xl font-serif font-bold mb-3">
                    #{activeContestant?.number}
                  </div>
                  <div className="font-serif text-lg font-semibold text-slate-200">{activeContestant?.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{activeContestant?.representing}</div>
                </div>
              )}
              <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-700/60 font-mono font-bold text-amber-400 text-sm">
                #{activeContestant?.number}
              </div>
              {existingScore && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-950/80 backdrop-blur-md rounded-lg border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Scored: {existingScore.totalScore.toFixed(2)} pts
                </div>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-100">{activeContestant?.name}</h2>
                  <div className="text-sm font-medium text-amber-400 mt-0.5">
                    Representing {activeContestant?.representing}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>Age: <span className="text-slate-200">{activeContestant?.age}</span></div>
                  <div>Height: <span className="text-slate-200">{activeContestant?.height}</span></div>
                </div>
              </div>

              {activeContestant?.specialAwards && activeContestant.specialAwards.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Awards: {activeContestant.specialAwards.join(' · ')}</span>
                </div>
              )}

              {/* Advocacy Box */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                  Platform & Advocacy
                </span>
                <p className="text-slate-300 italic font-serif">"{activeContestant?.advocacy}"</p>
                <div className="text-[11px] text-slate-500 mt-1">Hometown: {activeContestant?.hometown}</div>
              </div>

              {/* View Full Profile CTA */}
              <button
                type="button"
                onClick={() => setJudgeView('profile')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Full Candidate Bio & History</span>
              </button>

              {/* Prev / Next Contestant Navigation Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handlePrevContestant}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextContestant}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Scoring Rubric Column (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-100">Official Rubric Criteria</h3>
                <p className="text-xs text-slate-400">Score between 60.0 to 100.0 with 0.5 step accuracy</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Tabulated Total
                </div>
                <div className="font-mono text-3xl font-extrabold text-amber-400 tabular-nums">
                  {calculatedTotal.toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal ml-1">/ 100</span>
                </div>
              </div>
            </div>

            {/* Criteria List */}
            <div className="space-y-5">
              {activeSegment.criteria.map((crit) => {
                const currentVal = criterionScores[crit.id] ?? 90;
                const presets = [85, 90, 93, 95, 98];

                return (
                  <div key={crit.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-sm text-slate-200">
                          {crit.name}
                        </div>
                        <p className="text-xs text-slate-400">{crit.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-medium">
                          Weight: {crit.weight}%
                        </span>
                        <div className="font-mono text-xl font-bold text-slate-100 tabular-nums mt-1">
                          {currentVal.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Touch Slider & Hitboxes */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={activeSegment.isLocked}
                        onClick={() => handleStep(crit.id, -crit.step, crit)}
                        className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center shrink-0 transition-transform disabled:opacity-40"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input
                        type="range"
                        min={crit.minScore}
                        max={crit.maxScore}
                        step={crit.step}
                        disabled={activeSegment.isLocked}
                        value={currentVal}
                        onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value), crit)}
                        className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
                      />

                      <button
                        type="button"
                        disabled={activeSegment.isLocked}
                        onClick={() => handleStep(crit.id, crit.step, crit)}
                        className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center shrink-0 transition-transform disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Preset buttons */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide mr-1 shrink-0">
                        Presets:
                      </span>
                      {presets.map((p) => (
                        <button
                          key={p}
                          type="button"
                          disabled={activeSegment.isLocked}
                          onClick={() => handleScoreChange(crit.id, p, crit)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium border transition-colors ${
                            currentVal === p
                              ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                              : 'bg-slate-900 text-slate-300 border-slate-750 hover:bg-slate-800'
                          } disabled:opacity-40`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label htmlFor="judge-remarks" className="text-xs font-medium text-slate-300">
                Judge Remarks & Confidential Feedback
              </label>
              <textarea
                id="judge-remarks"
                rows={2}
                value={remarks}
                disabled={activeSegment.isLocked}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Poised delivery, exceptional advocacy relevance, commanding stage presence..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 disabled:opacity-40"
              />
            </div>

            {/* Feedback notification */}
            {submittedFeedback && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{submittedFeedback}</span>
              </div>
            )}

            {/* Submit Ballot CTA */}
            <div className="pt-2">
              {activeSegment.isLocked ? (
                <div className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700">
                  <Lock className="w-4 h-4" />
                  This segment has been locked by the Head Tabulator
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSigModalOpen(true)}
                  className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-semibold text-sm shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2.5 transition-all"
                >
                  <Send className="w-4 h-4" />
                  {existingScore ? 'Update & Re-Certify Ballot' : 'Lock & Submit Official Ballot'}
                </button>
              )}
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Ballots are timestamped and signed with auditor verification hash. Offline entries sync automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL CANDIDATE DOSSIER & PROFILE */}
      {judgeView === 'profile' && (
        <JudgeCandidateProfile
          contestant={activeContestant}
          segments={segments}
          scores={scores}
          currentJudgeId={currentUser.id}
          onOpenScoring={() => setJudgeView('scoring')}
        />
      )}

      {/* VIEW 3: LIVE LEADERBOARD (Clean view for Judges) */}
      {judgeView === 'leaderboard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-0.5">
                Current Standings
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-100">
                Official Candidates Leaderboard
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tabulated rankings across all completed segments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setJudgeView('scoring')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold self-start sm:self-auto transition-all"
            >
              Back to Scoring Pad
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Rank</th>
                  <th className="px-4 py-3 font-semibold">No.</th>
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold">Representing</th>
                  {segments.map((s) => (
                    <th key={s.id} className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                      {s.name.split(' ')[0]}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-bold text-amber-400">Total Score</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {tabulationRankings.map((row) => (
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
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : null}
                        <span>{row.contestant.name}</span>
                        {row.isTied && (
                          <span className="text-[10px] text-amber-400 font-mono">Tied</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {row.contestant.representing}
                    </td>
                    {segments.map((seg) => {
                      const segScore = row.segmentScores[seg.id];
                      return (
                        <td key={seg.id} className="px-3 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                          {segScore ? (
                            <span className="text-slate-300 font-medium">
                              {segScore.effectiveScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-400 text-sm tabular-nums">
                      {row.totalWeightedScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playTap();
                          setSelectedContestantId(row.contestant.id);
                          setJudgeView('scoring');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 text-[11px] font-medium transition-colors"
                      >
                        Score / View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Digital Signature Modal */}
      <DigitalSignatureModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onConfirm={handleConfirmSignature}
        title="Judge Ballot Official Certification"
        subtitle={`Candidate #${activeContestant?.number} - ${activeContestant?.name} (${activeSegment?.name})`}
        signeeName={currentUser.name}
        signeeRole={`Judge #${judgeNumber} · Official Board of Judges`}
      />
    </div>
  );
};
