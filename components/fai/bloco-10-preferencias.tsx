'use client';

import React from 'react';
import { FaiDocument } from '@/types/fai';
import { AREAS_EMPREGO_PREFERENCIA } from '@/lib/constants';
import { Sparkles, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Bloco10Props {
  preferencias: FaiDocument['preferenciasEmprego'];
  onPreferenciasChange: (prefs: FaiDocument['preferenciasEmprego']) => void;
  readOnly?: boolean;
}

export function Bloco10Preferencias({
  preferencias = {},
  onPreferenciasChange,
  readOnly = false,
}: Bloco10Props) {
  const toggleOpcao = (areaId: string, op: 'op1' | 'op2' | 'op3') => {
    if (readOnly) return;
    const currentArea = preferencias[areaId] || {};
    const newArea = {
      ...currentArea,
      [op]: !currentArea[op],
    };

    // If setting this option, clear this specific option (op1, op2, or op3) from any other area to maintain 1st, 2nd, 3rd priority
    const updated = { ...preferencias };
    if (newArea[op]) {
      Object.keys(updated).forEach((k) => {
        if (k !== areaId && updated[k]?.[op]) {
          updated[k] = { ...updated[k], [op]: false };
        }
      });
    }

    updated[areaId] = newArea;
    onPreferenciasChange(updated);
  };

  return (
    <div className="p-6 bg-white border-b border-border space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5962B]"></span>
            BLOCO 10 - PREFERÊNCIAS DE EMPREGO E ORIENTAÇÃO DE CARREIRA
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Indicação obrigatória de prioridades (1ª, 2ª e 3ª Opção) para colocação e progressão
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFDEA3]/50 border border-[#F2BF51] text-[11px] font-bold text-[#745400]">
          <Sparkles className="w-3.5 h-3.5 text-[#C5962B]" />
          <span>Sugestões da IA com base nas competências F1-F16</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-primary-container text-white border-b border-border">
              <th className="p-3 font-bold uppercase">Área Funcional / Destino Regimental</th>
              <th className="p-3 font-bold uppercase text-center w-24 border-l border-white/20">1ª Opção</th>
              <th className="p-3 font-bold uppercase text-center w-24 border-l border-white/20">2ª Opção</th>
              <th className="p-3 font-bold uppercase text-center w-24 border-l border-white/20">3ª Opção</th>
              <th className="p-3 font-bold uppercase text-center w-40 border-l border-white/20">Orientação IA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {AREAS_EMPREGO_PREFERENCIA.map((area) => {
              const pref = preferencias[area.id] || {};
              const isSuggested = area.id === 'comando' || area.id === 'transmissoes';

              return (
                <tr key={area.id} className="hover:bg-muted/30 even:bg-[#FAFBFC] transition-colors">
                  <td className="p-3 font-medium text-foreground">
                    <div className="font-bold">{area.titulo}</div>
                  </td>

                  {/* 1ª Opção */}
                  <td className="p-3 text-center border-l border-border">
                    <input
                      type="checkbox"
                      checked={Boolean(pref.op1)}
                      disabled={readOnly}
                      onChange={() => toggleOpcao(area.id, 'op1')}
                      className="accent-[#C5962B] h-4 w-4 rounded cursor-pointer"
                      title="1ª Opção"
                    />
                  </td>

                  {/* 2ª Opção */}
                  <td className="p-3 text-center border-l border-border">
                    <input
                      type="checkbox"
                      checked={Boolean(pref.op2)}
                      disabled={readOnly}
                      onChange={() => toggleOpcao(area.id, 'op2')}
                      className="accent-primary h-4 w-4 rounded cursor-pointer"
                      title="2ª Opção"
                    />
                  </td>

                  {/* 3ª Opção */}
                  <td className="p-3 text-center border-l border-border">
                    <input
                      type="checkbox"
                      checked={Boolean(pref.op3)}
                      disabled={readOnly}
                      onChange={() => toggleOpcao(area.id, 'op3')}
                      className="accent-muted-foreground h-4 w-4 rounded cursor-pointer"
                      title="3ª Opção"
                    />
                  </td>

                  {/* Sugestão IA */}
                  <td className="p-3 text-center border-l border-border">
                    {isSuggested ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <Sparkles className="w-3 h-3 text-emerald-700" />
                        Recomendado
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">-</span>
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
