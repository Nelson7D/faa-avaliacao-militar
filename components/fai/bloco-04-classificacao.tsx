'use client';

import React from 'react';
import { ResultadoCalculoFai } from '@/lib/calculo-fai';
import { ShieldCheck, Award, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Bloco04Props {
  resultado: ResultadoCalculoFai;
}

export function Bloco04Classificacao({ resultado }: Bloco04Props) {
  const {
    MP,
    divisor,
    classificacao,
    somaPonderada,
    contagemNivel5,
    contagemNivel20,
    motivoClassificacao,
    incoerenciasDetectadas,
  } = resultado;

  let badgeVariant: any = 'fav';
  if (classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL') badgeVariant = 'sigFav';
  else if (classificacao === 'DESFAVORÁVEL') badgeVariant = 'desfav';

  const scorePct = Math.min(100, Math.max(0, Math.round((MP / 20) * 100)));

  return (
    <div className="p-6 border-t border-b border-slate-200/80 bg-slate-50/50 space-y-4">
      {/* Main Score Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-card">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B89047]" />
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-tight">
              BLOCO 05 • MÉDIA FINAL REGIMENTAL
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Fórmula Oficial (Manual VII): <span className="font-mono font-semibold text-slate-800">MP = (C × N) / Divisor Base</span>
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-1">
            <span>Soma: <strong className="text-slate-900">{somaPonderada} pts</strong></span>
            <span>Divisor: <strong className="text-primary font-bold">{divisor}</strong></span>
            <span>Nível 20: <strong className="text-emerald-700 font-bold">{contagemNivel20}</strong></span>
            <span>Nível 5: <strong className={contagemNivel5 > 2 ? 'text-rose-600 font-bold' : 'text-slate-800'}>{contagemNivel5}</strong></span>
          </div>

          <div className="w-full max-w-sm pt-1">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${scorePct}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  MP >= 15 ? 'bg-primary' : MP >= 11.25 ? 'bg-[#B89047]' : 'bg-rose-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Big Calculated Grade & Badge */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center">
            <span className="block text-[10px] uppercase text-slate-400 font-mono font-medium tracking-wider mb-0.5">
              MÉDIA PONDERADA (MP)
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="font-data-mono text-4xl font-bold text-slate-900 tracking-tight">
                {MP.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 20.00</span>
            </div>
          </div>

          <div className="h-12 w-px bg-slate-200 hidden sm:block" />

          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-mono font-medium tracking-wider mb-1.5">
              QUALIFICAÇÃO OFICIAL
            </span>
            <Badge variant={badgeVariant} className="text-xs px-3.5 py-1.5 shadow-2xs">
              {classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL' && <Award className="w-4 h-4 mr-1 text-emerald-800" />}
              {classificacao === 'FAVORÁVEL' && <ShieldCheck className="w-4 h-4 mr-1 text-[#B89047]" />}
              {classificacao === 'DESFAVORÁVEL' && <AlertTriangle className="w-4 h-4 mr-1 text-rose-600" />}
              <span>{classificacao}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Regimental Justification Note */}
      {motivoClassificacao && (
        <div className="flex items-start gap-2.5 p-4 bg-white border border-slate-200/80 rounded-xl text-xs shadow-2xs">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 font-semibold text-xs">Enquadramento Regimental: </strong>
            <span className="text-slate-600 leading-relaxed">{motivoClassificacao}</span>
          </div>
        </div>
      )}

      {/* Inconsistency Warning (if any) */}
      {incoerenciasDetectadas && incoerenciasDetectadas.length > 0 && (
        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-semibold text-rose-700 text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Alerta de Incoerência Regimental Detectado</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1 text-rose-900">
            {incoerenciasDetectadas.map((inc, i) => (
              <li key={i}>{inc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
