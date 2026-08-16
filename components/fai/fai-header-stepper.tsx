import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface FaiStep {
  id: number;
  label: string;
  sublabel: string;
}

const STEPS: FaiStep[] = [
  { id: 1, label: '01–03', sublabel: 'Identificação & Avaliadores' },
  { id: 2, label: '04–05', sublabel: 'Factores F1–F16 & Média Final' },
  { id: 3, label: '06–09', sublabel: 'Pareceres & Despacho Cmdt' },
  { id: 4, label: '10', sublabel: 'Áreas de Emprego' },
  { id: 5, label: '11–12', sublabel: 'Tomada de Ciência & DPQ' },
];

export function FaiHeaderStepper({
  activeStep,
  onStepClick,
}: {
  activeStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="bg-slate-50/70 border-b border-slate-200/80 px-4 py-3 shrink-0 flex items-center justify-center no-print">
      <div className="flex items-center gap-1.5 text-xs max-w-5xl w-full overflow-x-auto p-1">
        {STEPS.map((s, index) => {
          const isActive = s.id === activeStep;
          const isDone = s.id < activeStep;

          return (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => onStepClick(s.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap text-xs font-medium',
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-semibold ring-1 ring-primary/20'
                    : isDone
                    ? 'bg-emerald-50/70 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100/60'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                )}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold font-mono transition-colors shrink-0',
                    isActive
                      ? 'bg-primary text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {isDone ? <Check className="w-3 h-3" /> : s.id}
                </span>
                <span className="truncate">
                  <span className="font-mono text-slate-500 mr-1 text-[11px]">[{s.label}]</span>
                  <span>{s.sublabel}</span>
                </span>
              </button>
              {index < STEPS.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
