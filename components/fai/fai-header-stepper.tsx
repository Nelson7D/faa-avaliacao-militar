'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, HelpCircle } from 'lucide-react';
import { ManualAjudaModal } from '@/components/fai/manual-ajuda-modal';

export interface FaiStep {
  id: number;
  label: string;
  sublabel: string;
}

const STEPS = [
  { id: 1, label: 'Identificação' },
  { id: 2, label: 'Factores & Média' },
  { id: 3, label: 'Pareceres' },
  { id: 4, label: 'Áreas de Emprego' },
  { id: 5, label: 'Homologação' },
];

export function FaiHeaderStepper({
  activeStep,
  onStepClick,
}: {
  activeStep: number;
  onStepClick: (step: number) => void;
}) {
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  return (
    <div className="bg-slate-100/80 border-b border-slate-200/90 px-4 py-2.5 shrink-0 flex items-center justify-between no-print max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2 text-xs max-w-4xl overflow-x-auto p-1 scrollbar-none">
        {STEPS.map((s, index) => {
          const isActive = s.id === activeStep;
          const isDone = s.id < activeStep;

          return (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => onStepClick(s.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs font-semibold cursor-pointer',
                  isActive
                    ? 'bg-[#0F3323] text-white shadow-md ring-2 ring-[#D4AF37]/50'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-300/80 hover:bg-emerald-100/60'
                    : 'bg-white/70 text-slate-600 border border-slate-200/90 hover:bg-white hover:text-slate-900'
                )}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-colors shrink-0',
                    isActive
                      ? 'bg-[#D4AF37] text-slate-950 font-black'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[2.5]" /> : s.id}
                </span>
                <span>{s.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-3 h-0.5 shrink-0 rounded-full transition-colors',
                    isDone ? 'bg-emerald-400' : 'bg-slate-300'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowHelpModal(true)}
        className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs cursor-pointer transition-colors shrink-0 ml-2"
        title="Consultar Manual Doutrinário VII das FAA"
      >
        <HelpCircle className="w-3.5 h-3.5 text-[#B89047]" />
        <span>Critérios &amp; Prazos</span>
      </button>

      <ManualAjudaModal open={showHelpModal} onOpenChange={setShowHelpModal} />
    </div>
  );
}
