'use client';

import React from 'react';
import Link from 'next/link';
import { FaiDocument } from '@/types/fai';
import { Eye, TrendingUp, History } from 'lucide-react';
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

interface HistoricoFaisTabProps {
  fais: FaiDocument[];
}

export function HistoricoFaisTab({ fais }: HistoricoFaisTabProps) {
  const sortedFais = [...fais].sort((a, b) => a.anoInstrucao.localeCompare(b.anoInstrucao));

  return (
    <div className="space-y-6">
      {/* Evolution Chart Bar Area */}
      <div className="executive-card rounded-2xl p-6 shadow-card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Evolução da Média Ponderada (MP) ao Longo dos Ciclos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Histórico consolidado nos anos de instrução e avaliação militar
            </p>
          </div>
        </div>

        {/* Visual Bar Progression */}
        <div className="flex items-end gap-6 h-40 pt-4 pb-2 border-b border-slate-100">
          {sortedFais.map((f) => {
            const heightPct = Math.round((f.mediaPonderada / 20) * 100);
            return (
              <div key={f.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                <span className="font-data-mono text-xs font-bold text-slate-900 group-hover:scale-110 group-hover:text-primary transition-transform">
                  {f.mediaPonderada.toFixed(2)}
                </span>
                <div className="w-full max-w-[56px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end p-0.5">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-primary group-hover:bg-[#B89047] transition-all duration-300 rounded-t-lg shadow-xs"
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-medium">
                  {f.anoInstrucao}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical List Table */}
      <div className="executive-card rounded-2xl overflow-hidden shadow-card">
        <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
            Registo Cronológico de Fichas de Avaliação Individual
          </h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono w-28">ID FAI</TableHead>
              <TableHead className="font-mono text-center w-28">Ano Instrução</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead className="font-mono text-right w-28">Média (MP)</TableHead>
              <TableHead className="text-center w-48">Classificação Regimental</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="text-right w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fais.map((fai) => {
              let badgeVariant: any = 'fav';
              if (fai.classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL') badgeVariant = 'sigFav';
              else if (fai.classificacao === 'DESFAVORÁVEL') badgeVariant = 'desfav';

              return (
                <TableRow key={fai.id}>
                  <TableCell className="font-data-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 inline-block">
                      {fai.id}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-center text-slate-800 font-medium">
                    {fai.anoInstrucao}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{fai.tipo}</TableCell>
                  <TableCell className="font-data-mono font-bold text-right text-sm text-slate-900">
                    {fai.mediaPonderada.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={badgeVariant} className="text-[10px]">
                      {fai.classificacao}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 text-xs">{fai.workflow.etapaAtual}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/fai/${fai.id}`}>
                      <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1">
                        <Eye className="w-3 h-3" /> Abrir
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
