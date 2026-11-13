import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, 
  UserRole, 
  Contestant, 
  Segment, 
  ScoreEntry, 
  EventConfig, 
  AuditLogEntry, 
  RankingSystem, 
  CompetitionPhase,
  TabulationSummaryRow
} from '../types/pageant';
import { 
  initialConfig, 
  initialUsers, 
  initialContestants, 
  initialSegments, 
  generateInitialScores, 
  initialAuditLogs 
} from '../data/initialData';
import { sounds } from '../utils/soundEffects';

interface PageantContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  contestants: Contestant[];
  segments: Segment[];
  scores: ScoreEntry[];
  eventConfig: EventConfig;
  auditLogs: AuditLogEntry[];
  offlineQueue: ScoreEntry[];
  isOnline: boolean;
  isSimulatedOffline: boolean;
  setIsSimulatedOffline: (sim: boolean) => void;
  soundMuted: boolean;
  setSoundMuted: (muted: boolean) => void;
  activeView: 'judge_pad' | 'organizer_dashboard' | 'rankings' | 'audit_trail' | 'emcee_stage' | 'reports';
  setActiveView: (view: 'judge_pad' | 'organizer_dashboard' | 'rankings' | 'audit_trail' | 'emcee_stage' | 'reports') => void;
  
  // Customization Actions
  updateEventConfig: (updates: Partial<EventConfig>) => void;
  setJudgeCount: (count: number) => void;
  updateJudge: (judgeId: string, updates: Partial<User>) => void;
  deleteContestant: (id: string) => void;
  updateSegment: (segmentId: string, updates: Partial<Segment>) => void;
  allUsers: User[];

  // Operational Actions
  submitJudgeScore: (entry: Omit<ScoreEntry, 'id' | 'submittedAt' | 'status'>, signature?: string) => Promise<{ success: boolean; isOffline: boolean }>;
  syncOfflineQueue: () => Promise<number>;
  toggleSegmentLock: (segmentId: string) => void;
  setActiveSegment: (segmentId: string) => void;
  setRankingSystem: (system: RankingSystem) => void;
  advanceCompetitionPhase: (phase: CompetitionPhase) => void;
  certifyAuditorResults: (auditorName: string, signature: string) => void;
  overrideScoreByAuditor: (scoreId: string, newTotalScore: number, reason: string) => void;
  addContestant: (contestant: Omit<Contestant, 'id'>) => void;
  updateContestant: (id: string, updates: Partial<Contestant>) => void;
  resetDemoData: () => void;
  
  // Calculated Tabulations
  tabulationRankings: TabulationSummaryRow[];
  activeSegment: Segment;
  judges: User[];
  hasPendingOfflineScores: boolean;
}

const STORAGE_KEYS = {
  CONFIG: 'crowntab_config_v1',
  CONTESTANTS: 'crowntab_contestants_v1',
  SEGMENTS: 'crowntab_segments_v1',
  SCORES: 'crowntab_scores_v1',
  AUDIT: 'crowntab_audit_v1',
  OFFLINE: 'crowntab_offline_queue_v1',
  CURRENT_USER: 'crowntab_current_user_v1',
  USERS: 'crowntab_users_v1'
};

const PageantContext = createContext<PageantContextType | null>(null);

