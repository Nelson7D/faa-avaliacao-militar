'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, ArrowRight, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { TacticalBackground } from '@/components/ui/tactical-background';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState('00:00:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(now.toLocaleTimeString('pt-AO', { hour12: false, timeZone: 'Africa/Luanda' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Preencha o NIP/Email e a senha.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      router.push('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('NIP/Email ou senha incorretos.');
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiadas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      } else {
        setError(err.message || 'Erro ao autenticar. Contacte o administrador.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between items-center p-4 select-none overflow-hidden text-slate-100">
      {/* Animated Tactical Background (Radar + Polygonal Shields) */}
      <TacticalBackground variant="login" />

      {/* Top Spacer */}
      <div className="w-full pt-4 md:pt-10" />

      {/* Main Authentication Container */}
      <div className="w-full max-w-[420px] space-y-6 z-10 px-2 animate-in fade-in zoom-in-95 duration-500">
        {/* Official FAA Crest & Heading */}
        <div className="text-center space-y-2.5">
          {/* FAA Shield Badge */}
          <div className="inline-flex flex-col items-center justify-center relative mb-1">
            <div className="w-16 h-20 bg-gradient-to-b from-[#182618] to-[#0A1108] border-2 border-[#D4AF37] rounded-b-3xl rounded-t-sm shadow-[0_0_25px_rgba(212,175,55,0.35)] flex flex-col items-center justify-center p-2 relative overflow-hidden">
              <span className="text-[11px] font-black tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/40 w-full text-center pb-0.5 mb-1 font-mono">
                FAA
              </span>
              <Shield className="w-7 h-7 text-[#D4AF37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#D4AF37] to-[#B89047] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            SISTEMA FAA
          </h1>
          <p className="text-xs text-[#9EAF94] font-medium tracking-tight">
            Avaliação Individual dos Militares • Manual VII FAA
          </p>
        </div>

        {/* Tactical Glass Login Card */}
        <div className="bg-[rgba(24,34,21,0.65)] backdrop-blur-xl border border-[#758652]/40 rounded-2xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input NIP/Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                NIP ou Email Militar
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: 10048291 ou nome@faa.ao"
                className="w-full px-3.5 py-2.5 bg-[rgba(12,18,11,0.8)] border border-[#556942] rounded-lg text-xs text-slate-100 placeholder:text-[#6C7D63] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-mono"
              />
            </div>

            {/* Input Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[rgba(12,18,11,0.8)] border border-[#556942] rounded-lg text-xs text-slate-100 placeholder:text-[#6C7D63] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => alert('Para redefinição de credenciais militares, contacte a Repartição de Pessoal e Quadros (DPQ).')}
                  className="text-[11px] text-[#C8AA5B] hover:text-[#E5C56D] hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            {/* Action Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#13281B] hover:bg-[#1A3826] border border-[#758652]/80 text-[#D4AF37] hover:text-[#FDE68A] font-bold text-xs py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 mt-3 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            >
              {loading ? 'A validar credenciais...' : 'Entrar no Sistema'} <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </Button>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-[#9EAF94]">
          Não possui conta?{' '}
          <Link href="/cadastro" className="text-[#D4AF37] font-semibold hover:underline">
            Cadastrar Militar
          </Link>
        </div>
      </div>

      {/* Bottom Tactical HUD Status Bar */}
      <div className="w-full pb-4 pt-8 flex items-center justify-center gap-4 text-[11px] font-mono text-[#8C9C83] z-10">
        <div className="flex items-center gap-1.5 bg-[rgba(15,22,14,0.6)] px-3 py-1 rounded-full border border-[#758652]/30">
          <Clock className="w-3 h-3 text-[#D4AF37]" />
          <span>Timestamp: {timestamp}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[rgba(15,22,14,0.6)] px-3 py-1 rounded-full border border-[#758652]/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistema health: 100%</span>
        </div>
      </div>
    </div>
  );
}
