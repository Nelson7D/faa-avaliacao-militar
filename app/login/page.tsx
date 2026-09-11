'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center p-4 relative select-none">
      {/* Subtle brand ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#0F3323]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#B89047] to-[#8C6B26] p-0.5 shadow-md mb-1">
            <div className="w-full h-full bg-[#0F3323] rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-[#D4AF37]" />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F3323] uppercase">
            SISTEMA FAA
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Avaliação Individual dos Militares • Manual VII FAA
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B89047]" />
                NIP ou Email Militar
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: 10048291 ou nome@faa.ao"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#B89047]" />
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F3323] hover:bg-[#184A34] text-white font-semibold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 mt-2 transition-all cursor-pointer"
            >
              {loading ? 'A autenticar...' : 'Entrar no Sistema'} <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </Button>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-slate-500">
          Não possui conta?{' '}
          <Link href="/cadastro" className="text-[#B89047] font-semibold hover:underline">
            Cadastrar Militar
          </Link>
        </div>
      </div>
    </div>
  );
}
