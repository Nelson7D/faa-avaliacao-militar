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
    <div className="executive-card rounded-2xl overflow-hidden border border-slate-200/90 shadow-card bg-white space-y-0">
      {/* Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F3323]"></span>
              <h3 className="font-bold text-sm text-slate-950 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#B89047]" />
                Registo Central de Fichas de Avaliação Individual (FAI)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidação de notas, classificação regimental e controlo de tramitação operacional
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar NIP, Posto ou Nome..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300/80 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3323]/20 focus:border-[#0F3323] transition-all shadow-2xs"
              />
            </div>

            {/* Categoria Select */}
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="py-1.5 px-3 text-xs border border-slate-300/80 rounded-xl bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3323]/20 focus:border-[#0F3323] transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              <option value="TODAS">Todas Categorias</option>
              <option value="OFICIAL">Oficiais</option>
              <option value="SARGENTO">Sargentos</option>
              <option value="PRACA">Praças</option>
            </select>
          </div>
        </div>

        {/* Tactical Fast Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200/60">
          <button
            type="button"
            onClick={() => setStatusFiltro('TODAS')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all ${
              statusFiltro === 'TODAS'
                ? 'bg-[#0F3323] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todas ({fais.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro('EM_CURSO')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all ${
              statusFiltro === 'EM_CURSO'
                ? 'bg-[#B89047] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Em Tramitação ({countEmCurso})
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro('CRITICAS')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              statusFiltro === 'CRITICAS'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <Clock className="w-3 h-3" />
            Prazos Críticos ({countCriticas})
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro('HOMOLOGADAS')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              statusFiltro === 'HOMOLOGADAS'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Homologadas ({countHomologadas})
          </button>

          {filtroEtapa && (
            <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-xl bg-slate-100 text-slate-800 border border-slate-300">
              Etapa: <strong>{filtroEtapa}</strong>
              {onLimparEtapaFiltro && (
                <button
                  type="button"
                  onClick={onLimparEtapaFiltro}
                  className="text-slate-400 hover:text-slate-700 ml-1 font-bold"
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
          <TableRow className="bg-slate-100/70 border-b border-slate-200 text-slate-800 font-bold">
            <TableHead className="w-28 font-mono">NIP</TableHead>
            <TableHead>Militar Avaliado</TableHead>
            <TableHead>Arma / Serviço</TableHead>
            <TableHead className="font-mono text-center w-24">Ano</TableHead>
            <TableHead className="font-mono text-right w-28">Nota (MP)</TableHead>
            <TableHead className="text-center w-52">Classificação</TableHead>
            <TableHead className="w-44">Etapa Workflow</TableHead>
            <TableHead className="text-right w-28">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFais.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-slate-400 italic">
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
                  className={`hover:bg-slate-50/80 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <TableCell className="font-data-mono font-bold text-slate-900 text-xs">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                      {formatNip(fai.militarNip)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-950 text-xs">
                      {fai.militar?.nomeCompleto || 'Nome não registado'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {fai.militar?.posto} • {fai.militar?.unidade}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">
                    {fai.militar?.asc || '-'}
                  </TableCell>
                  <TableCell className="font-data-mono text-xs text-center text-slate-600">
                    {fai.anoInstrucao || '2025/2026'}
                  </TableCell>
                  <TableCell className="font-data-mono text-right text-xs">
                    {fai.mediaPonderada !== undefined ? (
                      <span className="font-bold text-slate-950 text-sm">
                        {fai.mediaPonderada.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Pendente</span>
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
                      <span className="text-xs font-semibold text-slate-700">
                        {etapaConfig?.titulo || fai.workflow?.etapaAtual || 'Em Curso'}
                      </span>
                    </div>
                    {fai.workflow && fai.workflow.etapaAtual !== 'HOMOLOGADO' && (
                      <span className="text-[10px] font-mono text-slate-500 block pl-3.5">
                        {fai.workflow.diasNaEtapa}d / {fai.workflow.prazoLimiteEtapa}d
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/fai/${fai.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-2xs gap-1 cursor-pointer"
                      >
                        Abrir <ArrowUpRight className="w-3 h-3 text-slate-500" />
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
