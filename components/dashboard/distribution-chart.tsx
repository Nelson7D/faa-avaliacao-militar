'use client';

import React from 'react';
import { ShieldCheck, Award, AlertTriangle, TrendingUp } from 'lucide-react';
import { FaiDocument } from '@/types/fai';

interface DistributionChartProps {
  fais: FaiDocument[];
}

export function DistributionChart({ fais }: DistributionChartProps) {
  const total = fais.length || 1;
  const sigFavCount = fais.filter((f) => f.classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL').length;
  const favCount = fais.filter((f) => f.classificacao === 'FAVORÁVEL').length;
  const desfavCount = fais.filter((f) => f.classificacao === 'DESFAVORÁVEL').length;

  const sigFavPct = Math.round((sigFavCount / total) * 100);
  const favPct = Math.round((favCount / total) * 100);
  const desfavPct = 100 - sigFavPct - favPct;

  return (
    <div className="executive-card rounded-xl p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Distribuição das Classificações Regimentais
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo consolidado baseado nas regras dos Blocos 03 e 04
          </p>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/60 shrink-0">
          Total: <strong>{fais.length}</strong> FAIs
        </span>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="my-3">
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60 gap-0.5">
          {sigFavPct > 0 && (
            <div
              style={{ width: `${sigFavPct}%` }}
              className="bg-emerald-600 h-full rounded-full transition-all duration-500 shadow-xs"
              title={`Significativamente Favorável: ${sigFavPct}%`}
            />
          )}
          {favPct > 0 && (
            <div
              style={{ width: `${favPct}%` }}
              className="bg-[#B89047] h-full rounded-full transition-all duration-500 shadow-xs"
              title={`Favorável: ${favPct}%`}
            />
          )}
          {desfavPct > 0 && (
            <div
              style={{ width: `${desfavPct}%` }}
              className="bg-rose-500 h-full rounded-full transition-all duration-500 shadow-xs"
              title={`Desfavorável: ${desfavPct}%`}
            />
          )}
        </div>
      </div>

      {/* Legend & Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        {/* Sig. Favorável */}
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center gap-3 transition-all hover:bg-emerald-50">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-emerald-950 truncate">Sig. Favorável</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-data-mono text-lg font-bold text-emerald-800">{sigFavCount}</span>
              <span className="text-xs font-mono text-emerald-700/80 font-medium">({sigFavPct}%)</span>
            </div>
          </div>
        </div>

        {/* Favorável */}
        <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center gap-3 transition-all hover:bg-amber-50">
          <div className="w-9 h-9 rounded-lg bg-[#B89047] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-amber-950 truncate">Favorável</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-data-mono text-lg font-bold text-[#8C6B26]">{favCount}</span>
              <span className="text-xs font-mono text-amber-800/80 font-medium">({favPct}%)</span>
            </div>
          </div>
        </div>

        {/* Desfavorável */}
        <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center gap-3 transition-all hover:bg-rose-50">
          <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-rose-950 truncate">Desfavorável</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-data-mono text-lg font-bold text-rose-700">{desfavCount}</span>
              <span className="text-xs font-mono text-rose-600/80 font-medium">({desfavPct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
