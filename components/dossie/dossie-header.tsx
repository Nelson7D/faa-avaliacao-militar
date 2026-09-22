'use client';

import React from 'react';
import Link from 'next/link';
import { Militar } from '@/types/militar';
import { formatNip } from '@/lib/utils';
import { FileEdit, Printer, Shield, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DossieHeaderProps {
  militar: Militar;
}

export function DossieHeader({ militar }: DossieHeaderProps) {
  return (
    <section className="bg-[rgba(24,34,21,0.78)] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
      {/* Official Military Portrait */}
      <div className="w-full md:w-60 h-64 md:h-auto bg-[rgba(12,18,11,0.9)] relative border-r border-[#758652]/30 flex-shrink-0 flex items-center justify-center overflow-hidden group">
        {militar.fotoUrl ? (
          <img
            src={militar.fotoUrl}
            alt={militar.nomeCompleto}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          <div className="text-center p-6 text-slate-400">
            <Shield className="w-12 h-12 mx-auto text-[#758652] mb-2" />
            <span className="text-xs font-mono font-medium text-[#9EAF94]">Foto Regimental</span>
          </div>
        )}

        {/* Status Overlay */}
        <div className="absolute bottom-0 w-full bg-[#0B1612]/95 p-2 flex justify-center items-center gap-2 border-t border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-[10px] font-medium font-mono text-[#C5D4BD] tracking-wider uppercase">
            Serviço Ativo • {militar.qe}
          </span>
        </div>
      </div>

      {/* Details Area */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono border uppercase ${
                    militar.categoria === 'OFICIAL'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : militar.categoria === 'SARGENTO'
                      ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {militar.posto} • {militar.categoria}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight mt-1.5">
                {militar.nomeCompleto}
              </h2>
              <p className="text-xs text-[#9EAF94] mt-1 font-medium">
                Nome de Guerra: <strong className="text-[#D4AF37] font-semibold">{militar.nomeGuerra}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10.5px] font-mono font-medium text-[#8FA39A] uppercase block">
                NIP REGIMENTAL
              </span>
              <span className="font-data-mono text-base font-bold text-[#D4AF37] bg-[rgba(12,18,11,0.85)] px-3 py-1 rounded-lg border border-[#758652]/40 inline-block mt-0.5 shadow-2xs">
                {formatNip(militar.nip)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/[0.08] mt-4 text-xs">
            <div className="p-3 bg-[rgba(12,18,11,0.65)] rounded-xl border border-white/[0.06] flex flex-col justify-between">
              <span className="text-[10px] text-[#8FA39A] uppercase font-medium block">Unidade Atual</span>
              <strong className="text-slate-100 font-semibold block leading-tight mt-1">{militar.unidade}</strong>
            </div>
            <div className="p-3 bg-[rgba(12,18,11,0.65)] rounded-xl border border-white/[0.06] flex flex-col justify-between">
              <span className="text-[10px] text-[#8FA39A] uppercase font-medium block">Arma / Serviço (ASC)</span>
              <strong className="text-slate-100 font-semibold block leading-tight mt-1">{militar.asc}</strong>
            </div>
            <div className="p-3 bg-[rgba(12,18,11,0.65)] rounded-xl border border-white/[0.06] flex flex-col justify-between">
              <span className="text-[10px] text-[#8FA39A] uppercase font-medium block">Tempo de Serviço</span>
              <strong className="font-mono text-[#D4AF37] font-bold block mt-1">{militar.tempoServicoAnos} Anos</strong>
            </div>
            <div className="p-3 bg-[rgba(12,18,11,0.65)] rounded-xl border border-white/[0.06] flex flex-col justify-between">
              <span className="text-[10px] text-[#8FA39A] uppercase font-medium block">Função Atual</span>
              <span className="text-[#C5D4BD] font-medium leading-tight block mt-1">{militar.funcaoDesempenhada}</span>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.08]">
          <Link href="/fai/nova">
            <Button size="sm" className="text-xs flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#C29E30] text-[#0D140B] font-bold shadow-xs">
              <FileEdit className="w-3.5 h-3.5" /> Iniciar Nova Avaliação (FAI)
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs flex items-center gap-1.5 bg-[rgba(18,25,16,0.8)] border border-[#758652]/50 text-slate-200 hover:text-white hover:bg-[rgba(24,34,21,0.9)]"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4AF37]" /> Exportar Dossiê em PDF
          </Button>
        </div>
      </div>
    </section>
  );
}
