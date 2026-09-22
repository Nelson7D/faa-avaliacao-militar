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
    <div className="bg-[rgba(24,34,21,0.72)] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between h-full shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-100 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Distribuição das Classificações Regimentais
          </h3>
          <p className="text-xs text-[#9EAF94] mt-0.5">
            Cálculo consolidado baseado nas regras dos Blocos 03 e 04
          </p>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-1 bg-[rgba(18,26,16,0.8)] text-[#D4AF37] rounded-lg border border-[#758652]/35 shrink-0">
          Total: <strong className="text-white">{fais.length}</strong> FAIs
        </span>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="my-4">
        <div className="h-3.5 w-full bg-[rgba(12,18,11,0.8)] rounded-full overflow-hidden flex p-0.5 border border-[#758652]/30 gap-1 shadow-inner">
          {sigFavPct > 0 && (
            <div
              style={{ width: `${sigFavPct}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              title={`Significativamente Favorável: ${sigFavPct}%`}
            />
          )}
          {favPct > 0 && (
            <div
              style={{ width: `${favPct}%` }}
              className="bg-[#D4AF37] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(212,175,55,0.5)]"
              title={`Favorável: ${favPct}%`}
            />
          )}
          {desfavPct > 0 && (
            <div
              style={{ width: `${desfavPct}%` }}
              className="bg-rose-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              title={`Desfavorável: ${desfavPct}%`}
            />
          )}
        </div>
      </div>

      {/* Legend & Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Sig. Favorável */}
        <div className="p-3 bg-[rgba(18,26,16,0.8)] border border-emerald-500/30 rounded-xl flex items-center gap-3 transition-all hover:bg-[rgba(24,36,22,0.9)]">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-emerald-300 truncate">Sig. Favorável</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-data-mono text-lg font-bold text-white">{sigFavCount}</span>
              <span className="text-xs font-mono text-[#9EAF94]">({sigFavPct}%)</span>
            </div>
          </div>
        </div>

        {/* Favorável */}
        <div className="p-3 bg-[rgba(18,26,16,0.8)] border border-[#D4AF37]/30 rounded-xl flex items-center gap-3 transition-all hover:bg-[rgba(24,36,22,0.9)]">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-[#FDE68A] truncate">Favorável</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-data-mono text-lg font-bold text-white">{favCount}</span>
              <span className="text-xs font-mono text-[#9EAF94]">({favPct}%)</span>
            </div>
          </div>
        </div>

        {/* Desfavorável */}
        <div className="p-3 bg-[rgba(18,26,16,0.8)] border border-rose-500/30 rounded-xl flex items-center gap-3 transition-all hover:bg-[rgba(24,36,22,0.9)]">
          <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-rose-300 truncate">Desfavorável</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-data-mono text-lg font-bold text-white">{desfavCount}</span>
              <span className="text-xs font-mono text-[#9EAF94]">({desfavPct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
