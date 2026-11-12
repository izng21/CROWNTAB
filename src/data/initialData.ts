import { Contestant, Segment, User, EventConfig, ScoreEntry, AuditLogEntry } from '../types/pageant';

export const initialConfig: EventConfig = {
  eventName: 'Miss Celestial Global 2026',
  edition: '75th Diamond Anniversary Coronation',
  venue: 'Crown Grand Theatre, Venetian Palace',
  date: 'November 12, 2026',
  hostCity: 'Las Vegas, Nevada',
  sanctioningBody: 'International Pageant Standards & Tabulation Scrutiny Board',
  activeSegmentId: 'seg_final_qa',
  currentPhase: 'top5',
  rankingSystem: 'weighted_average',
  allowSelfUnlocking: false,
  auditorCertified: false,
};

export const initialUsers: User[] = [
  {
    id: 'user_admin',
    name: 'Victoria Sterling',
    role: 'admin',
    title: 'Head Tabulator & Pageant Director',
    pin: '1234',
    avatar: 'VS'
  },
  {
    id: 'user_auditor',
    name: 'Arthur Pendelton, CPA',
    role: 'auditor',
    title: 'Head Scrutineer & External Auditor',
    pin: '7777',
    avatar: 'AP'
  },
  {
    id: 'user_judge_1',
    name: 'Elena Rostova',
    role: 'judge',
    title: 'Judge 1 · Celebrity Runway Director',
    pin: '1001',
    judgeNumber: 1,
    avatar: 'ER'
  },
  {
    id: 'user_judge_2',
    name: 'Marcus Vance, Ph.D.',
    role: 'judge',
    title: 'Judge 2 · Communications Specialist',
    pin: '1002',
    judgeNumber: 2,
    avatar: 'MV'
  },
  {
    id: 'user_judge_3',
    name: 'Sophia Laurent',
    role: 'judge',
    title: 'Judge 3 · Former Miss Universe Finalist',
    pin: '1003',
    judgeNumber: 3,
    avatar: 'SL'
  },
  {
    id: 'user_judge_4',
    name: 'David K. Sterling',
    role: 'judge',
    title: 'Judge 4 · Prime Time Broadcast Journalist',
    pin: '1004',
    judgeNumber: 4,
    avatar: 'DS'
  },
  {
    id: 'user_judge_5',
    name: 'Alicia Morales',
    role: 'judge',
    title: 'Judge 5 · Performing Arts Executive',
    pin: '1005',
    judgeNumber: 5,
    avatar: 'AM'
  },
  {
    id: 'user_emcee',
    name: 'Jonathan Cross',
    role: 'emcee',
    title: 'Stage Host & Master of Ceremonies',
    pin: '9999',
    avatar: 'JC'
  }
];

