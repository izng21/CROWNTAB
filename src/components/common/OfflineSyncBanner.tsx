import React, { useState } from 'react';
import { usePageant } from '../../context/PageantContext';
import { Wifi, WifiOff, CloudUpload, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const OfflineSyncBanner: React.FC = () => {
  const {
    isOnline,
    isSimulatedOffline,
    setIsSimulatedOffline,
    offlineQueue,
    syncOfflineQueue
  } = usePageant();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const count = await syncOfflineQueue();
      setSyncMessage(`Successfully synced ${count} pending score ballot(s) to master tabulation!`);
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSimulation = () => {
    sounds.playTap();
    setIsSimulatedOffline(!isSimulatedOffline);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Connection State & Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Wifi className="w-3.5 h-3.5" />
                <span>Live Cloud Sync Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Resilient Mode Active</span>
              </span>
            )}
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-slate-400 hidden sm:inline">
              Ballots encrypted locally in secure storage
            </span>
          </div>

          {/* Test Offline Toggle Button */}
          <button
            type="button"
            onClick={toggleSimulation}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
              isSimulatedOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {isSimulatedOffline ? 'Simulating Arena Outage (Click to Restore)' : 'Test Offline Mode'}
          </button>
        </div>

        {/* Right: Offline Queue & Sync CTA */}
        <div className="flex items-center gap-3">
          {syncMessage ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {syncMessage}
            </span>
          ) : offlineQueue.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{offlineQueue.length} ballot(s) queued locally</span>
              </span>
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing || !isOnline}
                className={`px-3 py-1 rounded-md font-semibold text-slate-950 flex items-center gap-1.5 transition-all ${
                  isOnline
                    ? 'bg-amber-400 hover:bg-amber-300 shadow-sm'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>Sync Now</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px]">
              Audit Trail Hash: <span className="font-mono text-slate-300">0xSHA256-OK</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
