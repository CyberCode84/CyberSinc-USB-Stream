import React, { useState } from 'react';
import { Share2, Monitor, Usb, AlertCircle, CheckCircle2, Play, Square, Zap, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Real service wrapper for CyberSinc
const CyberSincService = {
  start: (success: (msg: string) => void, error: (msg: string) => void) => {
    if (window.CyberSinc) {
      window.CyberSinc.start(success, error);
    } else {
      // Mock for browser preview
      console.log("CyberSinc start (Mock)");
      setTimeout(() => success("CyberSinc Ativo (Preview Mode)"), 800);
    }
  },
  stop: (success: (msg: string) => void) => {
    if (window.CyberSinc) {
      window.CyberSinc.stop(success, (err: string) => console.error(err));
    } else {
      console.log("CyberSinc stop (Mock)");
      success("Stream Parada");
    }
  }
};

declare global {
  interface Window {
    CyberSinc: any;
    cordova: any;
  }
}

export default function App() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'streaming' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleToggleStreaming = () => {
    if (isStreaming) {
      CyberSincService.stop(() => {
        setIsStreaming(false);
        setStatus('idle');
      });
    } else {
      setStatus('connecting');
      CyberSincService.start(
        () => {
          setIsStreaming(true);
          setStatus('streaming');
          setErrorMessage('');
        },
        (err) => {
          setStatus('error');
          setErrorMessage(err);
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-from)_0%,_transparent_100%)] from-cyan-950/20">
      
      {/* Background GRID decoration for tech feel */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,18,18,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.3)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

      <div className="w-full max-w-md space-y-10 relative z-10 flex flex-col items-center text-center">
        
        {/* Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center justify-center gap-2 mb-2 p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Zap size={20} className="text-cyan-400 fill-cyan-400" />
            <h1 className="text-xl font-black italic tracking-tighter uppercase">CyberSinc USB Stream</h1>
          </div>
          <p className="text-zinc-500 text-[10px] tracking-[0.3em] font-bold uppercase">Pro Gaming Mode Active</p>
        </motion.div>

        {/* Transmission Core */}
        <div className="relative">
          {/* Animated rings - Dynamic based on state */}
          <AnimatePresence>
            {isStreaming && (
              <>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 border border-cyan-500/40 rounded-full"
                />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.5 }}
                  className="absolute inset-0 border border-cyan-400/20 rounded-full"
                />
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleToggleStreaming}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative z-10 w-60 h-60 rounded-full flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ${
              isStreaming 
                ? 'bg-zinc-900 border-b-4 border-red-600 text-red-500 shadow-red-500/5' 
                : 'bg-zinc-900 border-b-4 border-cyan-500 text-cyan-400 shadow-cyan-500/5 hover:border-cyan-400'
            }`}
          >
            <div className={`p-5 rounded-full transition-colors duration-500 ${isStreaming ? 'bg-red-500/10' : 'bg-cyan-500/10'}`}>
              {isStreaming ? (
                <Square size={56} fill="currentColor" className="animate-pulse" />
              ) : (
                <Smartphone size={56} className="text-cyan-400" />
              )}
            </div>
            <span className="font-black text-sm tracking-widest uppercase">
              {isStreaming ? 'PARAR TRANSMISSÃO' : 'INICIAR ESPELHAMENTO'}
            </span>
          </motion.button>
        </div>

        {/* Dashboard Panels */}
        <motion.div 
          layout
          className="w-full bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] p-6 flex flex-col gap-5"
        >
          {/* Main Status Bar */}
          <div className="flex items-center justify-between bg-zinc-950/50 p-2 pl-4 rounded-full border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ring-4 ${isStreaming ? 'bg-green-500 ring-green-500/20 animate-pulse' : 'bg-zinc-700 ring-zinc-700/10'}`} />
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Engine Status</span>
            </div>
            <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase ${
              status === 'streaming' ? 'bg-green-500/10 text-green-500' :
              status === 'connecting' ? 'bg-cyan-500/10 text-cyan-500' :
              status === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {status === 'streaming' ? 'Broadcasting 60FPS' :
               status === 'connecting' ? 'Syncing...' :
               status === 'error' ? 'Critical Error' : 'Ready'}
            </span>
          </div>

          {/* Perf Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950/50 rounded-3xl p-4 flex flex-col items-center gap-1 border border-white/5">
              <Monitor size={16} className="text-zinc-500 mb-1" />
              <span className="text-[9px] text-zinc-600 uppercase font-bold">Latency</span>
              <span className="text-sm font-black text-cyan-400 tracking-tight">0 MS</span>
            </div>
            <div className="bg-zinc-950/50 rounded-3xl p-4 flex flex-col items-center gap-1 border border-white/5">
              <Share2 size={16} className="text-zinc-500 mb-1" />
              <span className="text-[9px] text-zinc-600 uppercase font-bold">Frame Rate</span>
              <span className="text-sm font-black text-cyan-400 tracking-tight">60 FPS</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'error' && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-3xl text-red-400"
              >
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase mb-1">System Interrupt</p>
                  <p className="text-xs font-medium leading-tight opacity-80">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {(status === 'streaming' || status === 'idle') && (
              <motion.div 
                key={status}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-3xl text-zinc-400"
              >
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Usb size={20} className="text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase text-cyan-400 mb-0.5">Plug & Play Optimization</p>
                  <p className="text-[11px] font-medium leading-none opacity-60">
                    {status === 'streaming' 
                      ? 'Injetando H.264 direto no Barramento USB...' 
                      : 'Aguardando conexão AOA no receptor...'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Technical Footer */}
        <div className="pt-4 flex flex-col items-center gap-2">
           <div className="px-4 py-1.5 bg-zinc-900 rounded-full border border-zinc-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Zero Latency Protocol v1.4</span>
           </div>
        </div>
      </div>
    </div>
  );
}