export const PageantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State Hydration with LocalStorage Fallback
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialUsers;
  });
  
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default to Judge 1 to directly experience the mobile judging tablet, or user can toggle to Admin
    return initialUsers.find(u => u.id === 'user_judge_1') || initialUsers[0];
  });

  const [eventConfig, setEventConfig] = useState<EventConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialConfig;
  });

  const [contestants, setContestants] = useState<Contestant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTESTANTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialContestants;
  });

  const [segments, setSegments] = useState<Segment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEGMENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialSegments;
  });

  const [scores, setScores] = useState<ScoreEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCORES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return generateInitialScores();
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialAuditLogs;
  });

  const [offlineQueue, setOfflineQueue] = useState<ScoreEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Network status & simulation
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [soundMuted, setSoundMutedState] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'judge_pad' | 'organizer_dashboard' | 'rankings' | 'audit_trail' | 'emcee_stage' | 'reports'>('judge_pad');

  const isOnline = isBrowserOnline && !isSimulatedOffline;

  // Sync sounds state
  const setSoundMuted = useCallback((muted: boolean) => {
    setSoundMutedState(muted);
    sounds.setMuted(muted);
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(eventConfig));
    } catch {}
  }, [eventConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTESTANTS, JSON.stringify(contestants));
    } catch {}
  }, [contestants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SEGMENTS, JSON.stringify(segments));
    } catch {}
  }, [segments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
    } catch {}
  }, [scores]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE, JSON.stringify(offlineQueue));
    } catch {}
  }, [offlineQueue]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cross-Tab Real-time BroadcastChannel Sync
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('crowntab_realtime_sync');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'SCORE_UPDATE') {
            setScores((prev) => {
              const existingIndex = prev.findIndex((s) => s.id === payload.id);
              if (existingIndex >= 0) {
                const next = [...prev];
                next[existingIndex] = payload;
                return next;
              }
              return [...prev, payload];
            });
          } else if (type === 'CONFIG_UPDATE') {
            setEventConfig(payload);
          } else if (type === 'SEGMENTS_UPDATE') {
            setSegments(payload);
          } else if (type === 'AUDIT_LOG') {
            setAuditLogs((prev) => [payload, ...prev]);
          }
        };
      }
    } catch {}
    return () => {
      if (channel) channel.close();
    };
  }, []);

  const broadcastEvent = (type: string, payload: any) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('crowntab_realtime_sync');
        channel.postMessage({ type, payload });
        setTimeout(() => channel.close(), 100);
      }
    } catch {}
  };

  // Log Audit Entry Helper
  const addAuditLog = useCallback((action: AuditLogEntry['action'], details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      hash: `0x${Math.floor(Math.random() * 0xffffffff).toString(16)}`
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
    broadcastEvent('AUDIT_LOG', newEntry);
  }, [currentUser]);

  // Submit Judge Score with Offline Queueing
  const submitJudgeScore = useCallback(
    async (entryData: Omit<ScoreEntry, 'id' | 'submittedAt' | 'status'>, signature?: string) => {
      const id = `score_${entryData.segmentId}_${entryData.contestantId}_${entryData.judgeId}`;
      const now = new Date().toISOString();

      const newScore: ScoreEntry = {
        ...entryData,
        id,
        submittedAt: now,
        status: isOnline ? 'submitted' : 'draft',
        digitalSignature: signature || `SIG_${entryData.judgeId.slice(0, 6).toUpperCase()}_${Date.now()}`,
        signatureTimestamp: now,
        isOfflineQueued: !isOnline
      };

      if (!isOnline) {
        // Queue locally
        setOfflineQueue((prev) => {
          const filtered = prev.filter((item) => item.id !== id);
          return [...filtered, newScore];
        });
        sounds.playTap();
        return { success: true, isOffline: true };
      }

      // Online: write to state and broadcast
      setScores((prev) => {
        const filtered = prev.filter((item) => item.id !== id);
        return [...filtered, newScore];
      });

      broadcastEvent('SCORE_UPDATE', newScore);

      const contestant = contestants.find((c) => c.id === entryData.contestantId);
      const segment = segments.find((s) => s.id === entryData.segmentId);
      addAuditLog(
        'SCORE_SUBMITTED',
        `Ballot submitted for Candidate #${contestant?.number} (${contestant?.name}) in ${segment?.name} with total ${entryData.totalScore.toFixed(2)} pts.`
      );

      sounds.playSubmitChime();
      return { success: true, isOffline: false };
    },
    [isOnline, contestants, segments, addAuditLog]
  );

  // Sync Offline Queue
  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return 0;

    const count = offlineQueue.length;
    const syncedScores = offlineQueue.map((s) => ({
      ...s,
      status: 'submitted' as const,
      isOfflineQueued: false,
      submittedAt: new Date().toISOString()
    }));

    setScores((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]));
      syncedScores.forEach((s) => map.set(s.id, s));
      return Array.from(map.values());
    });

    setOfflineQueue([]);

    syncedScores.forEach((s) => broadcastEvent('SCORE_UPDATE', s));

    addAuditLog(
      'OFFLINE_SYNC_EXECUTED',
      `Synchronized ${count} pending judge score ballot(s) from local offline queue.`
    );

    sounds.playSubmitChime();
    return count;
  }, [offlineQueue, addAuditLog]);

  // Lock / Unlock Segment
  const toggleSegmentLock = useCallback(
    (segmentId: string) => {
      setSegments((prev) => {
        const next = prev.map((seg) => {
          if (seg.id === segmentId) {
            const nextLocked = !seg.isLocked;
            addAuditLog(
              nextLocked ? 'SEGMENT_LOCKED' : 'SEGMENT_UNLOCKED',
              `${seg.name} was ${nextLocked ? 'LOCKED' : 'UNLOCKED'} by ${currentUser.name}.`
            );
            return { ...seg, isLocked: nextLocked };
          }
          return seg;
        });
        broadcastEvent('SEGMENTS_UPDATE', next);
        return next;
      });
      sounds.playAuditStamp();
    },
    [currentUser.name, addAuditLog]
  );

  // Set Active Segment
  const setActiveSegment = useCallback(
    (segmentId: string) => {
      setEventConfig((prev) => {
        const next = { ...prev, activeSegmentId: segmentId };
        broadcastEvent('CONFIG_UPDATE', next);
        return next;
      });
      sounds.playTap();
    },
    []
  );

  // Set Ranking System
  const setRankingSystem = useCallback(
    (system: RankingSystem) => {
      setEventConfig((prev) => {
        const next = { ...prev, rankingSystem: system };
        broadcastEvent('CONFIG_UPDATE', next);
        return next;
      });
      addAuditLog('RANKING_SYSTEM_CHANGED', `Ranking tabulation algorithm set to: ${system.toUpperCase()}`);
      sounds.playTap();
    },
    [addAuditLog]
  );

  // Advance Competition Phase
  const advanceCompetitionPhase = useCallback(
    (phase: CompetitionPhase) => {
      setEventConfig((prev) => {
        const next = { ...prev, currentPhase: phase };
        broadcastEvent('CONFIG_UPDATE', next);
        return next;
      });

      // Update contestant statuses according to cut
      if (phase === 'top5') {
        // Keep top 5 as finalist, mark others as semi_finalist or eliminated
        setContestants((prev) =>
          prev.map((c, i) => (i < 5 ? { ...c, status: 'finalist' } : { ...c, status: 'semi_finalist' }))
        );
      } else if (phase === 'final_coronation') {
        // Ready for winners announcement
      }

      addAuditLog('PHASE_ADVANCED', `Competition advanced to phase: ${phase.toUpperCase()}`);
      sounds.playFanfare();
    },
    [addAuditLog]
  );

  // Certify by Auditor
  const certifyAuditorResults = useCallback(
    (auditorName: string, signature: string) => {
      const now = new Date().toISOString();
      setEventConfig((prev) => {
        const next = {
          ...prev,
          auditorCertified: true,
          auditorSignature: signature,
          auditorCertifiedAt: now
        };
        broadcastEvent('CONFIG_UPDATE', next);
        return next;
      });
      addAuditLog(
        'AUDITOR_CERTIFIED',
        `Official Tabulation Results certified and sealed by External Auditor ${auditorName}. Signature: ${signature.slice(0, 14)}...`
      );
      sounds.playAuditStamp();
    },
    [addAuditLog]
  );

  // Auditor Score Override
  const overrideScoreByAuditor = useCallback(
    (scoreId: string, newTotalScore: number, reason: string) => {
      setScores((prev) => {
        const existing = prev.find((s) => s.id === scoreId);
        if (!existing) return prev;
        const updated: ScoreEntry = {
          ...existing,
          totalScore: newTotalScore,
          status: 'verified',
          remarks: `[AUDITOR OVERRIDE: ${reason}] ${existing.remarks || ''}`
        };
        const next = prev.map((s) => (s.id === scoreId ? updated : s));
        broadcastEvent('SCORE_UPDATE', updated);
        return next;
      });

      addAuditLog(
        'AUDITOR_OVERRIDE',
        `Auditor ${currentUser.name} executed score adjustment on ballot (${scoreId}) to ${newTotalScore.toFixed(2)}. Justification: ${reason}`
      );
      sounds.playAuditStamp();
    },
    [currentUser.name, addAuditLog]
  );

  // Pageant Event Customization
  const updateEventConfig = useCallback(
    (updates: Partial<EventConfig>) => {
      setEventConfig((prev) => {
        const next = { ...prev, ...updates };
        broadcastEvent('CONFIG_UPDATE', next);
        return next;
      });
      addAuditLog('PAGEANT_CONFIG_UPDATED', `Updated pageant configuration: ${Object.keys(updates).join(', ')}`);
      sounds.playTap();
    },
    [addAuditLog]
  );

  const setJudgeCount = useCallback(
    (count: number) => {
      const clamped = Math.max(1, Math.min(7, count));
      setEventConfig((prev) => {
        const next = { ...prev, judgeCount: clamped };
        broadcastEvent('CONFIG_UPDATE', next);
        return next;
      });
      addAuditLog('JUDGES_CONFIG_UPDATED', `Active Board of Judges set to ${clamped} judge(s).`);
      sounds.playTap();
    },
    [addAuditLog]
  );

  const updateJudge = useCallback(
    (judgeId: string, updates: Partial<User>) => {
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === judgeId ? { ...u, ...updates } : u));
        try {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(next));
        } catch {}
        broadcastEvent('USERS_UPDATE', next);
        return next;
      });
      addAuditLog('JUDGES_CONFIG_UPDATED', `Updated credentials for ${updates.name || judgeId}`);
      sounds.playTap();
    },
    [addAuditLog]
  );

  // Contestant CRUD
  const addContestant = useCallback(
    (data: Omit<Contestant, 'id'>) => {
      const newContestant: Contestant = {
        ...data,
        id: `c_${Date.now()}`
      };
      setContestants((prev) => [...prev, newContestant]);
      addAuditLog('CONTESTANT_ADDED', `Added candidate #${newContestant.number} - ${newContestant.name} (${newContestant.representing})`);
      sounds.playTap();
    },
    [addAuditLog]
  );

  const updateContestant = useCallback(
    (id: string, updates: Partial<Contestant>) => {
      setContestants((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      addAuditLog('CONTESTANT_UPDATED', `Updated candidate details for ${updates.name || id}`);
      sounds.playTap();
    },
    [addAuditLog]
  );

  const deleteContestant = useCallback(
    (id: string) => {
      const found = contestants.find((c) => c.id === id);
      setContestants((prev) => prev.filter((c) => c.id !== id));
      setScores((prev) => prev.filter((s) => s.contestantId !== id));
      addAuditLog('CONTESTANT_DELETED', `Removed candidate #${found?.number} (${found?.name})`);
      sounds.playTap();
    },
    [contestants, addAuditLog]
  );

  const updateSegment = useCallback(
    (segmentId: string, updates: Partial<Segment>) => {
      setSegments((prev) => {
        const next = prev.map((s) => (s.id === segmentId ? { ...s, ...updates } : s));
        broadcastEvent('SEGMENTS_UPDATE', next);
        return next;
      });
      sounds.playTap();
    },
    []
  );

  // Reset demo data
  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.CONTESTANTS);
    localStorage.removeItem(STORAGE_KEYS.SEGMENTS);
    localStorage.removeItem(STORAGE_KEYS.SCORES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.USERS);

    setEventConfig(initialConfig);
    setContestants(initialContestants);
    setSegments(initialSegments);
    setScores(generateInitialScores());
    setAuditLogs(initialAuditLogs);
    setOfflineQueue([]);
    setUsers(initialUsers);
    setCurrentUser(initialUsers[2]); // Judge 1
    sounds.playTap();
  }, []);

  // Filter judges strictly according to organizer configured count (1-5 or custom)
  const judges = useMemo(() => {
    const targetCount = eventConfig.judgeCount || 5;
    return users
      .filter((u) => u.role === 'judge')
      .slice(0, targetCount);
  }, [users, eventConfig.judgeCount]);

  const activeSegment = useMemo(
    () => segments.find((s) => s.id === eventConfig.activeSegmentId) || segments[0],
    [segments, eventConfig.activeSegmentId]
  );

  // TABULATION ENGINE CALCULATION
  const tabulationRankings = useMemo<TabulationSummaryRow[]>(() => {
    const totalWeights = segments.reduce((sum, s) => sum + s.weight, 0);

    const rows: TabulationSummaryRow[] = contestants.map((contestant) => {
      const segmentScoresMap: TabulationSummaryRow['segmentScores'] = {};
      let totalWeightedScore = 0;
      let totalRankPoints = 0;

      segments.forEach((segment) => {
        const contestantSegmentScores = scores.filter(
          (s) => s.contestantId === contestant.id && s.segmentId === segment.id && s.status !== 'draft'
        );

        const judgeScoreObj: Record<string, number> = {};
        const scoreValues: number[] = [];

        judges.forEach((j) => {
          const entry = contestantSegmentScores.find((s) => s.judgeId === j.id);
          if (entry) {
            judgeScoreObj[j.id] = entry.totalScore;
            scoreValues.push(entry.totalScore);
          }
        });

        const isComplete = scoreValues.length >= judges.length;
        let rawAverage = 0;
        let effectiveScore = 0;

        if (scoreValues.length > 0) {
          rawAverage = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;

          if (eventConfig.rankingSystem === 'olympic_drop_high_low' && scoreValues.length >= 4) {
            // Drop highest and lowest score
            const sorted = [...scoreValues].sort((a, b) => a - b);
            const trimmed = sorted.slice(1, sorted.length - 1);
            effectiveScore = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
          } else {
            effectiveScore = rawAverage;
          }
        }

        segmentScoresMap[segment.id] = {
          rawAverage,
          effectiveScore,
          judgeScores: judgeScoreObj,
          isComplete
        };

        // Contribution to overall score based on segment weight
        if (totalWeights > 0) {
          totalWeightedScore += (effectiveScore * segment.weight) / totalWeights;
        }
      });

      return {
        contestant,
        segmentScores: segmentScoresMap,
        totalWeightedScore: Math.round(totalWeightedScore * 100) / 100,
        rankPoints: totalRankPoints,
        currentRank: 1,
        isTied: false
      };
    });

    // Calculate Ordinal Rank Points across judges if system is 'rank_points'
    if (eventConfig.rankingSystem === 'rank_points') {
      judges.forEach((j) => {
        // Rank all contestants for this judge
        const judgeContestantScores = rows.map((r) => {
          let jTotal = 0;
          segments.forEach((seg) => {
            const val = r.segmentScores[seg.id]?.judgeScores[j.id] || 0;
            jTotal += (val * seg.weight) / totalWeights;
          });
          return { contestantId: r.contestant.id, score: jTotal };
        });

        judgeContestantScores.sort((a, b) => b.score - a.score);
        judgeContestantScores.forEach((item, index) => {
          const targetRow = rows.find((r) => r.contestant.id === item.contestantId);
          if (targetRow) {
            targetRow.rankPoints += index + 1; // 1st gets 1 pt, 2nd gets 2 pts
          }
        });
      });

      // For rank points, lower points is better
      rows.sort((a, b) => a.rankPoints - b.rankPoints);
    } else {
      // For weighted_average, olympic, raw_total, higher score is better
      rows.sort((a, b) => b.totalWeightedScore - a.totalWeightedScore);
    }

    // Assign ranks & flag ties
    rows.forEach((row, idx) => {
      row.currentRank = idx + 1;
      const prev = rows[idx - 1];
      const next = rows[idx + 1];

      const scoreMatches = (a: TabulationSummaryRow, b?: TabulationSummaryRow) => {
        if (!b) return false;
        return eventConfig.rankingSystem === 'rank_points'
          ? a.rankPoints === b.rankPoints
          : Math.abs(a.totalWeightedScore - b.totalWeightedScore) < 0.001;
      };

      row.isTied = scoreMatches(row, prev) || scoreMatches(row, next);
    });

    return rows;
  }, [contestants, segments, scores, judges, eventConfig.rankingSystem]);

  return (
    <PageantContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        contestants,
        segments,
        scores,
        eventConfig,
        auditLogs,
        offlineQueue,
        isOnline,
        isSimulatedOffline,
        setIsSimulatedOffline,
        soundMuted,
        setSoundMuted,
        activeView,
        setActiveView,
        updateEventConfig,
        setJudgeCount,
        updateJudge,
        deleteContestant,
        updateSegment,
        allUsers: users,
        submitJudgeScore,
        syncOfflineQueue,
        toggleSegmentLock,
        setActiveSegment,
        setRankingSystem,
        advanceCompetitionPhase,
        certifyAuditorResults,
        overrideScoreByAuditor,
        addContestant,
        updateContestant,
        resetDemoData,
        tabulationRankings,
        activeSegment,
        judges,
        hasPendingOfflineScores: offlineQueue.length > 0
      }}
    >
      {children}
    </PageantContext.Provider>
  );
};

export const usePageant = () => {
  const context = useContext(PageantContext);
  if (!context) {
    throw new Error('usePageant must be used within a PageantProvider');
  }
  return context;
};
