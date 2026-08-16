'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, AlertCircle, CheckCircle2, User, Hash, Lock, Building } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { POSTOS_MILITARES } from '@/lib/constants';

export default function CadastroPage() {
  const router = useRouter();
  const { registerMilitar } = useAuth();

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
          funcaoDesempenhada: 'Oficial de Operações',
        },
        posto.includes('Coronel') || posto.includes('General') ? 'DPQ' : 'AVALIADOR_1'
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center p-4 py-8 relative select-none">
      {/* Subtle brand ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#0F3323]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 z-10">
        {/* Minimalist Header */}
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
            Cadastro de Militar
          </p>
        </div>

        {/* Clean White Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
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
        </div>

        {/* Minimalist Switch Link */}
        <div className="text-center text-xs text-slate-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#B89047] font-semibold hover:underline">
            Entrar no Sistema
          </Link>
        </div>
      </div>
    </div>
  );
}
