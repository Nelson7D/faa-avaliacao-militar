'use client';

import React from 'react';
import { CategoriaMilitar, FaiBloco03Grelha, NivelFator } from '@/types/fai';
import { FATORES_AVALIACAO, FATORES_EXCLUIDOS_PRACAS, NIVEIS_FATOR_OPCOES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ShieldAlert, Info } from 'lucide-react';

interface Bloco03GrelhaProps {
  categoria: CategoriaMilitar;
  grelha: FaiBloco03Grelha;
  onGrelhaChange: (novaGrelha: FaiBloco03Grelha) => void;
  perfilPraçaSimulado?: boolean;
  onTogglePraçaSimulada?: (simulado: boolean) => void;
  avaliadorInterveniente?: 'avaliador1' | 'avaliador2' | 'cmdte';
  readOnly?: boolean;
}

export function Bloco03Grelha({
  categoria,
  grelha,
  onGrelhaChange,
  perfilPraçaSimulado = false,
  onTogglePraçaSimulada,
  avaliadorInterveniente = 'avaliador1',
  readOnly = false,
}: Bloco03GrelhaProps) {
  const isPraca = categoria === 'PRACA' || perfilPraçaSimulado;

  const handleNotaChange = (
    fatorId: string,
    avaliador: 'avaliador1' | 'avaliador2' | 'cmdte',
    valor: NivelFator
  ) => {
    if (readOnly) return;
    const current = grelha[fatorId] || {};
    const updated = {
      ...grelha,
      [fatorId]: {
        ...current,
        [avaliador]: valor,
      },
    };
    onGrelhaChange(updated);
  };

  return (
    <div className="p-6 bg-white border-b border-slate-200/80">
      {/* Header & Praça Simulation Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
            BLOCO 04 • FACTORES DE AVALIAÇÃO (F1 A F16)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Níveis regimentais permitidos: <strong>5, 10, 15, 20</strong>. Factores nucleares: F1, F5, F7, F9 e F11.
          </p>
        </div>

        {onTogglePraçaSimulada && (
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium select-none hover:bg-slate-100 transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={isPraca}
              onChange={(e) => onTogglePraçaSimulada(e.target.checked)}
              className="accent-primary h-4 w-4 rounded"
            />
            <span className="text-slate-800 font-semibold">Simular Perfil: Praça (Divisor 31)</span>
          </label>
        )}
      </div>

      {/* Info Banner for Praças */}
      {isPraca && (
        <div className="mb-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2 shadow-2xs">
          <Info className="w-4 h-4 shrink-0 text-[#B89047]" />
          <span>
            <strong>Regra das Praças Ativa (Manual VII):</strong> Os factores <strong>F6, F8, F10 e F11</strong> não são
            considerados na avaliação das Praças (Divisor Base = 31).
          </span>
        </div>
      )}

      {/* Table Grid */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold">
              <th className="p-3 font-mono w-12 text-center">ID</th>
              <th className="p-3">Fator de Avaliação</th>
              <th className="p-3 text-center w-16">Coef.</th>
              <th className="p-3 text-center w-48 border-l border-slate-200">
                1º Avaliador
              </th>
              <th className="p-3 text-center w-48 border-l border-slate-200">
                2º Avaliador
              </th>
              <th className="p-3 text-center w-48 border-l border-slate-200">
                Comandante
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {FATORES_AVALIACAO.map((fator) => {
              const isExcluded = isPraca && FATORES_EXCLUIDOS_PRACAS.includes(fator.id);
              const coef = isPraca ? fator.coeficientePraca : fator.coeficienteOficialSargento;
              const notaFator = grelha[fator.id] || {};

              return (
                <tr
                  key={fator.id}
                  className={cn(
                    'transition-colors',
                    isExcluded
                      ? 'bg-slate-50/80 opacity-40 select-none'
                      : 'hover:bg-slate-50/70 even:bg-slate-50/30'
                  )}
                >
                  {/* Fator ID */}
                  <td className="p-3 text-center font-data-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 inline-block">
                      {fator.id}
                    </span>
                  </td>

                  {/* Fator Nome & Descrição */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{fator.nome}</span>
                      {fator.especial && (
                        <span className="text-[#B89047] font-bold text-xs" title="Fator Especial Regimental">
                          *
                        </span>
                      )}
                      {isExcluded && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          N/A Praça
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{fator.descricao}</p>
                  </td>

                  {/* Coeficiente */}
                  <td className="p-3 text-center font-data-mono font-semibold text-slate-600">
                    {isExcluded ? '-' : coef}
                  </td>

                  {/* 1º Avaliador */}
                  <td className="p-2.5 border-l border-slate-100 text-center">
                    {isExcluded ? (
                      <span className="text-slate-400 font-mono text-[11px]">-</span>
                    ) : (
                      <select
                        value={notaFator.avaliador1 || 5}
                        disabled={readOnly}
                        onChange={(e) =>
                          handleNotaChange(fator.id, 'avaliador1', Number(e.target.value) as NivelFator)
                        }
                        className={cn(
                          'w-full py-1.5 px-2.5 border rounded-lg font-data-mono font-semibold text-center text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none cursor-pointer transition-all shadow-2xs',
                          notaFator.avaliador1 === 20 && 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold',
                          notaFator.avaliador1 === 15 && 'bg-emerald-50/50 text-emerald-800 border-emerald-200',
                          notaFator.avaliador1 === 10 && 'bg-amber-50 text-amber-900 border-amber-200',
                          notaFator.avaliador1 === 5 && 'bg-rose-50 text-rose-900 border-rose-300 font-bold'
                        )}
                      >
                        {NIVEIS_FATOR_OPCOES.map((opt) => (
                          <option key={opt.valor} value={opt.valor}>
                            {opt.valor} pts - {opt.valor === 20 ? 'Excelente' : opt.valor === 15 ? 'Bom' : opt.valor === 10 ? 'Regular' : 'Insuficiente'}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* 2º Avaliador */}
                  <td className="p-2.5 border-l border-slate-100 text-center bg-slate-50/30">
                    {isExcluded ? (
                      <span className="text-slate-400 font-mono text-[11px]">-</span>
                    ) : (
                      <select
                        value={notaFator.avaliador2 ?? ''}
                        disabled={readOnly || avaliadorInterveniente === 'avaliador1'}
                        onChange={(e) =>
                          handleNotaChange(
                            fator.id,
                            'avaliador2',
                            e.target.value ? (Number(e.target.value) as NivelFator) : (notaFator.avaliador1 || 5)
                          )
                        }
                        className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg font-data-mono text-center text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none cursor-pointer transition-all shadow-2xs"
                      >
                        <option value="">(Concorda com 1º)</option>
                        {NIVEIS_FATOR_OPCOES.map((opt) => (
                          <option key={opt.valor} value={opt.valor}>
                            {opt.valor} pts
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Comandante */}
                  <td className="p-2.5 border-l border-slate-100 text-center bg-slate-50/60">
                    {isExcluded ? (
                      <span className="text-slate-400 font-mono text-[11px]">-</span>
                    ) : (
                      <select
                        value={notaFator.cmdte ?? ''}
                        disabled={readOnly || avaliadorInterveniente !== 'cmdte'}
                        onChange={(e) =>
                          handleNotaChange(
                            fator.id,
                            'cmdte',
                            e.target.value ? (Number(e.target.value) as NivelFator) : (notaFator.avaliador2 || notaFator.avaliador1 || 5)
                          )
                        }
                        className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg font-data-mono text-center text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none cursor-pointer transition-all shadow-2xs"
                      >
                        <option value="">(Homologa)</option>
                        {NIVEIS_FATOR_OPCOES.map((opt) => (
                          <option key={opt.valor} value={opt.valor}>
                            {opt.valor} pts
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
