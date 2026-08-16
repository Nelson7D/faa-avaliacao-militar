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
    <section className="executive-card rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-card">
      {/* Official Military Portrait */}
      <div className="w-full md:w-60 h-64 md:h-auto bg-slate-100 relative border-r border-slate-200/80 flex-shrink-0 flex items-center justify-center overflow-hidden group">
        {militar.fotoUrl ? (
          <img
            src={militar.fotoUrl}
            alt={militar.nomeCompleto}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          <div className="text-center p-6 text-slate-400">
            <Shield className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <span className="text-xs font-mono font-medium">Foto Regimental</span>
          </div>
        )}

        {/* Status Overlay */}
        <div className="absolute bottom-0 w-full bg-[#0B1612]/90 backdrop-blur-md p-2 flex justify-center items-center gap-2 border-t border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-[10px] font-semibold font-mono text-white tracking-wide uppercase">
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
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10.5px] font-semibold font-mono border border-slate-200/80 uppercase">
                  {militar.posto} • {militar.categoria}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
                {militar.nomeCompleto}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Nome de Guerra: <strong className="text-slate-800 font-semibold">{militar.nomeGuerra}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10.5px] font-mono font-medium text-slate-400 uppercase block">
                NIP REGIMENTAL
              </span>
              <span className="font-data-mono text-base font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/80 inline-block mt-0.5 shadow-2xs">
                {formatNip(militar.nip)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 mt-4 text-xs">
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-medium block">Unidade Atual</span>
              <strong className="text-slate-900 font-semibold block leading-tight mt-1">{militar.unidade}</strong>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-medium block">Arma / Serviço (ASC)</span>
              <strong className="text-slate-900 font-semibold block leading-tight mt-1">{militar.asc}</strong>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-medium block">Tempo de Serviço</span>
              <strong className="font-mono text-slate-900 font-bold block mt-1">{militar.tempoServicoAnos} Anos</strong>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-medium block">Função Atual</span>
              <span className="text-slate-800 font-medium leading-tight block mt-1">{militar.funcaoDesempenhada}</span>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
          <Link href="/fai/nova">
            <Button variant="default" size="sm" className="text-xs flex items-center gap-1.5 shadow-xs">
              <FileEdit className="w-3.5 h-3.5" /> Iniciar Nova Avaliação (FAI)
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Exportar Dossiê em PDF
          </Button>
        </div>
      </div>
    </section>
  );
}
