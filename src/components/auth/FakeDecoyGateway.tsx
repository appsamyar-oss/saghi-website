import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Terminal, Lock, RefreshCw, Cpu, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface FakeDecoyGatewayProps {
  onClose: () => void;
}

export const FakeDecoyGateway: React.FC<FakeDecoyGatewayProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Establishing isolated enclave connection...',
    '[AUTH] Handshaking with Gateway Node 0x889A-V...',
    '[CHALLENGE] Calculating zero-knowledge proof digest...',
  ]);
  const [progress, setProgress] = useState(12);
  const [fakeOtp, setFakeOtp] = useState('');
  const [stage, setStage] = useState<'analyzing' | 'infinite_challenge' | 'quarantined'>('analyzing');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          return 94 + (Math.floor(Math.random() * 5));
        }
        return prev + Math.floor(Math.random() * 7) + 2;
      });
    }, 1200);

    const logTimer = setInterval(() => {
      const randomLogs = [
        `[SYNC] Validating ephemeral nonce: 0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`,
        `[ENCLAVE] Dynamic memory page remapping in progress...`,
        `[SECURITY] Verifying asymmetric telemetry signatures...`,
        `[CIPHER] Re-evaluating cryptographic token lattice...`,
        `[NODE] Gateway load balancing across pseudo-clusters...`,
      ];
      setLogs((prev) => [...prev.slice(-6), randomLogs[Math.floor(Math.random() * randomLogs.length)]]);
    }, 2400);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-zinc-950 border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden font-mono"
      >
        {/* Ambient warning halo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-red-400 tracking-wider uppercase">
              Isolated Gateway Enclave #0x99A
            </h2>
            <p className="text-[10px] text-white/40">
              Protocol: AES-GCM-512 / Decoy Sandbox Active
            </p>
          </div>
        </div>

        {/* Fake Progress Meter */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              Synchronizing Security Lattice...
            </span>
            <span className="text-amber-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Decoy Terminal Stream */}
        <div className="bg-black/80 rounded-2xl border border-white/10 p-4 mb-6 space-y-1.5 text-[11px] text-emerald-400/90 font-mono h-36 overflow-hidden flex flex-col justify-end">
          <div className="text-[9px] text-white/30 border-b border-white/5 pb-1 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-white/40" />
            LIVE SECURITY STREAM
          </div>
          {logs.map((log, index) => (
            <div key={index} className="truncate">
              {log}
            </div>
          ))}
        </div>

        {/* Fake Secondary Challenge Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <Lock className="w-3.5 h-3.5" />
            <span>Multi-Factor Dynamic Enclave Challenge</span>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">
            Automated security mitigation triggered. Enter your 64-bit hardware enclave token to verify identity:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={fakeOtp}
              onChange={(e) => setFakeOtp(e.target.value)}
              placeholder="0x0000-XXXX-FFFF"
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
            />
            <button
              onClick={() => {
                setLogs((prev) => [...prev, '[FAIL] Cryptographic mismatch. Retry in 180s.']);
                setFakeOtp('');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              Verify
            </button>
          </div>
        </div>

        <p className="text-[9px] text-center text-white/30 mt-4">
          Session Token: {Math.random().toString(36).substring(2, 15).toUpperCase()} &bull; Disconnected Enclave
        </p>
      </motion.div>
    </div>
  );
};
