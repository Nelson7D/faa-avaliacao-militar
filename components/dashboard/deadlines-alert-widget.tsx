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
    <div className="bg-[rgba(24,34,21,0.72)] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between h-full shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#758652]/20">
        <h3 className="font-bold text-sm text-slate-100 tracking-tight flex items-center gap-1.5 shrink-0">
          <Timer className="w-4 h-4 text-[#D4AF37]" />
          <span>Prazos Regimentais (30d)</span>
        </h3>
        <Link
          href="/workflow"
          className="text-xs font-semibold text-[#D4AF37] hover:text-[#FDE68A] flex items-center gap-1 transition-colors group shrink-0"
        >
          Workflow <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {activeFais.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#8FA39A] italic">
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

            let indicatorClass = 'bg-emerald-500';
            if (atrasado) {
              indicatorClass = 'bg-rose-500';
            } else if (diasRestantes <= 2) {
              indicatorClass = 'bg-[#D4AF37]';
            }

            return (
              <div
                key={fai.id}
                className="p-3 border border-[#758652]/30 rounded-xl bg-[rgba(18,26,16,0.8)] hover:bg-[rgba(24,36,22,0.9)] hover:border-[#D4AF37]/40 transition-all space-y-2 shadow-xs group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-data-mono font-semibold text-slate-100 text-xs">
                        NIP {formatNip(fai.militarNip)}
                      </span>
                      <span className="text-[10px] text-[#8FA39A] font-mono">
                        ({fai.id})
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                      {m?.posto} {m?.nomeCompleto}
                    </div>
                  </div>

                  <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                    atrasado
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                      : diasRestantes <= 2
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {atrasado
                      ? `+${Math.abs(diasRestantes)}D ATRASO`
                      : diasRestantes === 0
                      ? 'HOJE'
                      : `${diasRestantes}D RESTAM`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#9EAF94] gap-1">
                  <span className="truncate">{etapaConfig?.titulo}</span>
                  <span className="font-mono font-medium text-slate-200 shrink-0">
                    Dia {diasNaEtapa}/{limite}d ({pct}%)
                  </span>
                </div>

                <div className="h-1.5 w-full bg-[rgba(12,18,11,0.8)] rounded-full overflow-hidden border border-[#758652]/20">
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
