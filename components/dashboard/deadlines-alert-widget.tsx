'use client';

import React from 'react';
import Link from 'next/link';
import { Timer, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { FaiDocument } from '@/types/fai';
import { WORKFLOW_ETAPAS_CONFIG } from '@/types/workflow';
import { formatNip } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DeadlinesAlertWidgetProps {
  fais: FaiDocument[];
}

export function DeadlinesAlertWidget({ fais }: DeadlinesAlertWidgetProps) {
  const activeFais = fais.filter((f) => f.workflow.etapaAtual !== 'HOMOLOGADO');

  return (
    <div className="executive-card rounded-xl p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <h3 className="font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5 shrink-0">
          <Timer className="w-4 h-4 text-[#B89047]" />
          <span>Prazos Regimentais (30d)</span>
        </h3>
        <Link
          href="/workflow"
          className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1 transition-colors group shrink-0"
        >
          Workflow <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {activeFais.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 italic">
            Nenhum processo em tramitação no momento.
          </div>
        ) : (
          activeFais.map((fai) => {
            const m = fai.militar;
            const etapaConfig = WORKFLOW_ETAPAS_CONFIG[fai.workflow.etapaAtual];
            const limite = etapaConfig?.prazoDias || 5;
            const diasNaEtapa = fai.workflow.diasNaEtapa || 0;
            const diasRestantes = limite - diasNaEtapa;
            const atrasado = diasRestantes < 0 || fai.workflow.atrasado;
            const pct = Math.min(100, Math.max(0, Math.round((diasNaEtapa / limite) * 100)));

            let indicatorClass = 'bg-emerald-600';
            let badgeVariant: any = 'sigFav';
            if (atrasado) {
              indicatorClass = 'bg-rose-500';
              badgeVariant = 'alert';
            } else if (diasRestantes <= 2) {
              indicatorClass = 'bg-[#B89047]';
              badgeVariant = 'fav';
            }

            return (
              <div
                key={fai.id}
                className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all space-y-2 shadow-2xs group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-data-mono font-semibold text-slate-900 text-xs">
                        NIP {formatNip(fai.militarNip)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({fai.id})
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                      {m?.posto} {m?.nomeCompleto}
                    </div>
                  </div>

                  <Badge variant={badgeVariant} className="text-[9.5px] px-2 shrink-0">
                    {atrasado
                      ? `+${Math.abs(diasRestantes)}d Atraso`
                      : diasRestantes === 0
                      ? 'Hoje'
                      : `${diasRestantes}d Restam`}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 gap-1">
                  <span className="truncate">{etapaConfig?.titulo}</span>
                  <span className="font-mono font-medium text-slate-700 shrink-0">
                    Dia {diasNaEtapa}/{limite}d ({pct}%)
                  </span>
                </div>

                <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${indicatorClass}`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