export const initialContestants: Contestant[] = [
  {
    id: 'c_01',
    number: 1,
    name: 'Elena Solis',
    representing: 'Georgia',
    age: 24,
    height: "5'9\"",
    hometown: 'Atlanta, GA',
    advocacy: 'Pediatric Healthcare & Mental Wellness in Underfunded Communities',
    photoUrl: '/src/assets/images/contestant_elena_solis_1794473278783.jpg',
    status: 'finalist',
    specialAwards: ['Best in Swimwear']
  },
  {
    id: 'c_02',
    number: 2,
    name: 'Maya Chen',
    representing: 'California',
    age: 23,
    height: "5'8\"",
    hometown: 'San Francisco, CA',
    advocacy: 'Empowering Young Women in STEM & Clean Ocean Technologies',
    photoUrl: '/src/assets/images/contestant_maya_chen_1794473278965.jpg',
    status: 'finalist',
    specialAwards: ['Miss Photogenic']
  },
  {
    id: 'c_03',
    number: 3,
    name: 'Amara Okoro',
    representing: 'Texas',
    age: 25,
    height: "5'10\"",
    hometown: 'Houston, TX',
    advocacy: 'Sustainable Agriculture & Girls Education Infrastructure',
    photoUrl: '/src/assets/images/contestant_amara_okoro_1794473279566.jpg',
    status: 'finalist',
    specialAwards: ['Best in Evening Gown']
  },
  {
    id: 'c_04',
    number: 4,
    name: 'Sofia Martinez',
    representing: 'Florida',
    age: 26,
    height: "5'9\"",
    hometown: 'Miami, FL',
    advocacy: 'Cultural Heritage Preservation & Youth Arts Mentorship',
    photoUrl: '/src/assets/images/contestant_sofia_martinez_1794473279479.jpg',
    status: 'finalist',
    specialAwards: ['Miss Congeniality']
  },
  {
    id: 'c_05',
    number: 5,
    name: 'Chloe Vance',
    representing: 'New York',
    age: 24,
    height: "5'11\"",
    hometown: 'New York, NY',
    advocacy: 'Literacy for Incarcerated Youths & Restorative Justice',
    photoUrl: '',
    status: 'finalist'
  },
  {
    id: 'c_06',
    number: 6,
    name: 'Isabella Rossi',
    representing: 'Illinois',
    age: 22,
    height: "5'7\"",
    hometown: 'Chicago, IL',
    advocacy: 'Cardiovascular Health & Youth Athletic Subsidies',
    photoUrl: '',
    status: 'semi_finalist'
  },
  {
    id: 'c_07',
    number: 7,
    name: 'Nicole Sterling',
    representing: 'Washington',
    age: 25,
    height: "5'8\"",
    hometown: 'Seattle, WA',
    advocacy: 'Renewable Clean Energy Access for Rural Districts',
    photoUrl: '',
    status: 'semi_finalist'
  },
  {
    id: 'c_08',
    number: 8,
    name: 'Victoria Laurent',
    representing: 'Hawaii',
    age: 23,
    height: "5'9\"",
    hometown: 'Honolulu, HI',
    advocacy: 'Coral Reef Conservation & Indigenous Marine Knowledge',
    photoUrl: '',
    status: 'semi_finalist'
  }
];

