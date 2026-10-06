'use client';

import React, { useState, useEffect } from 'react';
import { ITENS_INTEGRIDADE } from '@/lib/constants';
import { NivelFator } from '@/types/fai';
import { ShieldCheck, CheckSquare, Square, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlocoIntegridadeProps {
  valorAtual?: NivelFator;
  onChange?: (novoValor: NivelFator) => void;
  readOnly?: boolean;
  avaliadorLabel?: string;
  className?: string;
}

export function BlocoIntegridade({
  valorAtual = 15,
  onChange,
  readOnly = false,
  avaliadorLabel = '1º Avaliador',
  className,
}: BlocoIntegridadeProps) {
  // Deriva o estado inicial a partir do valorAtual (5 -> 1 item, 10 -> 2 itens, 15 -> 3 itens, 20 -> 4 itens)
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>(() => {
    const totalItensAtivos = Math.min(4, Math.max(1, Math.round(valorAtual / 5)));
    const init: Record<string, boolean> = {};
    ITENS_INTEGRIDADE.forEach((item, idx) => {
      init[item.id] = idx < totalItensAtivos;
    });
    return init;
  });

  // Sincroniza se o valorAtual externo mudar
  useEffect(() => {
    const totalItensAtivos = Math.min(4, Math.max(1, Math.round((valorAtual || 5) / 5)));
    const novo: Record<string, boolean> = {};
    ITENS_INTEGRIDADE.forEach((item, idx) => {
      novo[item.id] = idx < totalItensAtivos;
    });
    setSelecionados(novo);
  }, [valorAtual]);

  const toggleItem = (itemId: string) => {
    if (readOnly || !onChange) return;

    const proximo = { ...selecionados, [itemId]: !selecionados[itemId] };
    const contagem = Object.values(proximo).filter(Boolean).length;
    // O regulamento militar das FAA define níveis de 5 em 5 pontos: 5, 10, 15 ou 20
    const novoNivel: NivelFator = (contagem === 0 ? 5 : contagem === 1 ? 5 : contagem === 2 ? 10 : contagem === 3 ? 15 : 20) as NivelFator;

    setSelecionados(proximo);
    onChange(novoNivel);
  };

  const setPredefinido = (nivel: NivelFator) => {
    if (readOnly || !onChange) return;
    const qtd = nivel / 5;
    const novo: Record<string, boolean> = {};
    ITENS_INTEGRIDADE.forEach((item, idx) => {
      novo[item.id] = idx < qtd;
    });
    setSelecionados(novo);
    onChange(nivel);
  };

  const contagemAtivos = Object.values(selecionados).filter(Boolean).length;
  const pontuacaoCalculada = contagemAtivos * 5;

  return (
    <div className={cn('bg-white border border-slate-200 rounded-2xl p-5 shadow-card space-y-4', className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0F3323]/10 border border-[#0F3323]/20 flex items-center justify-center text-[#0F3323]">
            <ShieldCheck className="w-5 h-5 text-[#B89047]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900">
                BLOCO DE INTEGRIDADE (F1 — INTEGRIDADE DE CARÁCTER)
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                ★ Factor Nuclear Obrigatório (Mínimo 15 pts)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Cada componente moral corresponde a <strong>5 pontos</strong> de seleção direta, totalizando até 20 pontos regimentais.
            </p>
          </div>
        </div>

        {/* Tactical Score Badge */}
        <div className="flex items-center gap-2.5 bg-slate-50 p-2 px-3 rounded-xl border border-slate-200 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block leading-tight">
              Pontuação ({avaliadorLabel})
            </span>
            <span className="text-sm font-data-mono font-black text-slate-900">
              {pontuacaoCalculada} <span className="text-xs text-slate-400 font-normal">/ 20 pts</span>
            </span>
          </div>
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shadow-xs',
              pontuacaoCalculada >= 20
                ? 'bg-gradient-to-br from-[#B89047] to-[#D4AF37] text-slate-950 font-black'
                : pontuacaoCalculada >= 15
                ? 'bg-[#0F3323] text-white'
                : pontuacaoCalculada >= 10
                ? 'bg-amber-600 text-white'
                : 'bg-rose-600 text-white'
            )}
          >
            {valorAtual}
          </div>
        </div>
      </div>

      {/* Grid com os 4 quadrados / campos de seleção (5 pontos cada) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ITENS_INTEGRIDADE.map((item, index) => {
          const ativo = Boolean(selecionados[item.id]);

          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={cn(
                'group relative flex items-start gap-3 p-3.5 rounded-xl border transition-all select-none',
                readOnly ? 'cursor-default' : 'cursor-pointer',
                ativo
                  ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              )}
            >
              {/* Caixa / Quadrado seletor */}
              <div
                className={cn(
                  'w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all border',
                  ativo
                    ? 'bg-[#0F3323] text-white border-[#0F3323] shadow-2xs'
                    : 'bg-white border-slate-300 group-hover:border-[#B89047]'
                )}
              >
                {ativo ? (
                  <CheckSquare className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-transparent" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    ITEM {index + 1}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border',
                      ativo
                        ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    )}
                  >
                    +5 PONTOS
                  </span>
                </div>
                <p
                  className={cn(
                    'text-xs mt-1 leading-snug',
                    ativo ? 'font-semibold text-slate-900' : 'text-slate-600'
                  )}
                >
                  {item.titulo}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset Fast Actions & Nuclear Rule Notice */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-[#B89047] shrink-0" />
          <span>
            {pontuacaoCalculada < 15 ? (
              <span className="text-amber-700 font-semibold">
                Atenção: Pontuação abaixo de 15 pontos em Integridade inviabiliza classificação Favorável.
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold">
                Critério de Integridade preenchido conforme o regulamento militar.
              </span>
            )}
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Atalhos:</span>
            <button
              type="button"
              onClick={() => setPredefinido(15)}
              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              15 pts (Padrão Bom)
            </button>
            <button
              type="button"
              onClick={() => setPredefinido(20)}
              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
            >
              20 pts (Excelente)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
