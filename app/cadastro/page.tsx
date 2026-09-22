'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, AlertCircle, CheckCircle2, User, Hash, Lock, Building } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { POSTOS_MILITARES } from '@/lib/constants';
import { TacticalBackground } from '@/components/ui/tactical-background';

export default function CadastroPage() {
  const router = useRouter();
  const { profile, registerMilitar } = useAuth();
  const isAuthorized = profile?.role === 'DPQ' || profile?.role === 'ADMIN';

  const [nip, setNip] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [posto, setPosto] = useState('Tenente');
  const [categoria, setCategoria] = useState<'OFICIAL' | 'SARGENTO' | 'PRACA'>('OFICIAL');
  const [unidade, setUnidade] = useState('Quartel-General do Exército');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !nomeCompleto || !email || !password) {
      setError('Preencha todos os campos obrigatórios (*).');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await registerMilitar(
        email,
        password,
        {
          nip,
          nomeCompleto,
          nomeGuerra: nomeGuerra || nomeCompleto.split(' ')[0],
          posto,
          categoria,
          unidade,
          funcaoDesempenhada: 'Efetivo Militar',
        },
        'MILITAR_AVALIADO'
      );
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar militar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 py-8 select-none text-slate-100 overflow-hidden">
      {/* Animated Tactical Background (Radar + Polygonal Shields) */}
      <TacticalBackground variant="login" />

      <div className="w-full max-w-lg space-y-6 z-10">
        {/* Minimalist Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex flex-col items-center justify-center relative mb-1">
            <div className="w-14 h-16 bg-gradient-to-b from-[#182618] to-[#0A1108] border-2 border-[#D4AF37] rounded-b-2xl rounded-t-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] flex flex-col items-center justify-center p-2 relative overflow-hidden">
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/40 w-full text-center pb-0.5 mb-1 font-mono">
                FAA
              </span>
              <Shield className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#D4AF37] to-[#B89047] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            SISTEMA FAA
          </h1>
          <p className="text-xs text-[#9EAF94] font-medium tracking-tight">
            Registo de Novo Militar • Folha de Matrícula Oficial
          </p>
        </div>

        {/* High-Contrast Tactical Form Card */}
        <div className="bg-[rgba(255,255,255,0.92)] backdrop-blur-xl border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)] space-y-4 text-slate-900">
          {profile && !isAuthorized ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex p-3 bg-amber-50 rounded-full text-amber-800 border border-amber-200">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 uppercase">
                Acesso Reservado ao Órgão de Pessoal e Quadros (DPQ)
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                A responsabilidade de inserção, gestão e atualização dos dados dos efetivos no sistema de avaliação pertence exclusivamente ao <strong>Chefe do Pessoal e Quadro</strong> e à administração.
              </p>
              <div className="pt-2">
                <Link href={profile.role === 'MILITAR_AVALIADO' ? '/minha-fai' : '/dashboard'}>
                  <Button size="sm" className="text-xs bg-[#0F3323] hover:bg-[#184A34] text-white">
                    Voltar ao Início
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Militar cadastrado com sucesso! A redirecionar...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[#B89047]" /> NIP Militar *
                </label>
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Ex: 40020792"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Categoria *</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all"
                >
                  <option value="OFICIAL">Oficial (Divisor 52)</option>
                  <option value="SARGENTO">Sargento (Divisor 52)</option>
                  <option value="PRACA">Praça (Divisor 31)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#B89047]" /> Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Ex: Mário António Pascoal"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nome de Guerra</label>
                <input
                  type="text"
                  value={nomeGuerra}
                  onChange={(e) => setNomeGuerra(e.target.value)}
                  placeholder="Ex: Pascoal"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Posto *</label>
                <select
                  value={posto}
                  onChange={(e) => setPosto(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all"
                >
                  {POSTOS_MILITARES.map((p) => (
                    <option key={p.id} value={p.nome}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-[#B89047]" /> Unidade *
                </label>
                <input
                  type="text"
                  required
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  placeholder="Ex: QG do Exército"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: pascoal@faa.ao"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#B89047]" /> Senha *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F3323] hover:bg-[#184A34] text-white font-semibold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 mt-3 transition-all cursor-pointer"
            >
              {loading ? 'A registar...' : 'Cadastrar Militar'} <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </Button>
          </form>
          </>
          )}
        </div>

        {/* Minimalist Switch Link */}
        <div className="text-center text-xs text-[#9EAF94]">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#D4AF37] font-semibold hover:underline">
            Entrar no Sistema
          </Link>
        </div>
      </div>
    </div>
  );
}