export const initialSegments: Segment[] = [
  {
    id: 'seg_swimwear',
    name: 'Swimwear & Fitness',
    subtitle: 'Physical Fitness, Poise & Stage Confidence',
    weight: 25,
    isLocked: true,
    phase: 'preliminaries',
    criteria: [
      { id: 'crit_sw_1', name: 'Physical Fitness & Tone', description: 'Overall physical wellness, muscle tone, and athleticism', weight: 40, minScore: 60, maxScore: 100, step: 0.5 },
      { id: 'crit_sw_2', name: 'Stage Presence & Grace', description: 'Rhythm, stride, posture, and command of the runway', weight: 35, minScore: 60, maxScore: 100, step: 0.5 },
      { id: 'crit_sw_3', name: 'Charisma & Projection', description: 'Facial radiance, eye contact, and audience connection', weight: 25, minScore: 60, maxScore: 100, step: 0.5 }
    ]
  },
  {
    id: 'seg_evening_gown',
    name: 'Evening Gown Competition',
    subtitle: 'Elegance, Carriage & Haute Couture Presentation',
    weight: 30,
    isLocked: true,
    phase: 'preliminaries',
    criteria: [
      { id: 'crit_eg_1', name: 'Elegance & Regal Carriage', description: 'Graceful glide, balance, dignified poise and presence', weight: 40, minScore: 60, maxScore: 100, step: 0.5 },
      { id: 'crit_eg_2', name: 'Gown Aesthetics & Fit', description: 'Sophistication, fit to silhouette, color harmony', weight: 30, minScore: 60, maxScore: 100, step: 0.5 },
      { id: 'crit_eg_3', name: 'Stage Impact & Aura', description: 'Hypnotic stage presence, quiet confidence, and warmth', weight: 30, minScore: 60, maxScore: 100, step: 0.5 }
    ]
  },
  {
    id: 'seg_advocacy',
    name: 'Advocacy & Speech',
    subtitle: 'Spoken Eloquence & Social Impact Commitment',
    weight: 20,
    isLocked: true,
    phase: 'top10',
    criteria: [
      { id: 'crit_ad_1', name: 'Substance & Relevance', description: 'Depth of cause, measurable community impact proposal', weight: 40, minScore: 60, maxScore: 100, step: 0.5 },
      { id: 'crit_ad_2', name: 'Articulation & Delivery', description: 'Vocal modulation, cadence, clarity and conviction', weight: 35, minScore: 60, maxScore: 100, step: 0.5 },
      { id: 'crit_ad_3', name: 'Emotional Authenticity', description: 'Genuine personal connection and sincerity', weight: 25, minScore: 60, maxScore: 100, step: 0.5 }
    ]
  },
  {
    id: 'seg_final_qa',
    name: 'Final Q&A Round',
    subtitle: 'Intellectual Depth, Composure Under Pressure',
    weight: 25,
    isLocked: false,
    phase: 'top5',
    applicableContestantCount: 5,
    criteria: [
      { id: 'crit_qa_1', name: 'Substance & Direct Answer', description: 'Direct answer to question with intellectual depth and logic', weight: 50, minScore: 60, maxScore: 100, step: 0.5 },
      { id: 'crit_qa_2', name: 'Composure & Quick Wit', description: 'Poise under bright stage pressure and immediate delivery', weight: 30, minScore: 60, maxScore: 100, step: 0.5 },
      { id: 'crit_qa_3', name: 'Diction & Universal Appeal', description: 'Vocabulary, articulation, global ambassador readiness', weight: 20, minScore: 60, maxScore: 100, step: 0.5 }
    ]
  }
];

// Helper to calculate weighted score
function calcWeighted(scores: Record<string, number>, criteria: { id: string; weight: number }[]): number {
  let total = 0;
  criteria.forEach((c) => {
    const val = scores[c.id] || 0;
    total += (val * c.weight) / 100;
  });
  return Math.round(total * 100) / 100;
}

