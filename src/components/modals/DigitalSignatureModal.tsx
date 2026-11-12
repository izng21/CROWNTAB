import React, { useRef, useState, useEffect } from 'react';
import { ShieldCheck, X, RotateCcw, Check } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureData: string) => void;
  title: string;
  subtitle: string;
  signeeName: string;
  signeeRole: string;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  signeeName,
  signeeRole
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [useTypeSignature, setUseTypeSignature] = useState(false);
  const [typedName, setTypedName] = useState(signeeName);

  useEffect(() => {
    if (isOpen) {
      setHasDrawn(false);
      setTypedName(signeeName);
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#f59e0b'; // amber gold
          }
        }
      }, 50);
    }
  }, [isOpen, signeeName]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleConfirm = () => {
    let sigData = '';
    if (useTypeSignature || !hasDrawn) {
      sigData = `TYPED_SIG_${typedName.toUpperCase().replace(/\s+/g, '_')}_${Date.now()}`;
    } else {
      const canvas = canvasRef.current;
      sigData = canvas ? canvas.toDataURL('image/png') : `SIG_${Date.now()}`;
    }
    sounds.playTap();
    onConfirm(sigData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">
              {useTypeSignature ? 'Digital Name Signature' : 'Draw Digital Signature on Touchpad'}
            </span>
            <button
              type="button"
              onClick={() => setUseTypeSignature(!useTypeSignature)}
              className="text-xs text-amber-400 hover:underline"
            >
              {useTypeSignature ? 'Switch to Touchpad Draw' : 'Switch to Type Name'}
            </button>
          </div>

          {useTypeSignature ? (
            <div className="space-y-3">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your official full name"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-serif text-lg tracking-wider focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400">
                By typing your name, you certify under penalty of pageant disqualification that all entered scores reflect your honest professional judgment.
              </p>
            </div>
          ) : (
            <div className="relative border border-slate-700 bg-slate-950 rounded-xl overflow-hidden">
              <canvas
                ref={canvasRef}
                width={460}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 cursor-crosshair touch-none"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-500">
                  Sign here using mouse or finger
                </div>
              )}
              {hasDrawn && (
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="absolute bottom-2 right-2 px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-800 rounded-md text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          )}

          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Signee:</span>
              <span className="font-medium text-slate-200">{signeeName}</span>
            </div>
            <div className="flex justify-between">
              <span>Official Capacity:</span>
              <span className="font-medium text-amber-400">{signeeRole}</span>
            </div>
            <div className="flex justify-between">
              <span>Timestamp:</span>
              <span className="font-mono text-slate-400">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Certify & Submit Ballot
          </button>
        </div>
      </div>
    </div>
  );
};
