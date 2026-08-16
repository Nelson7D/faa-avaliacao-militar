'use client';

import React from 'react';
import { FaiDocument, EtapaWorkflow } from '@/types/fai';
import { WORKFLOW_ETAPAS_CONFIG } from '@/types/workflow';
import { WorkflowCard } from './workflow-card';

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

  return (
    <div className="flex-none w-[320px] flex flex-col bg-slate-100/70 border border-slate-200/80 rounded-2xl overflow-hidden shadow-subtle h-[calc(100vh-230px)] min-h-[520px]">
      {/* Column Header */}
      <div className="p-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs flex justify-between items-center shrink-0">
        <div>
          <h3 className="font-semibold text-xs text-slate-900 tracking-tight truncate">
            {config?.titulo || etapaId}
          </h3>
          <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">
            Prazo: {config?.prazoDias || 5} Dias
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
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
