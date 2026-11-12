import React, { useState, useEffect, useMemo } from 'react';
import { usePageant } from '../../context/PageantContext';
import { 
  CheckCircle, 
  Lock, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Minus, 
  Plus, 
  UserCheck, 
  Sparkles,
  Info,
  Send
} from 'lucide-react';
import { Contestant, Segment, Criterion } from '../../types/pageant';
import { DigitalSignatureModal } from '../modals/DigitalSignatureModal';
import { sounds } from '../../utils/soundEffects';

export const JudgeScoringPad: React.FC = () => {
  const {
    currentUser,
    contestants,
    segments,
    scores,
    activeSegment,
    setActiveSegment,
    submitJudgeScore,
    isOnline
  } = usePageant();

  // If current user is not a judge, prompt friendly reminder or let them score as a designated guest judge
  const isJudge = currentUser.role === 'judge';
  const judgeNumber = currentUser.judgeNumber || 1;

  // Contestant selection
  const [selectedContestantId, setSelectedContestantId] = useState<string>(contestants[0]?.id || '');
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  // Criteria score state: criterionId -> number
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState('');

  // Get active contestant object
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

  // Load existing score into state when contestant or segment changes
  useEffect(() => {
    if (existingScore) {
      setCriterionScores(existingScore.scores || {});
      setRemarks(existingScore.remarks || '');
    } else {
      // Default to standard starting benchmark (e.g. 90 or minScore)
      const defaults: Record<string, number> = {};
      activeSegment.criteria.forEach((crit) => {
        defaults[crit.id] = 90;
      });
      setCriterionScores(defaults);
      setRemarks('');
    }
  }, [existingScore, activeContestant?.id, activeSegment?.id]);

  // Handle score change for single criterion
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

  // Calculate live weighted total
  const calculatedTotal = useMemo(() => {
    let total = 0;
    activeSegment.criteria.forEach((c) => {
      const val = criterionScores[c.id] || 0;
      total += (val * c.weight) / 100;
    });
    return Math.round(total * 100) / 100;
  }, [activeSegment, criterionScores]);

  // Check if current contestant is already scored
  const isContestantScored = (cId: string) => {
    return scores.some(
      (s) =>
        s.contestantId === cId &&
        s.segmentId === activeSegment.id &&
        s.judgeId === currentUser.id &&
        s.status !== 'draft'
    );
  };

  // Handlers for switching contestants
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

  // Submit flow
  const handleInitiateSubmit = () => {
    setIsSigModalOpen(true);
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
      setSubmittedFeedback(`Ballot for #${activeContestant.number} saved offline in local queue!`);
    } else {
      setSubmittedFeedback(`Ballot for #${activeContestant.number} (${activeContestant.name}) successfully certified!`);
    }

    setTimeout(() => setSubmittedFeedback(null), 3500);

    // Auto advance to next unscored contestant if available
    const nextUnscored = contestants.find((c) => c.id !== activeContestant.id && !isContestantScored(c.id));
    if (nextUnscored) {
      setTimeout(() => setSelectedContestantId(nextUnscored.id), 1200);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Non-judge Role Notice */}
      {!isJudge && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              You are logged in as <strong>{currentUser.name}</strong> ({currentUser.role}). Entering scores here acts as Judge {judgeNumber}.
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-medium">Evaluation Mode</span>
        </div>
      )}

      {/* Segment Selector & Status Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Official Scoring Terminal</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-amber-400">Judge #{judgeNumber}: {currentUser.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-wide">
              {activeSegment.name}
            </h1>
            {activeSegment.isLocked ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Lock className="w-3.5 h-3.5" />
                Locked
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5" />
                Live Scoring
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{activeSegment.subtitle} · Weight: {activeSegment.weight}%</p>
        </div>

        {/* Segment Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="segment-select" className="text-xs text-slate-400 whitespace-nowrap">
            Segment:
          </label>
          <select
            id="segment-select"
            value={activeSegment.id}
            onChange={(e) => setActiveSegment(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {segments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {seg.name} ({seg.weight}%) {seg.isLocked ? '🔒' : '✓'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contestant Reel (Horizontal Scroll with big touch targets) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Select Contestant ({contestants.length} Total)</span>
          <span>Tap to evaluate</span>
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

      {/* Main Scoring Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Candidate Profile & Visuals (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="relative aspect-square max-h-[380px] bg-slate-950 overflow-hidden flex items-center justify-center">
            {activeContestant?.photoUrl ? (
              <img
                src={activeContestant.photoUrl}
                alt={activeContestant.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
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

            {/* Special Awards Won */}
            {activeContestant?.specialAwards && activeContestant.specialAwards.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-300">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Awards: {activeContestant.specialAwards.join(' · ')}</span>
              </div>
            )}

            {/* Advocacy */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                Platform & Advocacy
              </span>
              <p className="text-slate-400 italic">"{activeContestant?.advocacy}"</p>
              <div className="text-[11px] text-slate-500 mt-1">Hometown: {activeContestant?.hometown}</div>
            </div>

            {/* Prev / Next Contestant Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
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

        {/* Right Column: Scoring Rubric & Touch Controls (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-100">Official Rubric Criteria</h3>
              <p className="text-xs text-slate-400">Score between 60.0 to 100.0 with 0.5 step accuracy</p>
            </div>
            {/* Live Total Score Pill */}
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

          {/* Criteria Sliders & Quick Buttons */}
          <div className="space-y-6">
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

                  {/* Touch Slider */}
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

                  {/* Fast Preset Buttons for Quick Arena Judging */}
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

          {/* Judge Confidential Remarks */}
          <div className="space-y-1.5">
            <label htmlFor="judge-remarks" className="text-xs font-medium text-slate-300">
              Judge Remarks / Confidential Feedback (Optional)
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

          {/* Feedback Banner */}
          {submittedFeedback && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{submittedFeedback}</span>
            </div>
          )}

          {/* Action CTAs: Lock & Submit Ballot */}
          <div className="pt-2">
            {activeSegment.isLocked ? (
              <div className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700">
                <Lock className="w-4 h-4" />
                This segment has been locked by the Head Tabulator
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInitiateSubmit}
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

      {/* Digital Signature Confirmation Modal */}
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
