import React from 'react';
import { User, UserRole } from '../../types/pageant';
import { Crown, UserCheck, ShieldCheck, Mic, Award, X, Check } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser
}) => {
  if (!isOpen) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'judge':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'auditor':
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case 'emcee':
        return <Mic className="w-4 h-4 text-purple-400" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Head Tabulator';
      case 'judge':
        return 'Board of Judges';
      case 'auditor':
        return 'Audit & Scrutiny';
      case 'emcee':
        return 'Stage Host';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-lg text-slate-100">Switch Active Account & Role</h3>
            <p className="text-xs text-slate-400">
              Select any profile to test specific permissions, scoring tablets, or organizer oversight.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {users.map((user) => {
            const isCurrent = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  sounds.playTap();
                  onSelectUser(user);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 relative ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 text-slate-200">
                  {user.avatar || user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {getRoleIcon(user.role)}
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <div className="font-medium text-sm text-slate-100 truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.title}</div>
                </div>
                {isCurrent && (
                  <span className="shrink-0 p-1 rounded-full bg-amber-400 text-slate-950">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Security Pin Protocol Active</span>
          <span className="font-mono text-amber-400/90">Zero Friction Evaluation Mode</span>
        </div>
      </div>
    </div>
  );
};
