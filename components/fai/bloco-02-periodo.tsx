'use client';

import React from 'react';

interface Bloco02Props {
  anoInstrucao: string;
  onAnoInstrucaoChange: (ano: string) => void;
  periodoInicio: string;
  onPeriodoInicioChange: (data: string) => void;
  periodoFim: string;
  onPeriodoFimChange: (data: string) => void;
  tipo: 'PERIODICA' | 'EXTRAORDINARIA';
  onTipoChange: (tipo: 'PERIODICA' | 'EXTRAORDINARIA') => void;
  observacoes?: string;
  onObservacoesChange?: (obs: string) => void;
}

export function Bloco02Periodo({
  anoInstrucao,
  onAnoInstrucaoChange,
  periodoInicio,
  onPeriodoInicioChange,
  periodoFim,
  onPeriodoFimChange,
  tipo,
  onTipoChange,
  observacoes,
  onObservacoesChange,
}: Bloco02Props) {
  return (
    <div className="p-6 border-b border-border bg-[#FAFBFC]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
          BLOCO 02 - PERÍODO E TIPO DE AVALIAÇÃO
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Ano de Instrução:</label>
          <input
            type="text"
            value={anoInstrucao}
            onChange={(e) => onAnoInstrucaoChange(e.target.value)}
            className="px-2 py-1 text-xs border border-border rounded font-mono font-bold text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary w-28 text-center"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 border border-border rounded">
        {/* Datas do Período */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-muted-foreground w-28">Data Início:</label>
            <input
              type="date"
              value={periodoInicio}
              onChange={(e) => onPeriodoInicioChange(e.target.value)}
              className="px-3 py-1.5 border border-border rounded text-xs font-mono bg-[#FAFBFC] focus:outline-none focus:ring-1 focus:ring-primary flex-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-muted-foreground w-28">Data Fim:</label>
            <input
              type="date"
              value={periodoFim}
              onChange={(e) => onPeriodoFimChange(e.target.value)}
              className="px-3 py-1.5 border border-border rounded text-xs font-mono bg-[#FAFBFC] focus:outline-none focus:ring-1 focus:ring-primary flex-1"
            />
          </div>
        </div>

        {/* Tipo de Avaliação */}
        <div className="space-y-3 border-t md:border-t-0 md:border-l border-border md:pl-6 pt-3 md:pt-0">
          <label className="block text-xs font-bold text-primary uppercase">Modalidade Regimental</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
              <input
                type="radio"
                name="tipo_aval"
                checked={tipo === 'PERIODICA'}
                onChange={() => onTipoChange('PERIODICA')}
                className="accent-primary focus:ring-primary h-4 w-4"
              />
              <span>Periódica (Ordinária Anual de Instrução)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
              <input
                type="radio"
                name="tipo_aval"
                checked={tipo === 'EXTRAORDINARIA'}
                onChange={() => onTipoChange('EXTRAORDINARIA')}
                className="accent-primary focus:ring-primary h-4 w-4"
              />
              <span>Extraordinária (Promoção Antecipada / Louvor / Disciplinar)</span>
            </label>
          </div>
        </div>

        {/* Observações Complementares */}
        {onObservacoesChange && (
          <div className="col-span-full pt-3 border-t border-border">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
              Observações Especiais do Bloco 02
            </label>
            <input
              type="text"
              value={observacoes || ''}
              onChange={(e) => onObservacoesChange(e.target.value)}
              placeholder="Ex: Oficial destacado em comissão de serviço de 01/03 a 30/06."
              className="w-full px-3 py-1.5 border border-border rounded text-xs bg-[#FAFBFC] focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
