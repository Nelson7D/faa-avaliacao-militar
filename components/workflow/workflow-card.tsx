'use client';

import React from 'react';
import Link from 'next/link';
import { FaiDocument } from '@/types/fai';
import { WORKFLOW_ETAPAS_CONFIG } from '@/types/workflow';
import { formatNip } from '@/lib/utils';
import { ArrowRight, Eye, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowCardProps {
  fai: FaiDocument;
  onOpenTramitarModal: (fai: FaiDocument) => void;
}

export function WorkflowCard({ fai, onOpenTramitarModal }: WorkflowCardProps) {
  const m = fai.militar;
  const etapaConfig = WORKFLOW_ETAPAS_CONFIG[fai.workflow.etapaAtual];
  const limiteDias = etapaConfig?.prazoDias || 5;
  const diasNaEtapa = fai.workflow.diasNaEtapa || 0;
  const diasRestantes = limiteDias - diasNaEtapa;
  const isAtrasado = diasRestantes < 0 || fai.workflow.atrasado;

  let alertBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let cardBorderClass = 'border-slate-200/80';

  if (isAtrasado) {
    alertBadgeClass = 'bg-rose-50 text-rose-700 border-rose-300 animate-alert-pulse';
    cardBorderClass = 'border-rose-300 ring-1 ring-rose-200';
  } else if (diasRestantes <= 2) {
    alertBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
    cardBorderClass = 'border-amber-300/80';
  }

  return (
    <div
      className={cn(
        'executive-card rounded-xl p-4 transition-all hover:shadow-card-hover border relative overflow-hidden flex flex-col justify-between text-xs space-y-3 bg-white',
        cardBorderClass
      )}
    >
      {/* Top Details & Avatar */}
      <div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs font-mono shrink-0 border border-slate-200/60 shadow-2xs">
            {m?.posto ? m.posto.slice(0, 3).toUpperCase() : 'MIL'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900 truncate">
              {m ? `${m.posto} ${m.nomeGuerra || m.nomeCompleto.split(' ')[0]}` : 'Militar'}
            </div>
            <div className="font-data-mono text-[11px] text-slate-500 font-medium mt-0.5">
              NIP {formatNip(fai.militarNip)}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
          <span className="text-slate-500 truncate font-medium">{m?.asc || 'Geral'}</span>
          <span className="font-mono font-bold text-slate-900">MP {fai.mediaPonderada.toFixed(2)}</span>
        </div>
      </div>

      {/* Countdown & Status Progress */}
      <div className="pt-2 border-t border-slate-100 space-y-2.5">
        <div className="flex justify-between items-center">
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border flex items-center gap-1.5',
              alertBadgeClass
            )}
          >
            {isAtrasado ? (
              <>
                <AlertCircle className="w-3 h-3 text-rose-600" />
                {Math.abs(diasRestantes)}d ATRASADO
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-[#B89047]" />
                Dia {diasNaEtapa} de {limiteDias}d
              </>
            )}
          </span>
          <span className="text-[10px] text-slate-400 font-mono font-medium">
            {fai.anoInstrucao}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-0.5">
          <Link
            href={`/fai/${fai.id}`}
            className="flex-1 py-1.5 px-2.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-center text-[11px] font-medium text-slate-700 transition-colors flex items-center justify-center gap-1 shadow-2xs"
          >
            <Eye className="w-3 h-3" /> Ver FAI
          </Link>
          <button
            type="button"
            onClick={() => onOpenTramitarModal(fai)}
            className="py-1.5 px-3 bg-primary hover:bg-primary-light text-white rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1 shadow-xs"
            title="Avançar Etapa com Assinatura"
          >
            Tramitar <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
