import React from 'react';
import { Contestant, Segment, ScoreEntry } from '../../types/pageant';
import { Award, User, MapPin, Heart, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

interface JudgeCandidateProfileProps {
  contestant: Contestant;
  segments: Segment[];
  scores: ScoreEntry[];
  currentJudgeId: string;
  onOpenScoring: () => void;
}

export const JudgeCandidateProfile: React.FC<JudgeCandidateProfileProps> = ({
  contestant,
  segments,
  scores,
  currentJudgeId,
  onOpenScoring
}) => {
  // Get scores this judge gave to this contestant in past segments
  const judgePastScores = segments.map((seg) => {
    const entry = scores.find(
      (s) => s.contestantId === contestant.id && s.segmentId === seg.id && s.judgeId === currentJudgeId
    );
    return {
      segment: seg,
      entry
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Large Candidate Portrait */}
        <div className="w-full md:w-72 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg relative">
          {contestant.photoUrl ? (
            <img
              src={contestant.photoUrl}
              alt={contestant.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 to-slate-950">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-3xl font-serif font-bold mb-3">
                #{contestant.number}
              </div>
              <div className="font-serif text-lg font-bold text-slate-200">{contestant.name}</div>
              <div className="text-xs text-slate-400 mt-1">{contestant.representing}</div>
            </div>
          )}
          <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-700/60 font-mono font-bold text-amber-400 text-sm">
            #{contestant.number}
          </div>
        </div>

        {/* Profile Bio Details */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Official Candidate Dossier
            </div>
            <h2 className="font-serif text-3xl font-bold text-slate-100 mt-0.5">
              {contestant.name}
            </h2>
            <div className="text-lg text-amber-300 font-medium">
              Representing {contestant.representing}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Age</span>
              <span className="text-base font-bold text-slate-200">{contestant.age} Years Old</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Height</span>
              <span className="text-base font-bold text-slate-200">{contestant.height}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hometown</span>
              <span className="text-base font-bold text-slate-200 truncate block">{contestant.hometown}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Status</span>
              <span className="text-base font-bold text-amber-400 capitalize truncate block">
                {contestant.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Advocacy & Platform */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Official Community Advocacy & Social Platform</span>
            </div>
            <p className="text-sm text-slate-200 font-serif italic leading-relaxed">
              "{contestant.advocacy}"
            </p>
          </div>

          {/* Special Awards */}
          {contestant.specialAwards && contestant.specialAwards.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Special Awards:
              </span>
              {contestant.specialAwards.map((award) => (
                <span
                  key={award}
                  className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {award}
                </span>
              ))}
            </div>
          )}

          {/* Your Past Scores for this Candidate */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Your Evaluated Scores for Candidate #{contestant.number}:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {judgePastScores.map(({ segment, entry }) => (
                <div
                  key={segment.id}
                  className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs flex justify-between items-center"
                >
                  <span className="text-slate-400 truncate pr-1">{segment.name.split(' ')[0]}</span>
                  <span className="font-mono font-bold text-slate-100 tabular-nums">
                    {entry ? `${entry.totalScore.toFixed(1)}` : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Jump to Scoring Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenScoring}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
            >
              <span>Score Candidate #{contestant.number}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
