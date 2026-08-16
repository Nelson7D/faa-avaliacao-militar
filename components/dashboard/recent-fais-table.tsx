'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Eye, ArrowUpRight, FileSpreadsheet } from 'lucide-react';
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
}

export function RecentFaisTable({ fais }: RecentFaisTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');

  const filteredFais = fais.filter((fai) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      fai.militarNip.toLowerCase().includes(term) ||
      fai.militar?.nomeCompleto.toLowerCase().includes(term) ||
      fai.militar?.posto.toLowerCase().includes(term);

    const matchesCategoria =
      categoriaFiltro === 'TODAS' || fai.militar?.categoria === categoriaFiltro;

    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="executive-card rounded-xl overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            Últimas Fichas de Avaliação Individual (FAI)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Registos consolidados e tramitação operacional do efetivo militar
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar NIP, Posto ou Nome..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
            />
          </div>

          {/* Categoria Select */}
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="py-1.5 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <option value="TODAS">Todas Categorias</option>
            <option value="OFICIAL">Oficiais</option>
            <option value="SARGENTO">Sargentos</option>
            <option value="PRACA">Praças</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28 font-mono">NIP</TableHead>
            <TableHead>Militar Avaliado</TableHead>
            <TableHead>Arma / Serviço</TableHead>
            <TableHead className="font-mono text-center w-24">Ano</TableHead>
            <TableHead className="font-mono text-right w-28">Nota (MP)</TableHead>
            <TableHead className="text-center w-52">Classificação</TableHead>
            <TableHead className="w-44">Etapa Workflow</TableHead>
            <TableHead className="text-right w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFais.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-slate-400 italic">
                Nenhuma FAI encontrada para os critérios selecionados.
              </TableCell>
            </TableRow>
          ) : (
            filteredFais.map((fai) => {
              const m = fai.militar;
              const etapaConfig = WORKFLOW_ETAPAS_CONFIG[fai.workflow.etapaAtual];

              let badgeVariant: any = 'fav';
              if (fai.classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL') badgeVariant = 'sigFav';
              else if (fai.classificacao === 'DESFAVORÁVEL') badgeVariant = 'desfav';

              return (
                <TableRow key={fai.id}>
                  <TableCell className="font-data-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 inline-block">
                      {formatNip(fai.militarNip)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">
                      {m?.posto} {m?.nomeCompleto}
                    </div>
                    <div className="text-[11px] text-slate-500">{m?.unidade}</div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{m?.asc || '-'}</TableCell>
                  <TableCell className="text-center font-mono font-medium text-slate-700">{fai.anoInstrucao}</TableCell>
                  <TableCell className="text-right font-data-mono font-bold text-sm text-slate-900">
                    {fai.mediaPonderada.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={badgeVariant} className="text-[10.5px]">
                      {fai.classificacao}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800 text-xs">
                      {etapaConfig?.titulo || fai.workflow.etapaAtual}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {fai.workflow.etapaAtual === 'HOMOLOGADO'
                        ? 'Concluído'
                        : `Dia ${fai.workflow.diasNaEtapa} de ${fai.workflow.prazoLimiteEtapa}d`}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/fai/${fai.id}`}>
                      <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1 hover:bg-primary hover:text-white hover:border-primary transition-all">
                        <Eye className="w-3 h-3" /> Ver FAI
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
