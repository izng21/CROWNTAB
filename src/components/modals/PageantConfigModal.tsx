import React, { useState } from 'react';
import { usePageant } from '../../context/PageantContext';
import { 
  Settings, 
  X, 
  Check, 
  Users, 
  Calendar, 
  Award, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Shield, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { Contestant, User } from '../../types/pageant';
import { ContestantFormModal } from './ContestantFormModal';
import { sounds } from '../../utils/soundEffects';

interface PageantConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PageantConfigModal: React.FC<PageantConfigModalProps> = ({ isOpen, onClose }) => {
  const {
    eventConfig,
    updateEventConfig,
    setJudgeCount,
    allUsers,
    updateJudge,
    contestants,
    addContestant,
    updateContestant,
    deleteContestant,
    segments,
    updateSegment
  } = usePageant();

  const [activeTab, setActiveTab] = useState<'details' | 'judges' | 'candidates' | 'segments'>('details');

  // Event Details State
  const [eventName, setEventName] = useState(eventConfig.eventName);
  const [edition, setEdition] = useState(eventConfig.edition);
  const [venue, setVenue] = useState(eventConfig.venue);
  const [date, setDate] = useState(eventConfig.date);
  const [hostCity, setHostCity] = useState(eventConfig.hostCity);
  const [sanctioningBody, setSanctioningBody] = useState(eventConfig.sanctioningBody);

  // Candidate modal state
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Contestant | null>(null);

  // Status feedback
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentJudgeCount = eventConfig.judgeCount || 5;
  const judgeUsers = allUsers.filter(u => u.role === 'judge');

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventConfig({
      eventName: eventName.trim(),
      edition: edition.trim(),
      venue: venue.trim(),
      date: date.trim(),
      hostCity: hostCity.trim(),
      sanctioningBody: sanctioningBody.trim()
    });
    setSavedFeedback('Pageant event details saved successfully!');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const handleJudgeCountChange = (count: number) => {
    setJudgeCount(count);
  };

  const handleOpenAddCandidate = () => {
    setEditingCandidate(null);
    setIsCandidateModalOpen(true);
  };

  const handleOpenEditCandidate = (c: Contestant) => {
    setEditingCandidate(c);
    setIsCandidateModalOpen(true);
  };

  const handleDeleteCandidate = (c: Contestant) => {
    if (window.confirm(`Are you sure you want to remove Candidate #${c.number} (${c.name}) from the pageant?`)) {
      deleteContestant(c.id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                  Pageant Customization & Setup
                </h2>
                <p className="text-xs text-slate-400">
                  Customize event identity, number of judges (1–5), candidate details, and scoring segments.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('details');
              }}
              className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === 'details'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>1. Event Identity</span>
              </span>
              {activeTab === 'details' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('judges');
              }}
              className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === 'judges'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>2. Board of Judges ({currentJudgeCount} Active)</span>
              </span>
              {activeTab === 'judges' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('candidates');
              }}
              className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === 'candidates'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>3. Candidates Roster ({contestants.length})</span>
              </span>
              {activeTab === 'candidates' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('segments');
              }}
              className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === 'segments'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>4. Competition Segments</span>
              </span>
              {activeTab === 'segments' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Feedback banner */}
          {savedFeedback && (
            <div className="mx-6 mt-3 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{savedFeedback}</span>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: EVENT DETAILS */}
            {activeTab === 'details' && (
              <form onSubmit={handleSaveDetails} className="space-y-4 max-w-2xl">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Official Pageant Name *
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Miss Grand Elegance 2026, Mr. & Ms. University"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-serif text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Edition / Coronation Subtitle
                    </label>
                    <input
                      type="text"
                      value={edition}
                      onChange={(e) => setEdition(e.target.value)}
                      placeholder="e.g. 75th Annual Coronation Night"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Sanctioning Body / Guild
                    </label>
                    <input
                      type="text"
                      value={sanctioningBody}
                      onChange={(e) => setSanctioningBody(e.target.value)}
                      placeholder="e.g. National Pageant Standards Bureau"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Event Venue
                    </label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Grand Theatre Ballroom"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Host City & State/Country
                    </label>
                    <input
                      type="text"
                      value={hostCity}
                      onChange={(e) => setHostCity(e.target.value)}
                      placeholder="e.g. Las Vegas, NV"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Coronation Date
                    </label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. November 12, 2026"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20"
                  >
                    <Check className="w-4 h-4" />
                    Save Event Identity
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: BOARD OF JUDGES CONFIGURATION (1 to 5 Judges) */}
            {activeTab === 'judges' && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-100">
                        How many judges will evaluate this pageant?
                      </h4>
                      <p className="text-xs text-slate-400">
                        Set between 1 to 5 judges. The tabulation system and score matrix will automatically adapt.
                      </p>
                    </div>

                    {/* Quick Button Selector for 1 to 5 Judges */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleJudgeCountChange(num)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentJudgeCount === num
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                          }`}
                        >
                          {num} {num === 1 ? 'Judge' : 'Judges'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* List of Judges (Editable Names, Credentials, and PINs) */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400">
                    Active Board of Judges ({currentJudgeCount} Configured)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {judgeUsers.slice(0, currentJudgeCount).map((judge, idx) => (
                      <div
                        key={judge.id}
                        className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            Judge #{idx + 1}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-amber-400" />
                            PIN: <strong className="text-slate-200 font-mono">{judge.pin}</strong>
                          </span>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Judge Name</label>
                          <input
                            type="text"
                            value={judge.name}
                            onChange={(e) => updateJudge(judge.id, { name: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Title / Credentials</label>
                            <input
                              type="text"
                              value={judge.title}
                              onChange={(e) => updateJudge(judge.id, { title: e.target.value })}
                              placeholder="e.g. Celebrity Runway Coach"
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Security PIN</label>
                            <input
                              type="text"
                              value={judge.pin}
                              onChange={(e) => updateJudge(judge.id, { pin: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CANDIDATES ROSTER & ORGANIZER ENTRY */}
            {activeTab === 'candidates' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base text-slate-100">
                      Contestant Roster & Profiles ({contestants.length} Total)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Organizers enter and manage candidate sash titles, platform details, and photos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddCandidate}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Enter New Candidate
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contestants.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-start gap-3.5 hover:border-slate-750 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 relative">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-amber-400 text-sm">
                            #{c.number}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 bg-slate-950 text-amber-400 font-mono text-[9px] px-1 font-bold">
                          #{c.number}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-slate-100 truncate">{c.name}</h4>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-amber-400 truncate">
                          Representing {c.representing}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                          "{c.advocacy}"
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCandidate(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title="Edit candidate details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCandidate(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete candidate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: COMPETITION SEGMENTS & WEIGHTS */}
            {activeTab === 'segments' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-base text-slate-100">
                    Competition Segments & Rubric Weights
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customize segment names and scoring weight percentages.
                  </p>
                </div>

                <div className="space-y-3">
                  {segments.map((seg) => (
                    <div
                      key={seg.id}
                      className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="text-[11px] text-slate-400 block mb-1">Segment Name</label>
                          <input
                            type="text"
                            value={seg.name}
                            onChange={(e) => updateSegment(seg.id, { name: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                          />
                        </div>
                        <div className="w-full sm:w-36">
                          <label className="text-[11px] text-slate-400 block mb-1">Weight (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={seg.weight}
                            onChange={(e) => updateSegment(seg.id, { weight: parseFloat(e.target.value) || 25 })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500 font-bold"
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Criteria ({seg.criteria.length}): {seg.criteria.map(c => `${c.name} (${c.weight}%)`).join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
            <span className="text-xs text-slate-500">
              Changes apply instantly across all judges' scoring pads and leaderboards.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
            >
              Done & Return
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Entry & Editor Modal */}
      <ContestantFormModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        onSave={(data) => {
          if (editingCandidate) {
            updateContestant(editingCandidate.id, data);
          } else {
            addContestant(data as Omit<Contestant, 'id'>);
          }
        }}
        contestantToEdit={editingCandidate}
        existingContestants={contestants}
      />
    </>
  );
};
