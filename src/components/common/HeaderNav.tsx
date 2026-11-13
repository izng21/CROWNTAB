import React, { useState } from 'react';
import { usePageant } from '../../context/PageantContext';
import { Crown, User, Volume2, VolumeX, RefreshCw, Settings } from 'lucide-react';
import { RoleSwitchModal } from '../modals/RoleSwitchModal';
import { PageantConfigModal } from '../modals/PageantConfigModal';
import { sounds } from '../../utils/soundEffects';

export const HeaderNav: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    activeView,
    setActiveView,
    soundMuted,
    setSoundMuted,
    resetDemoData
  } = usePageant();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const isJudge = currentUser.role === 'judge';

  // Judges ONLY see Leaderboard and Candidate Profiles / Scoring
  const judgeNavLinks = [
    { id: 'judge_pad', label: 'Candidate Scoring & Profiles' },
    { id: 'rankings', label: 'Leaderboard' },
  ] as const;

  // Organizers / Tabulators / Auditors see all management consoles
  const adminNavLinks = [
    { id: 'organizer_dashboard', label: 'Tabulation Matrix' },
    { id: 'judge_pad', label: 'Judge Scoring Pad' },
    { id: 'rankings', label: 'Leaderboard' },
    { id: 'audit_trail', label: 'Auditor Log' },
    { id: 'emcee_stage', label: 'Stage Teleprompter' },
    { id: 'reports', label: 'Official Reports' },
  ] as const;

  const currentNavLinks = isJudge ? judgeNavLinks : adminNavLinks;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Crown className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-lg tracking-wider text-slate-100 uppercase">
                Crown<span className="text-amber-400">Tab</span>
              </span>
              {isJudge && (
                <span className="hidden sm:inline text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  / Judge Tablet
                </span>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {currentNavLinks.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setActiveView(link.id);
                  }}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                    isActive
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Role Indicator */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Pageant Setup Button for Organizers */}
            {!isJudge && (
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(true)}
                title="Customize Pageant, Judges (1-5), and Candidates"
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pageant Setup</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              title={soundMuted ? 'Unmute feedback sound' : 'Mute feedback sound'}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400/80" />}
            </button>

            {/* Quick Reset */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset pageant session to factory default scores & initial status?')) {
                  resetDemoData();
                }
              }}
              title="Reset Demo Data"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Active User / Role Switcher Trigger */}
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
                {currentUser.avatar || <User className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-400 font-medium tracking-tight">
                  {currentUser.role === 'admin'
                    ? 'Tabulator'
                    : currentUser.role === 'judge'
                    ? `Judge ${currentUser.judgeNumber || ''}`
                    : currentUser.role === 'auditor'
                    ? 'Auditor'
                    : 'Emcee'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar for small screens */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-900 text-xs no-scrollbar">
          {currentNavLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setActiveView(link.id);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </header>

      <RoleSwitchModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={(selected) => {
          setCurrentUser(selected);
          // If switching to judge, auto navigate to judge_pad, if organizer -> organizer_dashboard
          if (selected.role === 'judge') setActiveView('judge_pad');
          else if (selected.role === 'admin') setActiveView('organizer_dashboard');
          else if (selected.role === 'auditor') setActiveView('audit_trail');
          else if (selected.role === 'emcee') setActiveView('emcee_stage');
        }}
      />

      <PageantConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </>
  );
};
