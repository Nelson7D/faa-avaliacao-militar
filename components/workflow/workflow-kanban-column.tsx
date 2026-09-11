'use client';

import React from 'react';
import { FaiDocument, EtapaWorkflow } from '@/types/fai';
import { WORKFLOW_ETAPAS_CONFIG } from '@/types/workflow';
import { WorkflowCard } from './workflow-card';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  etapaId: EtapaWorkflow;
  fais: FaiDocument[];
  onOpenTramitarModal: (fai: FaiDocument) => void;
}

export function WorkflowKanbanColumn({
  etapaId,
  fais,
  onOpenTramitarModal,
}: KanbanColumnProps) {
  const config = WORKFLOW_ETAPAS_CONFIG[etapaId];

  const stageColorMap: Record<EtapaWorkflow, { dot: string; bg: string; badge: string }> = {
    AVALIADOR_1: { dot: 'bg-blue-600', bg: 'bg-blue-50/40', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
    AVALIADOR_2: { dot: 'bg-cyan-600', bg: 'bg-cyan-50/40', badge: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    CMDTE: { dot: 'bg-[#B89047]', bg: 'bg-amber-50/40', badge: 'bg-amber-50 text-amber-900 border-amber-300' },
    CONSELHO_ASC: { dot: 'bg-indigo-600', bg: 'bg-indigo-50/40', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    DPQ: { dot: 'bg-[#0F3323]', bg: 'bg-emerald-50/40', badge: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
    HOMOLOGADO: { dot: 'bg-emerald-700', bg: 'bg-emerald-50/40', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  };

  const stageStyle = stageColorMap[etapaId] || stageColorMap.AVALIADOR_1;

  return (
    <div className="flex-none w-[320px] flex flex-col bg-slate-100/70 border border-slate-200/80 rounded-2xl overflow-hidden shadow-subtle h-[calc(100vh-230px)] min-h-[520px]">
      {/* Column Header */}
      <div className={cn("p-4 border-b border-slate-200/80 backdrop-blur-xs flex justify-between items-center shrink-0 bg-white/80", stageStyle.bg)}>
        <div>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", stageStyle.dot)} />
            <h3 className="font-bold text-xs text-slate-900 tracking-tight truncate">
              {config?.titulo || etapaId}
            </h3>
          </div>
          <p className="text-[10.5px] text-slate-500 font-mono mt-0.5 pl-3.5">
            Prazo: {config?.prazoDias || 5} Dias
          </p>
        </div>
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border", stageStyle.badge)}>
          {fais.length}
        </span>
      </div>

      {/* Cards Scrollable Area */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {fais.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-6 text-xs text-slate-400 italic">
            Nenhum processo nesta etapa.
          </div>
        ) : (
          fais.map((fai) => (
            <WorkflowCard
              key={fai.id}
              fai={fai}
              onOpenTramitarModal={onOpenTramitarModal}
            />
          ))
        )}
      </div>
    </div>
  );
}
