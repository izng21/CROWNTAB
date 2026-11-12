export type UserRole = 'admin' | 'judge' | 'auditor' | 'emcee';

export type RankingSystem = 
  | 'weighted_average'     // Standard weighted criteria & judge average
  | 'olympic_drop_high_low' // Drops highest and lowest judge score to eliminate bias
  | 'raw_total'            // Total sum of points
  | 'rank_points';         // Ordinal rank points (1st = 1 pt, lowest sum wins)

export type CompetitionPhase = 
  | 'preliminaries' 
  | 'top10' 
  | 'top5' 
  | 'final_coronation';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  pin: string;
  avatar?: string;
  judgeNumber?: number; // 1 to 5 for judges
  isAssigned?: boolean;
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number; // e.g., 30 for 30%
  maxScore: number; // e.g., 10 or 100
  minScore: number; // e.g., 6 or 60
  step: number; // e.g., 0.1 or 0.5
}

export interface Segment {
  id: string;
  name: string;
  subtitle: string;
  weight: number; // percentage in overall total (e.g., 30%)
  criteria: Criterion[];
  isLocked: boolean;
  phase: CompetitionPhase;
  applicableContestantCount?: number; // e.g. all (8), 5, or 3
}

export interface Contestant {
  id: string;
  number: number;
  name: string;
  representing: string; // e.g., "Miss California", "Miss Georgia"
  age: number;
  height: string;
  hometown: string;
  advocacy: string;
  photoUrl: string;
  status: 'active' | 'semi_finalist' | 'finalist' | 'eliminated' | 'crowned_winner';
  specialAwards?: string[]; // e.g. ["Best in Evening Gown", "Miss Photogenic"]
}

export interface ScoreCriterionMap {
  [criterionId: string]: number;
}

export interface ScoreEntry {
  id: string;
  judgeId: string;
  judgeName: string;
  judgeNumber: number;
  contestantId: string;
  segmentId: string;
  scores: ScoreCriterionMap;
  totalScore: number; // Calculated weighted score for this segment from this judge
  remarks?: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'verified';
  digitalSignature?: string;
  signatureTimestamp?: string;
  isOfflineQueued?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 
    | 'JUDGE_LOGIN' 
    | 'SCORE_SUBMITTED' 
    | 'SCORE_MODIFIED' 
    | 'AUDITOR_OVERRIDE' 
    | 'SEGMENT_LOCKED' 
    | 'SEGMENT_UNLOCKED' 
    | 'RANKING_SYSTEM_CHANGED'
    | 'PHASE_ADVANCED' 
    | 'AUDITOR_CERTIFIED' 
    | 'OFFLINE_SYNC_EXECUTED'
    | 'REPORT_EXPORTED';
  details: string;
  hash: string;
}

export interface TabulationSummaryRow {
  contestant: Contestant;
  segmentScores: {
    [segmentId: string]: {
      rawAverage: number;
      effectiveScore: number; // after olympic or weighting
      judgeScores: { [judgeId: string]: number };
      isComplete: boolean;
    };
  };
  totalWeightedScore: number;
  rankPoints: number; // sum of ordinal ranks across judges
  currentRank: number;
  isTied: boolean;
  tieBreakOrder?: number;
}

export interface EventConfig {
  eventName: string;
  edition: string;
  venue: string;
  date: string;
  hostCity: string;
  sanctioningBody: string;
  activeSegmentId: string;
  currentPhase: CompetitionPhase;
  rankingSystem: RankingSystem;
  allowSelfUnlocking: boolean;
  auditorCertified: boolean;
  auditorSignature?: string;
  auditorCertifiedAt?: string;
  organizerSignature?: string;
}
