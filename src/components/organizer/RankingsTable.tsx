import React from 'react';
import { usePageant } from '../../context/PageantContext';
import { Crown, Trophy, Award, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export const RankingsTable: React.FC = () => {
  const {
    tabulationRankings,
    segments,
    eventConfig
  } = usePageant();

  const top3 = tabulationRankings.slice(0, 3);
  const others = tabulationRankings.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            Automated Tabulation Standings
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide">
            Official Pageant Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Calculated via {eventConfig.rankingSystem.replace(/_/g, ' ').toUpperCase()} across {segments.length} competitive segments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            Phase: <strong className="text-amber-400 uppercase">{eventConfig.currentPhase.replace(/_/g, ' ')}</strong>
          </span>
        </div>
      </div>

      {/* Podium Showcase for Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {/* 2nd Place (Silver) */}
        {top3[1] && (
          <div className="md:order-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[11px] font-bold uppercase tracking-wider border border-slate-600">
              2nd Place · 1st Runner Up
            </div>
            <div className="flex flex-col items-center text-center mt-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-400/40 mb-3 bg-slate-950">
                {top3[1].contestant.photoUrl ? (
                  <img src={top3[1].contestant.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                    #{top3[1].contestant.number}
                  </div>
                )}
              </div>
              <div className="font-mono text-xs font-bold text-slate-400">#{top3[1].contestant.number}</div>
              <h3 className="font-serif text-lg font-bold text-slate-100">{top3[1].contestant.name}</h3>
              <p className="text-xs text-slate-400">{top3[1].contestant.representing}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              <div className="font-mono text-2xl font-extrabold text-slate-200 tabular-nums">
                {top3[1].totalWeightedScore.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Tabulated Points</div>
            </div>
          </div>
        )}

        {/* 1st Place (Gold / Crowned Leader) */}
        {top3[0] && (
          <div className="md:order-2 bg-gradient-to-b from-amber-950/30 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Crown className="w-3.5 h-3.5" />
              1st Place · Leader
            </div>
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 mb-3 bg-slate-950 shadow-lg shadow-amber-500/20">
                {top3[0].contestant.photoUrl ? (
                  <img src={top3[0].contestant.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-amber-400">
                    #{top3[0].contestant.number}
                  </div>
                )}
              </div>
              <div className="font-mono text-xs font-bold text-amber-400">#{top3[0].contestant.number}</div>
              <h3 className="font-serif text-xl font-bold text-slate-100">{top3[0].contestant.name}</h3>
              <p className="text-xs text-amber-300 font-medium">{top3[0].contestant.representing}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-500/20 text-center">
              <div className="font-mono text-3xl font-extrabold text-amber-400 tabular-nums">
                {top3[0].totalWeightedScore.toFixed(2)}
              </div>
              <div className="text-[10px] text-amber-400/80 uppercase font-semibold">Tabulated Points</div>
            </div>
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {top3[2] && (
          <div className="md:order-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-800/80 text-amber-200 text-[11px] font-bold uppercase tracking-wider border border-amber-700/60">
              3rd Place · 2nd Runner Up
            </div>
            <div className="flex flex-col items-center text-center mt-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-700/40 mb-3 bg-slate-950">
                {top3[2].contestant.photoUrl ? (
                  <img src={top3[2].contestant.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-amber-600">
                    #{top3[2].contestant.number}
                  </div>
                )}
              </div>
              <div className="font-mono text-xs font-bold text-amber-600">#{top3[2].contestant.number}</div>
              <h3 className="font-serif text-lg font-bold text-slate-100">{top3[2].contestant.name}</h3>
              <p className="text-xs text-slate-400">{top3[2].contestant.representing}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              <div className="font-mono text-2xl font-extrabold text-slate-200 tabular-nums">
                {top3[2].totalWeightedScore.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Tabulated Points</div>
            </div>
          </div>
        )}
      </div>

      {/* Complete Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-100">Full Contestant Standings</h3>
          <span className="text-xs text-slate-400">Ranks updated in real time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">No.</th>
                <th className="px-4 py-3 font-semibold">Candidate</th>
                <th className="px-4 py-3 font-semibold">Representing</th>
                {segments.map((seg) => (
                  <th key={seg.id} className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                    {seg.name.split(' ')[0]} ({seg.weight}%)
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-bold text-amber-400">Total Score</th>
                <th className="px-4 py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {tabulationRankings.map((row) => (
                <tr key={row.contestant.id} className="hover:bg-slate-850/60 transition-colors">
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
                      <div>
                        <div className="font-semibold text-slate-100">{row.contestant.name}</div>
                        {row.isTied && (
                          <span className="text-[10px] text-amber-400 font-mono">Tied Rank</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {row.contestant.representing}
                  </td>

                  {/* Segment Breakdown Columns */}
                  {segments.map((seg) => {
                    const segScore = row.segmentScores[seg.id];
                    return (
                      <td key={seg.id} className="px-3 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                        {segScore ? (
                          <span className="text-slate-300 font-medium">
                            {segScore.effectiveScore.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Final Tabulated Total */}
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-400 text-sm tabular-nums">
                    {row.totalWeightedScore.toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      {row.contestant.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
