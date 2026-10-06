'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderArchive,
  Calendar,
  Search,
  Filter,
  FileText,
  Eye,
  Printer,
  ChevronRight,
  Shield,
  Download,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Building,
} from 'lucide-react';
import { fetchFais } from '@/services/firebase/firestore';
import { FaiDocument } from '@/types/fai';
import { formatNip } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ArquivoPage() {
  const [fais, setFais] = useState<FaiDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Ano selecionado (ex: "2025", "2026", "2027")
  const [anoSelecionado, setAnoSelecionado] = useState<string>('2025');
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<'TODAS' | 'OFICIAL' | 'SARGENTO' | 'PRACA'>('TODAS');
  const [quadroFiltro, setQuadroFiltro] = useState<string>('TODOS');

  useEffect(() => {
    async function carregarFais() {
      try {
        const dados = await fetchFais();
        setFais(dados);

        // Identifica anos disponíveis
        const anosDisponiveis = Array.from(
          new Set(
            dados.map((f) => {
              const anoLimpo = (f.anoInstrucao || '2025').split('/')[0].trim();
              return anoLimpo;
            })
          )
        ).filter(Boolean);

        if (anosDisponiveis.length > 0 && !anosDisponiveis.includes('2025')) {
          setAnoSelecionado(anosDisponiveis[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar FAI para o arquivo:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarFais();
  }, []);

  // Extrai lista única de anos e garante 2025, 2026, 2027
  const anosSet = new Set(['2025', '2026', '2027']);
  fais.forEach((f) => {
    const a = (f.anoInstrucao || '').split('/')[0].trim();
    if (a && a.length === 4) anosSet.add(a);
  });
  const anosOrdenados = Array.from(anosSet).sort();

  // Filtra as FAIs pertencentes ao ano selecionado
  const faisDoAno = fais.filter((f) => {
    const anoFai = (f.anoInstrucao || '').split('/')[0].trim();
    return anoFai === anoSelecionado || (!anoFai && anoSelecionado === '2025');
  });

  // Filtros de busca e categoria no ano selecionado
  const faisFiltradas = faisDoAno.filter((f) => {
    const term = busca.toLowerCase().trim();
    const matchTerm =
      !term ||
      f.id.toLowerCase().includes(term) ||
      f.militarNip.toLowerCase().includes(term) ||
      f.militar?.nomeCompleto?.toLowerCase().includes(term) ||
      f.militar?.posto?.toLowerCase().includes(term) ||
      (f.militar?.asc && f.militar.asc.toLowerCase().includes(term));

    const matchCategoria = categoriaFiltro === 'TODAS' || f.militar?.categoria === categoriaFiltro;
    const matchQuadro = quadroFiltro === 'TODOS' || f.militar?.qe === quadroFiltro;

    return matchTerm && matchCategoria && matchQuadro;
  });

  // Métricas do ano selecionado
  const totalAno = faisDoAno.length;
  const homologadasAno = faisDoAno.filter((f) => f.workflow?.etapaAtual === 'HOMOLOGADO').length;
  const emCursoAno = totalAno - homologadasAno;
  const mediaAnual =
    totalAno > 0
      ? (faisDoAno.reduce((acc, f) => acc + (f.mediaPonderada || 0), 0) / totalAno).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6 pb-24 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#758652]/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[rgba(16,24,15,0.8)] border border-[#758652]/30 text-[#D4AF37]">
              <FolderArchive className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                Arquivo Cronológico de Avaliações (FAI)
              </h1>
              <p className="text-xs text-[#9EAF94] mt-0.5">
                Organização cronológica por ano de instrução • Comando do Pessoal • Consulta e arquivo de processos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/fai/nova">
            <Button size="sm" className="bg-[#13281B] hover:bg-[#1A3826] border border-[#758652]/80 text-[#D4AF37] text-xs">
              + Nova Avaliação
            </Button>
          </Link>
        </div>
      </div>

      {/* Pastas Cronológicas por Ano (Ficheiros – 2025, Ficheiros – 2026, etc.) */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono font-bold uppercase text-[#C5D4BD] tracking-wider block">
          Estrutura de Pastas de Arquivo (Ciclos de Avaliação):
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {anosOrdenados.map((ano) => {
            const count = fais.filter((f) => (f.anoInstrucao || '').startsWith(ano)).length;
            const ativo = anoSelecionado === ano;

            return (
              <button
                key={ano}
                type="button"
                onClick={() => setAnoSelecionado(ano)}
                className={cn(
                  'group relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-card',
                  ativo
                    ? 'bg-gradient-to-br from-[#182B1C] to-[#0D180F] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                    : 'bg-[rgba(24,34,21,0.65)] border-white/[0.08] hover:border-[#758652]/60 hover:bg-[rgba(28,40,25,0.8)]'
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={cn(
                      'p-2 rounded-xl transition-colors',
                      ativo ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'bg-[#0F3323]/60 text-[#D4AF37]'
                    )}
                  >
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border',
                      ativo
                        ? 'bg-[#D4AF37]/20 text-[#FDE68A] border-[#D4AF37]/40'
                        : 'bg-white/5 text-[#8FA39A] border-white/10'
                    )}
                  >
                    {count} FAI{count !== 1 ? 's' : ''}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-[#D4AF37] transition-colors">
                    Ficheiros – {ano}
                  </h3>
                  <p className="text-[10px] text-[#9EAF94] mt-0.5 font-mono">
                    Ciclo Instrução {ano}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Indicadores Táticos do Ano Selecionado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[rgba(24,34,21,0.72)] backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#8FA39A] uppercase block">Total de Ficheiros ({anoSelecionado})</span>
            <span className="text-2xl font-bold font-mono text-slate-100">{totalAno}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0F3323]/50 text-[#D4AF37] border border-[#758652]/30">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[rgba(24,34,21,0.72)] backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#8FA39A] uppercase block">Processos Homologados</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{homologadasAno}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[rgba(24,34,21,0.72)] backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#8FA39A] uppercase block">Em Tramitação / Pendentes</span>
            <span className="text-2xl font-bold font-mono text-amber-400">{emCursoAno}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/50 text-amber-400 border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[rgba(24,34,21,0.72)] backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#8FA39A] uppercase block">Média Geral do Ciclo</span>
            <span className="text-2xl font-bold font-mono text-[#D4AF37]">{mediaAnual} <span className="text-xs text-slate-400 font-normal">/ 20</span></span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0F3323]/50 text-[#D4AF37] border border-[#758652]/30">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Painel de Filtros e Busca no Arquivo */}
      <div className="bg-[rgba(24,34,21,0.72)] backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA39A]" />
          <input
            type="text"
            placeholder={`Buscar nas avaliações de ${anoSelecionado} por NIP, nome, posto, especialidade...`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-[#758652]/40 rounded-xl bg-[rgba(12,18,11,0.85)] text-slate-100 placeholder:text-[#6C7D63] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value as any)}
            className="py-1.5 px-3 border border-[#758652]/40 rounded-xl bg-[rgba(12,18,11,0.85)] text-slate-100 font-semibold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="TODAS">Todas as Categorias</option>
            <option value="OFICIAL">Oficiais (Divisor 52)</option>
            <option value="SARGENTO">Sargentos (Divisor 52)</option>
            <option value="PRACA">Praças (Divisor 31)</option>
          </select>

          <select
            value={quadroFiltro}
            onChange={(e) => setQuadroFiltro(e.target.value)}
            className="py-1.5 px-3 border border-[#758652]/40 rounded-xl bg-[rgba(12,18,11,0.85)] text-slate-100 font-semibold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="TODOS">Todos os Quadros</option>
            <option value="QP">Quadro Permanente (QP)</option>
            <option value="QC">Quadro por Contrato (QC)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Arquivo Histórico do Ano */}
      <div className="bg-[rgba(24,34,21,0.75)] backdrop-blur-xl rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
        <div className="p-4 border-b border-[#758652]/20 flex justify-between items-center bg-[rgba(16,24,15,0.7)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-100">
              Registos de Ficheiros — Ano {anoSelecionado} ({faisFiltradas.length} processos listados)
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-slate-400 animate-pulse">
            Carregando processos arquivados do ano {anoSelecionado}...
          </div>
        ) : faisFiltradas.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <FolderArchive className="w-10 h-10 text-[#758652] mx-auto opacity-60" />
            <p className="text-xs font-semibold text-slate-300">Nenhum processo localizado na pasta Ficheiros – {anoSelecionado}.</p>
            <p className="text-[11px] text-[#8FA39A]">Tente alterar os termos de pesquisa ou selecionar outro ano de instrução.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#758652]/20 bg-[rgba(12,18,11,0.7)] text-slate-300 font-mono text-[11px]">
                  <th className="p-3">ID FAI</th>
                  <th className="p-3">Militar Avaliado</th>
                  <th className="p-3">Especialidade / Quadro</th>
                  <th className="p-3 text-center">Média (MP)</th>
                  <th className="p-3 text-center">Classificação</th>
                  <th className="p-3 text-center">Etapa Atual</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {faisFiltradas.map((fai) => {
                  const m = fai.militar;
                  const isOficial = m?.categoria === 'OFICIAL';
                  const isSargento = m?.categoria === 'SARGENTO';

                  return (
                    <tr key={fai.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-100">
                        <span className="px-2 py-0.5 rounded bg-[rgba(12,18,11,0.85)] border border-[#758652]/40 text-[#D4AF37]">
                          {fai.id}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase',
                              isOficial
                                ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                                : isSargento
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            )}
                          >
                            {m?.categoria || 'PRACA'}
                          </span>
                          <div>
                            <span className="font-bold text-slate-100 block">
                              {m?.posto} {m?.nomeCompleto || fai.militarNip}
                            </span>
                            <span className="text-[10px] text-[#8FA39A] font-mono">
                              NIP {formatNip(fai.militarNip)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-medium text-slate-200 block">{m?.asc || '-'}</span>
                        <span className="text-[10px] text-[#8FA39A] font-mono">
                          {m?.qe === 'QC' ? 'Quadro por Contrato' : 'Quadro Permanente'} • {m?.tempoServicoAnos || 0} anos
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono font-bold">
                        <span className="text-sm text-[#D4AF37]">
                          {(fai.mediaPonderada || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Divisor {fai.divisor || 52}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            'text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase',
                            fai.classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : fai.classificacao === 'FAVORÁVEL'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                              : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                          )}
                        >
                          {fai.classificacao}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {fai.workflow?.etapaAtual || 'AVALIADOR_1'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <Link href={`/fai/${fai.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2.5 border-[#758652]/40 bg-[rgba(16,24,15,0.7)] text-slate-200 hover:text-white hover:bg-white/5 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 mr-1 text-[#D4AF37]" /> Ver FAI
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
