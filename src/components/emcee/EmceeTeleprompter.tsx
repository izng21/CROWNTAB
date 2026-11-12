import React, { useState } from 'react';
import { usePageant } from '../../context/PageantContext';
import { Crown, Sparkles, Mic, ChevronRight, ChevronLeft, Eye, Award, CheckCircle2 } from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';
import { sounds } from '../../utils/soundEffects';

export const EmceeTeleprompter: React.FC = () => {
  const {
    tabulationRankings,
    eventConfig,
    activeSegment
  } = usePageant();

  const [revealStep, setRevealStep] = useState<number>(0);
  // 0: Hidden envelopes
  // 1: Revealed 2nd Runner Up (Rank 3)
  // 2: Revealed 1st Runner Up (Rank 2)
  // 3: Revealed Crowned Winner (Rank 1)

  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const top3 = tabulationRankings.slice(0, 3);
  const currentCardContestant = tabulationRankings[activeCardIndex]?.contestant;

  const handleRevealNext = () => {
    const nextStep = revealStep + 1;
    setRevealStep(nextStep);
    sounds.playTap();

    if (nextStep === 3) {
      // Coronation reveal!
      sounds.playFanfare();
      triggerConfetti(0.5, 0.4);
      setTimeout(() => triggerConfetti(0.2, 0.5), 400);
      setTimeout(() => triggerConfetti(0.8, 0.5), 800);
    }
  };

  const handleResetReveal = () => {
    sounds.playTap();
    setRevealStep(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      {/* Emcee Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Stage Teleprompter & Host Deck
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
              Coronation Ceremony Teleprompter
            </h1>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-3">
          <span>Current Round: <strong className="text-amber-400">{activeSegment.name}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Certified: <strong className="text-emerald-400">{eventConfig.auditorCertified ? 'YES' : 'PENDING'}</strong></span>
        </div>
      </div>

      {/* Dramatic Golden Envelope Reveal Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
              Dramatic Coronation Envelope
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetReveal}
            className="text-xs text-slate-400 hover:text-amber-400 underline"
          >
            Reset Envelopes
          </button>
        </div>

        {/* 3 Dramatic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 2nd Runner Up (Rank 3) */}
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${
            revealStep >= 1
              ? 'bg-slate-900/90 border-amber-700/60 shadow-xl'
              : 'bg-slate-950/90 border-slate-800 text-center flex flex-col items-center justify-center min-h-[220px]'
          }`}>
            {revealStep >= 1 ? (
              <div className="text-center space-y-3 animate-in zoom-in-95">
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
                  2nd Runner Up
                </span>
                <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-amber-600/50 bg-slate-950">
                  {top3[2]?.contestant.photoUrl ? (
                    <img src={top3[2].contestant.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-amber-500">
                      #{top3[2]?.contestant.number}
                    </div>
                  )}
                </div>
                <div className="font-mono text-sm font-bold text-amber-400">
                  Candidate #{top3[2]?.contestant.number}
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-100">
                  {top3[2]?.contestant.name}
                </h3>
                <p className="text-xs text-slate-400">{top3[2]?.contestant.representing}</p>
              </div>
            ) : (
              <div className="space-y-2 text-slate-500">
                <div className="text-xs font-mono uppercase tracking-widest text-slate-600">Envelope #1</div>
                <div className="font-serif text-lg font-bold text-slate-400">2nd Runner Up</div>
                <p className="text-xs">Sealed by Scrutineer</p>
              </div>
            )}
          </div>

          {/* Card 2: 1st Runner Up (Rank 2) */}
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${
            revealStep >= 2
              ? 'bg-slate-900/90 border-slate-500/60 shadow-xl'
              : 'bg-slate-950/90 border-slate-800 text-center flex flex-col items-center justify-center min-h-[220px]'
          }`}>
            {revealStep >= 2 ? (
              <div className="text-center space-y-3 animate-in zoom-in-95">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                  1st Runner Up
                </span>
                <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-slate-400/50 bg-slate-950">
                  {top3[1]?.contestant.photoUrl ? (
                    <img src={top3[1].contestant.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                      #{top3[1]?.contestant.number}
                    </div>
                  )}
                </div>
                <div className="font-mono text-sm font-bold text-amber-400">
                  Candidate #{top3[1]?.contestant.number}
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-100">
                  {top3[1]?.contestant.name}
                </h3>
                <p className="text-xs text-slate-400">{top3[1]?.contestant.representing}</p>
              </div>
            ) : (
              <div className="space-y-2 text-slate-500">
                <div className="text-xs font-mono uppercase tracking-widest text-slate-600">Envelope #2</div>
                <div className="font-serif text-lg font-bold text-slate-400">1st Runner Up</div>
                <p className="text-xs">Sealed by Scrutineer</p>
              </div>
            )}
          </div>

          {/* Card 3: The Crowned Winner (Rank 1) */}
          <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${
            revealStep >= 3
              ? 'bg-gradient-to-b from-amber-950/50 to-slate-900 border-amber-400 shadow-2xl shadow-amber-400/20'
              : 'bg-slate-950/90 border-amber-500/30 text-center flex flex-col items-center justify-center min-h-[220px]'
          }`}>
            {revealStep >= 3 ? (
              <div className="text-center space-y-3 animate-in zoom-in-90 duration-500">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-md">
                  <Crown className="w-3.5 h-3.5" />
                  Crowned Queen
                </div>
                <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-400/20 bg-slate-950">
                  {top3[0]?.contestant.photoUrl ? (
                    <img src={top3[0].contestant.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-amber-400">
                      #{top3[0]?.contestant.number}
                    </div>
                  )}
                </div>
                <div className="font-mono text-sm font-extrabold text-amber-400">
                  Candidate #{top3[0]?.contestant.number}
                </div>
                <h3 className="font-serif text-2xl font-extrabold text-slate-100 tracking-wide">
                  {top3[0]?.contestant.name}
                </h3>
                <p className="text-sm font-semibold text-amber-300">
                  {top3[0]?.contestant.representing}
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <Crown className="w-8 h-8 text-amber-500/50 mx-auto animate-bounce" />
                <div className="font-serif text-lg font-bold text-amber-400">
                  Miss Celestial Global 2026
                </div>
                <p className="text-xs text-amber-400/60">Grand Coronation Winner</p>
              </div>
            )}
          </div>
        </div>

        {/* Reveal Next Action */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center">
          {revealStep < 3 ? (
            <button
              type="button"
              onClick={handleRevealNext}
              className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-400/20 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Eye className="w-4 h-4" />
              {revealStep === 0
                ? 'Reveal 2nd Runner Up (3rd Place)'
                : revealStep === 1
                ? 'Reveal 1st Runner Up (2nd Place)'
                : 'ANNOUNCE CROWNED WINNER!'}
            </button>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                All Finalists Announced & Crowned!
              </div>
              <button
                type="button"
                onClick={handleResetReveal}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Reset Presentation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stage Cue Card Reader for Candidate Profiles */}
      {currentCardContestant && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm px-2.5 py-1 rounded bg-amber-400/20 text-amber-400 font-bold">
                Cue Card {activeCardIndex + 1} of {tabulationRankings.length}
              </span>
              <span className="text-xs text-slate-400">Host Stage Banter & Bio Deck</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeCardIndex === 0}
                onClick={() => {
                  sounds.playTap();
                  setActiveCardIndex(activeCardIndex - 1);
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={activeCardIndex === tabulationRankings.length - 1}
                onClick={() => {
                  sounds.playTap();
                  setActiveCardIndex(activeCardIndex + 1);
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 aspect-square max-w-[200px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mx-auto md:mx-0">
              {currentCardContestant.photoUrl ? (
                <img src={currentCardContestant.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-amber-400 text-3xl font-serif">
                  #{currentCardContestant.number}
                </div>
              )}
            </div>

            <div className="md:col-span-8 space-y-3">
              <div>
                <div className="font-mono text-xs font-bold text-amber-400">
                  CANDIDATE #{currentCardContestant.number}
                </div>
                <h2 className="font-serif text-3xl font-bold text-slate-100">
                  {currentCardContestant.name}
                </h2>
                <div className="text-base text-amber-300 font-medium">
                  {currentCardContestant.representing}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <div>Age: <strong className="text-slate-200">{currentCardContestant.age}</strong></div>
                <div>Height: <strong className="text-slate-200">{currentCardContestant.height}</strong></div>
                <div>Hometown: <strong className="text-slate-200">{currentCardContestant.hometown}</strong></div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Official Platform & Advocacy:
                </div>
                <div className="text-slate-200 font-serif italic text-sm">
                  "{currentCardContestant.advocacy}"
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
