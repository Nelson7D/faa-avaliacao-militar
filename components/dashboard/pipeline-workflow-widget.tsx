'use client';

import React from 'react';
import { FaiDocument } from '@/types/fai';
import { ChevronRight, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PipelineWorkflowWidgetProps {
  fais: FaiDocument[];
  selectedEtapa?: string | null;
  onSelectEtapa?: (etapaKey: string) => void;
}

const ETAPAS_PIPELINE = [
  {
    key: 'AVALIADOR_1',
    label: '1º Avaliador',
    short: 'Lançamento F1-F16',
    dot: 'bg-blue-600',
  },
  {
    key: 'AVALIADOR_2',
    label: '2º Avaliador',
    short: 'Revisão / Acordo',
    dot: 'bg-cyan-600',
  },
  {
    key: 'CMDTE',
    label: 'Comandante',
    short: 'Fixação da Média',
    dot: 'bg-[#B89047]',
  },
  {
    key: 'CONSELHO_ASC',
    label: 'Conselho ASC',
    short: 'Parecer Coletivo',
    dot: 'bg-indigo-600',
  },
  {
    key: 'CIENCIA_AVALIADO',
    label: 'Ciência Avaliado',
    short: 'Bloco 11',
    dot: 'bg-purple-600',
  },
  {
    key: 'HOMOLOGADO',
    label: 'Concluído DPQ',
    short: 'Homologado',
    dot: 'bg-emerald-700',
  },
];

export function PipelineWorkflowWidget({
  fais,
  selectedEtapa,
  onSelectEtapa,
}: PipelineWorkflowWidgetProps) {
  const total = fais.length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B89047]"></span>
          <h3 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
            PIPELINE REGIMENTAL DE TRAMITAÇÃO (CICLO 30 DIAS)
          </h3>
          {selectedEtapa && (
            <button
              type="button"
              onClick={() => onSelectEtapa?.(selectedEtapa)}
              className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 flex items-center gap-1 transition-colors"
              title="Clique para limpar o filtro de etapa"
            >
              Filtro Ativo: <strong>{selectedEtapa}</strong> ✕
            </button>
          )}
        </div>
        <Link
          href="/workflow"
          className="text-xs font-bold text-[#0F3323] hover:text-[#184A34] flex items-center gap-1 hover:underline"
        >
          Ver Quadro Completo de Tramitação <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Visual Interactive Stages Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {ETAPAS_PIPELINE.map((etapa, idx) => {
          const count = fais.filter((f) => f.workflow?.etapaAtual === etapa.key).length;
          const isDone = etapa.key === 'HOMOLOGADO';
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const isActive = count > 0;
          const isSelected = selectedEtapa === etapa.key;

          return (
            <button
              key={etapa.key}
              type="button"
              onClick={() => onSelectEtapa?.(etapa.key)}
              className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer group ${
                isSelected
                  ? 'bg-slate-100/90 border-[#0F3323] ring-2 ring-[#0F3323]/20 shadow-xs'
                  : isActive
                  ? 'bg-slate-50/70 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  : 'bg-white/60 border-slate-100 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${etapa.dot}`} />
                  0{idx + 1}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : count > 0 ? (
                  <Clock className="w-3.5 h-3.5 text-slate-700" />
                ) : null}
              </div>

              <div className="font-bold text-xs text-slate-900 leading-tight">
                {etapa.label}
              </div>
              <div className="text-[10px] text-slate-500 truncate mb-2">
                {etapa.short}
              </div>

              <div className="flex items-baseline justify-between border-t border-slate-200/60 pt-1.5">
                <span className="font-data-mono font-bold text-sm text-slate-900">
                  {count}
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-medium">
                  {percent}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
