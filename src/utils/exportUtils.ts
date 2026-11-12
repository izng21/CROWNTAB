import { Contestant, Segment, User, TabulationSummaryRow, EventConfig } from '../types/pageant';

export function exportTabulationCSV(
  config: EventConfig,
  contestants: Contestant[],
  segments: Segment[],
  judges: User[],
  rankings: TabulationSummaryRow[]
) {
  const headers = [
    'Rank',
    'Candidate No.',
    'Candidate Name',
    'Representing',
    ...segments.map((s) => `${s.name} (${s.weight}%)`),
    'Final Tabulated Score',
    'Ordinal Rank Points',
    'Status'
  ];

  const rows = rankings.map((r) => {
    const segScores = segments.map((s) => {
      const seg = r.segmentScores[s.id];
      return seg ? seg.effectiveScore.toFixed(2) : '0.00';
    });

    return [
      r.currentRank,
      r.contestant.number,
      `"${r.contestant.name.replace(/"/g, '""')}"`,
      `"${r.contestant.representing.replace(/"/g, '""')}"`,
      ...segScores,
      r.totalWeightedScore.toFixed(2),
      r.rankPoints,
      r.contestant.status.toUpperCase()
    ];
  });

  // Judge breakdown section
  const judgeHeaders = [
    '',
    '',
    'DETAILED JUDGES BREAKDOWN',
    '',
    ...judges.map((j) => `Judge ${j.judgeNumber || ''}: ${j.name}`)
  ];

  const judgeBreakdowns: string[][] = [];
  judges.forEach((j) => {
    // Collect judge info
  });

  const csvContent = [
    `"${config.eventName} - Official Tabulation Summary"`,
    `"Edition: ${config.edition} | Date: ${config.date} | Venue: ${config.venue}"`,
    `"Ranking System: ${config.rankingSystem.replace(/_/g, ' ').toUpperCase()}"`,
    `"Auditor Status: ${config.auditorCertified ? 'OFFICIALLY CERTIFIED' : 'PRELIMINARY / UNOFFICIAL'}"`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
    '',
    judgeHeaders.join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${config.eventName.toLowerCase().replace(/\s+/g, '_')}_tabulation_results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerPrintReport() {
  window.print();
}
