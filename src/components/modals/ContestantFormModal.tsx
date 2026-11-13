import React, { useState, useEffect } from 'react';
import { Contestant } from '../../types/pageant';
import { User, X, Check, Image, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ContestantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Contestant, 'id'> | Partial<Contestant>) => void;
  contestantToEdit?: Contestant | null;
  existingContestants: Contestant[];
}

export const ContestantFormModal: React.FC<ContestantFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contestantToEdit,
  existingContestants
}) => {
  const isEditing = !!contestantToEdit;

  const [number, setNumber] = useState<number>(1);
  const [name, setName] = useState('');
  const [representing, setRepresenting] = useState('');
  const [age, setAge] = useState<number>(23);
  const [height, setHeight] = useState("5'8\"");
  const [hometown, setHometown] = useState('');
  const [advocacy, setAdvocacy] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState<Contestant['status']>('finalist');
  const [specialAwards, setSpecialAwards] = useState<string>('');

  useEffect(() => {
    if (contestantToEdit) {
      setNumber(contestantToEdit.number);
      setName(contestantToEdit.name);
      setRepresenting(contestantToEdit.representing);
      setAge(contestantToEdit.age);
      setHeight(contestantToEdit.height);
      setHometown(contestantToEdit.hometown);
      setAdvocacy(contestantToEdit.advocacy);
      setPhotoUrl(contestantToEdit.photoUrl || '');
      setStatus(contestantToEdit.status);
      setSpecialAwards(contestantToEdit.specialAwards ? contestantToEdit.specialAwards.join(', ') : '');
    } else {
      // Auto-assign next candidate number
      const maxNum = existingContestants.length > 0 ? Math.max(...existingContestants.map(c => c.number)) : 0;
      setNumber(maxNum + 1);
      setName('');
      setRepresenting('');
      setAge(23);
      setHeight("5'8\"");
      setHometown('');
      setAdvocacy('');
      setPhotoUrl('');
      setStatus('finalist');
      setSpecialAwards('');
    }
  }, [contestantToEdit, existingContestants, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter candidate name.');
      return;
    }
    if (!representing.trim()) {
      alert('Please enter what this candidate is representing (e.g. State, City, or Country).');
      return;
    }

    const awardsArray = specialAwards
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    sounds.playTap();
    onSave({
      number,
      name: name.trim(),
      representing: representing.trim(),
      age: Number(age) || 20,
      height: height.trim() || "5'8\"",
      hometown: hometown.trim() || representing.trim(),
      advocacy: advocacy.trim() || 'Youth empowerment, community health and sustainable social development.',
      photoUrl: photoUrl.trim(),
      status,
      specialAwards: awardsArray
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-lg text-slate-100">
              {isEditing ? `Edit Candidate #${contestantToEdit.number} Details` : 'Enter New Candidate Details'}
            </h3>
            <p className="text-xs text-slate-400">
              Organizer entry form for pageant candidate roster and judging ballots.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Candidate No. *
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Elena Rostova"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Representing / Sash Title *
              </label>
              <input
                type="text"
                placeholder="e.g. California, Georgia, Manila"
                value={representing}
                onChange={(e) => setRepresenting(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Hometown
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Age
              </label>
              <input
                type="number"
                min="16"
                max="99"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Height
              </label>
              <input
                type="text"
                placeholder="e.g. 5'9&quot;"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Phase Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Contestant['status'])}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="finalist">Finalist</option>
                <option value="semi_finalist">Semi-Finalist</option>
                <option value="active">Active Prelim</option>
                <option value="eliminated">Eliminated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Official Platform & Advocacy
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Clean oceans and renewable STEM education for underrepresented young women..."
              value={advocacy}
              onChange={(e) => setAdvocacy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Photo URL / Image Link (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter image URL or leave empty for styled avatar"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              If left blank, an elegant monogram avatar with the candidate's number will be generated automatically.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Special Awards (Comma separated, optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Best in Evening Gown, Miss Photogenic, Congeniality"
              value={specialAwards}
              onChange={(e) => setSpecialAwards(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Add Candidate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
