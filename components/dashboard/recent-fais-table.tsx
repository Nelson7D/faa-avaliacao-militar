'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Eye, ArrowUpRight, FileSpreadsheet, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { FaiDocument } from '@/types/fai';
import { formatNip } from '@/lib/utils';
import { WORKFLOW_ETAPAS_CONFIG } from '@/types/workflow';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RecentFaisTableProps {
  fais: FaiDocument[];
  filtroEtapa?: string | null;
  onLimparEtapaFiltro?: () => void;
}

export function RecentFaisTable({
  fais,
  filtroEtapa,
  onLimparEtapaFiltro,
}: RecentFaisTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');
  const [statusFiltro, setStatusFiltro] = useState<'TODAS' | 'EM_CURSO' | 'HOMOLOGADAS' | 'CRITICAS'>('TODAS');

  const countEmCurso = fais.filter((f) => f.workflow?.etapaAtual !== 'HOMOLOGADO').length;
  const countHomologadas = fais.filter((f) => f.workflow?.etapaAtual === 'HOMOLOGADO').length;
  const countCriticas = fais.filter((f) => {
    if (f.workflow?.etapaAtual === 'HOMOLOGADO') return false;
    const diasRestantes = (f.workflow?.prazoLimiteEtapa || 30) - (f.workflow?.diasNaEtapa || 0);
    return f.workflow?.atrasado || diasRestantes <= 2;
  }).length;

  const filteredFais = fais.filter((fai) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      fai.militarNip.toLowerCase().includes(term) ||
      fai.militar?.nomeCompleto.toLowerCase().includes(term) ||
      fai.militar?.posto.toLowerCase().includes(term);

    const matchesCategoria =
      categoriaFiltro === 'TODAS' || fai.militar?.categoria === categoriaFiltro;

    const matchesEtapa = !filtroEtapa || fai.workflow?.etapaAtual === filtroEtapa;

    let matchesStatus = true;
    if (statusFiltro === 'EM_CURSO') {
      matchesStatus = fai.workflow?.etapaAtual !== 'HOMOLOGADO';
    } else if (statusFiltro === 'HOMOLOGADAS') {
      matchesStatus = fai.workflow?.etapaAtual === 'HOMOLOGADO';
    } else if (statusFiltro === 'CRITICAS') {
      const diasRestantes = (fai.workflow?.prazoLimiteEtapa || 30) - (fai.workflow?.diasNaEtapa || 0);
      matchesStatus = fai.workflow?.etapaAtual !== 'HOMOLOGADO' && (Boolean(fai.workflow?.atrasado) || diasRestantes <= 2);
    }

    return matchesSearch && matchesCategoria && matchesStatus && matchesEtapa;
  });

  return (
    <div className="bg-[rgba(24,34,21,0.75)] backdrop-blur-xl rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-slate-100 space-y-0">
      {/* Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-[#758652]/20 bg-[rgba(16,24,15,0.7)] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]"></span>
              <h3 className="font-bold text-sm text-slate-100 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
                Registo Central de Fichas de Avaliação Individual (FAI)
              </h3>
            </div>
            <p className="text-xs text-[#9EAF94] mt-0.5">
              Consolidação de notas, classificação regimental e controlo de tramitação operacional
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA39A]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar NIP, Posto ou Nome..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#758652]/40 rounded-xl bg-[rgba(12,18,11,0.85)] text-slate-100 placeholder:text-[#6C7D63] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>

            {/* Categoria Select */}
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="py-1.5 px-3 text-xs border border-[#758652]/40 rounded-xl bg-[rgba(12,18,11,0.85)] text-slate-100 font-medium focus:outline-none focus:border-[#D4AF37] transition-all shrink-0 cursor-pointer"
            >
              <option value="TODAS">Todas Categorias</option>
              <option value="OFICIAL">Oficiais</option>
              <option value="SARGENTO">Sargentos</option>
              <option value="PRACA">Praças</option>
            </select>
          </div>
        </div>

        {/* Tactical Fast Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#758652]/20">
          <button
            type="button"
            onClick={() => setStatusFiltro('TODAS')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
              statusFiltro === 'TODAS'
                ? 'bg-[#13281B] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
                : 'bg-[rgba(16,24,15,0.7)] text-[#9EAF94] border border-[#758652]/30 hover:text-white'
            }`}
          >
            Todas ({fais.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro('EM_CURSO')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
              statusFiltro === 'EM_CURSO'
                ? 'bg-[#2E3D27] text-[#FDE68A] border border-[#D4AF37]/50 shadow-xs'
                : 'bg-[rgba(16,24,15,0.7)] text-[#9EAF94] border border-[#758652]/30 hover:text-white'
            }`}
          >
            Em Tramitação ({countEmCurso})
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro('CRITICAS')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFiltro === 'CRITICAS'
                ? 'bg-rose-900/80 text-rose-200 border border-rose-500/60 shadow-xs'
                : 'bg-[rgba(16,24,15,0.7)] text-rose-300 border border-rose-500/30 hover:bg-rose-950/40'
            }`}
          >
            <Clock className="w-3 h-3 text-rose-400" />
            Prazos Críticos ({countCriticas})
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro('HOMOLOGADAS')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFiltro === 'HOMOLOGADAS'
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/60 shadow-xs'
                : 'bg-[rgba(16,24,15,0.7)] text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950/40'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Homologadas ({countHomologadas})
          </button>

          {filtroEtapa && (
            <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-xl bg-[#13281B] text-[#D4AF37] border border-[#D4AF37]/40">
              Etapa: <strong>{filtroEtapa}</strong>
              {onLimparEtapaFiltro && (
                <button
                  type="button"
                  onClick={onLimparEtapaFiltro}
                  className="text-rose-400 hover:text-rose-300 ml-1 font-bold cursor-pointer"
                  title="Remover filtro de etapa"
                >
                  ✕
                </button>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-[rgba(14,21,13,0.9)] border-b border-[#758652]/30 text-[#C5D4BD] font-bold text-xs">
            <TableHead className="w-28 font-mono text-[#D4AF37]">NIP</TableHead>
            <TableHead className="text-slate-200">Militar Avaliado</TableHead>
            <TableHead className="text-slate-200">Arma / Serviço</TableHead>
            <TableHead className="font-mono text-center w-24 text-slate-200">Ano</TableHead>
            <TableHead className="font-mono text-right w-28 text-slate-200">Nota (MP)</TableHead>
            <TableHead className="text-center w-52 text-slate-200">Classificação</TableHead>
            <TableHead className="w-44 text-slate-200">Etapa Workflow</TableHead>
            <TableHead className="text-right w-28 text-slate-200">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFais.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-[#8FA39A] italic">
                Nenhuma FAI encontrada para os critérios selecionados.
              </TableCell>
            </TableRow>
          ) : (
            filteredFais.map((fai, index) => {
              const etapaConfig = fai.workflow?.etapaAtual
                ? WORKFLOW_ETAPAS_CONFIG[fai.workflow.etapaAtual]
                : undefined;

              return (
                <TableRow
                  key={fai.id}
                  className={`border-b border-[#758652]/15 hover:bg-[rgba(32,46,28,0.5)] transition-colors ${
                    index % 2 === 0 ? 'bg-transparent' : 'bg-[rgba(16,24,15,0.4)]'
                  }`}
                >
                  <TableCell className="font-data-mono font-bold text-[#D4AF37] text-xs">
                    <span className="px-2 py-0.5 rounded-lg bg-[rgba(12,18,11,0.85)] border border-[#758652]/40">
                      {formatNip(fai.militarNip)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-100 text-xs">
                      {fai.militar?.nomeCompleto || 'Nome não registado'}
                    </div>
                    <div className="text-[11px] text-[#9EAF94]">
                      {fai.militar?.posto} • {fai.militar?.unidade}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[#C5D4BD] font-medium">
                    {fai.militar?.asc || '-'}
                  </TableCell>
                  <TableCell className="font-data-mono text-xs text-center text-[#9EAF94]">
                    {fai.anoInstrucao || '2025/2026'}
                  </TableCell>
                  <TableCell className="font-data-mono text-right text-xs">
                    {fai.mediaPonderada !== undefined ? (
                      <span className="font-bold text-[#D4AF37] text-sm drop-shadow-xs">
                        {fai.mediaPonderada.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[#8FA39A] italic text-[11px]">Pendente</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {fai.classificacao ? (
                      <Badge
                        variant={
                          fai.classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL'
                            ? 'sigFav'
                            : fai.classificacao === 'FAVORÁVEL'
                            ? 'fav'
                            : 'desfav'
                        }
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      >
                        {fai.classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL'
                          ? 'Sig. Favorável'
                          : fai.classificacao === 'FAVORÁVEL'
                          ? 'Favorável'
                          : 'Desfavorável'}
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          fai.workflow?.atrasado
                            ? 'bg-rose-500'
                            : fai.workflow?.etapaAtual === 'HOMOLOGADO'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        {etapaConfig?.titulo || fai.workflow?.etapaAtual || 'Em Curso'}
                      </span>
                    </div>
                    {fai.workflow && fai.workflow.etapaAtual !== 'HOMOLOGADO' && (
                      <span className="text-[10px] font-mono text-[#9EAF94] block pl-3.5">
                        {fai.workflow.diasNaEtapa}d / {fai.workflow.prazoLimiteEtapa}d
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/fai/${fai.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs font-semibold rounded-xl bg-[rgba(16,24,15,0.85)] hover:bg-[#1A2E1C] text-[#D4AF37] border border-[#758652]/40 shadow-2xs gap-1 cursor-pointer"
                      >
                        Abrir <ArrowUpRight className="w-3 h-3 text-[#D4AF37]" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
