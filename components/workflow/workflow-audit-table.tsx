'use client';

import React from 'react';
import Link from 'next/link';
import { FaiDocument } from '@/types/fai';
import { WORKFLOW_ETAPAS_CONFIG } from '@/types/workflow';
import { formatNip, formatDataPt } from '@/lib/utils';
import { Eye, ArrowRight } from 'lucide-react';
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

interface AuditTableProps {
  fais: FaiDocument[];
  onOpenTramitarModal: (fai: FaiDocument) => void;
}

export function WorkflowAuditTable({ fais, onOpenTramitarModal }: AuditTableProps) {
  return (
    <div className="executive-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-mono w-28">NIP</TableHead>
            <TableHead>Militar Avaliado</TableHead>
            <TableHead>Etapa Atual</TableHead>
            <TableHead>Responsável Padrão</TableHead>
            <TableHead className="font-mono text-center w-28">Entrada</TableHead>
            <TableHead className="font-mono text-center w-24">Prazo Limite</TableHead>
            <TableHead className="text-center w-40">Status Regimental</TableHead>
            <TableHead className="text-right w-44">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fais.map((fai) => {
            const m = fai.militar;
            const etapaConfig = WORKFLOW_ETAPAS_CONFIG[fai.workflow.etapaAtual];
            const limite = etapaConfig?.prazoDias || 5;
            const diasNaEtapa = fai.workflow.diasNaEtapa || 0;
            const diasRestantes = limite - diasNaEtapa;
            const atrasado = diasRestantes < 0 || fai.workflow.atrasado;

            let statusBadge = (
              <Badge variant="sigFav" className="text-[10px]">
                Em Dia ({diasRestantes}d)
              </Badge>
            );

            if (fai.workflow.etapaAtual === 'HOMOLOGADO') {
              statusBadge = (
                <Badge variant="secondary" className="text-[10px]">
                  Homologado
                </Badge>
              );
            } else if (atrasado) {
              statusBadge = (
                <Badge variant="alert" className="text-[10px]">
                  Atrasado ({Math.abs(diasRestantes)}d)
                </Badge>
              );
            } else if (diasRestantes <= 2) {
              statusBadge = (
                <Badge variant="fav" className="text-[10px]">
                  Alerta ≤ 48h ({diasRestantes}d)
                </Badge>
              );
            }

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
                <TableCell className="font-semibold text-slate-900">
                  {etapaConfig?.titulo || fai.workflow.etapaAtual}
                </TableCell>
                <TableCell className="text-slate-600">
                  {etapaConfig?.responsavelPadrao}
                </TableCell>
                <TableCell className="font-data-mono text-center text-slate-600">
                  {formatDataPt(fai.workflow.dataEntradaEtapa)}
                </TableCell>
                <TableCell className="font-data-mono font-semibold text-center text-slate-800">
                  {limite} dias
                </TableCell>
                <TableCell className="text-center">{statusBadge}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/fai/${fai.id}`}>
                    <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1">
                      <Eye className="w-3 h-3" /> Ver FAI
                    </Button>
                  </Link>
                  {fai.workflow.etapaAtual !== 'HOMOLOGADO' && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => onOpenTramitarModal(fai)}
                      className="h-7 px-2.5 text-[11px] gap-1"
                    >
                      Tramitar <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
