'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchMilitares } from '@/services/firebase/firestore';
import { Militar } from '@/types/militar';
import { formatNip } from '@/lib/utils';
import { Search, UserCheck, Eye, Shield, UserPlus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { canConsultarMilitar } from '@/lib/hierarchy';

export default function MilitaresListPage() {
  const { profile } = useAuth();
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('TODAS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchMilitares();
      setMilitares(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = militares.filter((m) => {
    // Princípio da Hierarquia Militar FAA (Ponto 2):
    // Cada utilizador visualiza apenas os efetivos que lhe compete avaliar ou consultar
    if (!canConsultarMilitar(profile, m)) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.nip?.toLowerCase().includes(term) ||
      m.nomeCompleto?.toLowerCase().includes(term) ||
      m.posto?.toLowerCase().includes(term) ||
      m.unidade?.toLowerCase().includes(term);

    const matchesCat = categoriaFilter === 'TODAS' || m.categoria === categoriaFilter;
    return matchesSearch && matchesCat;
  });

  const canCadastrar = profile?.role === 'DPQ' || profile?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {profile?.role === 'AVALIADOR_1' ? 'Efetivo Subordinado (Processos Individuais)' : 'Processos Individuais e Efetivo Militar'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {profile?.role === 'AVALIADOR_1'
              ? `Militares subordinados ao ${profile.posto} ${profile.nomeGuerra || profile.nomeCompleto} para fins de avaliação regimental`
              : 'Cadastro geral de militares das Forças Armadas Angolanas • Dossiês e Folhas de Matrícula'}
          </p>
        </div>

        {canCadastrar && (
          <Link href="/cadastro">
            <Button size="sm" className="text-xs flex items-center gap-1.5 bg-[#B89047] hover:bg-[#A37E3A] text-white shadow-xs">
              <UserPlus className="w-3.5 h-3.5" /> Cadastrar Militar
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 text-xs shadow-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por NIP, Nome, Posto ou Unidade..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
          />
        </div>

        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="py-1.5 px-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
        >
          <option value="TODAS">Todas as Categorias</option>
          <option value="OFICIAL">Oficiais (Divisor 52)</option>
          <option value="SARGENTO">Sargentos (Divisor 52)</option>
          <option value="PRACA">Praças (Divisor 31)</option>
        </select>
      </div>

      {/* Grid of Military Personnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => {
          const categoryColors =
            m.categoria === 'OFICIAL'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : m.categoria === 'SARGENTO'
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-amber-50 text-amber-900 border-amber-200';

          return (
            <div
              key={m.nip}
              className="executive-card rounded-2xl p-5 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0F3323] to-[#1E523A] text-[#D4AF37] flex items-center justify-center font-bold text-xs font-mono shrink-0 overflow-hidden border border-[#D4AF37]/30 shadow-xs">
                  {m.fotoUrl ? (
                    <img src={m.fotoUrl} alt={m.nomeCompleto} className="w-full h-full object-cover" />
                  ) : (
                    <span>{m.posto.slice(0, 3).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${categoryColors}`}>
                      {m.categoria}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      {m.posto}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 truncate mt-1">{m.nomeCompleto}</h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{m.unidade}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-mono text-slate-700 font-semibold">NIP {formatNip(m.nip)}</span>
                <Link
                  href={`/militares/${m.nip}`}
                  className="inline-flex items-center gap-1 text-[#0F3323] hover:text-[#184A34] font-semibold transition-colors group"
                >
                  <Eye className="w-3.5 h-3.5 text-[#B89047] group-hover:scale-110 transition-transform" />
                  <span>Abrir Dossiê</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