// Seed initial realistic scores for earlier locked rounds
export function generateInitialScores(): ScoreEntry[] {
  const scores: ScoreEntry[] = [];
  const judges = initialUsers.filter((u) => u.role === 'judge');
  const pastSegments = [initialSegments[0], initialSegments[1], initialSegments[2]];

  // Base profile ratings for each candidate to create authentic variance
  const profiles: Record<string, { sw: number; eg: number; ad: number }> = {
    c_01: { sw: 96, eg: 94, ad: 93 }, // Elena Solis
    c_02: { sw: 94, eg: 95, ad: 96 }, // Maya Chen
    c_03: { sw: 93, eg: 97, ad: 95 }, // Amara Okoro
    c_04: { sw: 95, eg: 93, ad: 94 }, // Sofia Martinez
    c_05: { sw: 91, eg: 92, ad: 92 }, // Chloe Vance
    c_06: { sw: 89, eg: 88, ad: 89 }, // Isabella Rossi
    c_07: { sw: 88, eg: 89, ad: 87 }, // Nicole Sterling
    c_08: { sw: 87, eg: 86, ad: 88 }  // Victoria Laurent
  };

  pastSegments.forEach((segment) => {
    const isTop10Only = segment.id === 'seg_advocacy';
    const applicableContestants = isTop10Only 
      ? initialContestants.filter(c => c.status === 'finalist') 
      : initialContestants;

    applicableContestants.forEach((c) => {
      judges.forEach((j) => {
        const baseKey = segment.id === 'seg_swimwear' ? 'sw' : segment.id === 'seg_evening_gown' ? 'eg' : 'ad';
        const baseScore = profiles[c.id][baseKey];
        // small variation per judge
        const delta = ((j.judgeNumber || 1) % 3) * 0.8 - 0.4;
        
        const scoreMap: Record<string, number> = {};
        segment.criteria.forEach((crit, idx) => {
          const critVar = idx === 0 ? 0.5 : idx === 1 ? -0.2 : 0.1;
          const score = Math.min(99.5, Math.max(75, Math.round((baseScore + delta + critVar) * 2) / 2));
          scoreMap[crit.id] = score;
        });

        const totalScore = calcWeighted(scoreMap, segment.criteria);

        scores.push({
          id: `score_${segment.id}_${c.id}_${j.id}`,
          judgeId: j.id,
          judgeName: j.name,
          judgeNumber: j.judgeNumber || 1,
          contestantId: c.id,
          segmentId: segment.id,
          scores: scoreMap,
          totalScore,
          remarks: totalScore >= 95 ? 'Outstanding stage impact and flawless execution.' : 'Very strong performance.',
          submittedAt: new Date(Date.now() - 3600000 + (j.judgeNumber || 1) * 60000).toISOString(),
          status: 'verified',
          digitalSignature: `SIG_${j.id.slice(0, 6).toUpperCase()}_VERIFIED_OK`
        });
      });
    });
  });

  // For final Q&A, let Judge 1 and Judge 2 already submit a few candidate scores, 
  // while Judge 3, 4, 5 are still in progress, providing a live event dynamic!
  const finalSeg = initialSegments[3];
  const top5 = initialContestants.filter(c => c.status === 'finalist');

  // Judge 1 submitted for candidate 1 & 2
  [top5[0], top5[1]].forEach((c, idx) => {
    const j = judges[0];
    const scoreMap: Record<string, number> = {
      crit_qa_1: idx === 0 ? 96.5 : 95.0,
      crit_qa_2: idx === 0 ? 95.0 : 96.0,
      crit_qa_3: idx === 0 ? 97.0 : 94.5
    };
    scores.push({
      id: `score_${finalSeg.id}_${c.id}_${j.id}`,
      judgeId: j.id,
      judgeName: j.name,
      judgeNumber: j.judgeNumber || 1,
      contestantId: c.id,
      segmentId: finalSeg.id,
      scores: scoreMap,
      totalScore: calcWeighted(scoreMap, finalSeg.criteria),
      remarks: 'Articulate, timely, and deeply compelling answer.',
      submittedAt: new Date(Date.now() - 600000).toISOString(),
      status: 'submitted',
      digitalSignature: `SIG_${j.id.slice(0, 6).toUpperCase()}_BALLOT_OK`
    });
  });

  return scores;
}

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log_01',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    userId: 'user_admin',
    userName: 'Victoria Sterling',
    userRole: 'admin',
    action: 'SEGMENT_LOCKED',
    details: 'Locked Swimwear & Fitness preliminary round after all 5 judges submitted ballots.',
    hash: '0x8f2a93c7'
  },
  {
    id: 'log_02',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    userId: 'user_auditor',
    userName: 'Arthur Pendelton, CPA',
    userRole: 'auditor',
    action: 'AUDITOR_CERTIFIED',
    details: 'Audited and certified Evening Gown results. All judge signatures verified with zero discrepancy.',
    hash: '0x3e1b74a1'
  },
  {
    id: 'log_03',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    userId: 'user_admin',
    userName: 'Victoria Sterling',
    userRole: 'admin',
    action: 'PHASE_ADVANCED',
    details: 'Tabulated Top 10 cut and advanced candidates to Advocacy round.',
    hash: '0x99dc45b2'
  },
  {
    id: 'log_04',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'user_admin',
    userName: 'Victoria Sterling',
    userRole: 'admin',
    action: 'PHASE_ADVANCED',
    details: 'Advanced Top 5 Finalists to the Final Q&A Round.',
    hash: '0x5c72e0fa'
  }
];
