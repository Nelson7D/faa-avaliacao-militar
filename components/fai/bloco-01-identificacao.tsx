'use client';

import React from 'react';
import { Militar } from '@/types/militar';
import { POSTOS_MILITARES, ARMAS_SERVICOS, QUADROS_ESPECIAIS } from '@/lib/constants';
import { Search } from 'lucide-react';

interface Bloco01Props {
  militar: Partial<Militar>;
  onMilitarChange: (militar: Partial<Militar>) => void;
  onSearchNip?: (nip: string) => void;
}

export function Bloco01Identificacao({
  militar,
  onMilitarChange,
  onSearchNip,
}: Bloco01Props) {
  return (
    <div className="p-6 border-b border-border bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C5962B]"></span>
          BLOCO 01 - IDENTIFICAÇÃO DO MILITAR AVALIADO
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          MOD. FAA-RH-042/23
        </span>
      </div>

      <div className="fai-border-grid rounded overflow-hidden text-xs">
        {/* Row 1: Unidade e NIP */}
        <div className="flex flex-col md:flex-row fai-row">
          <div className="fai-border-cell p-3 flex-1 bg-muted/20">
            <label className="block text-[10px] uppercase text-muted-foreground font-bold mb-1">
              Unidade / Estabelecimento / Órgão (U/E/O)
            </label>
            <input
              type="text"
              value={militar.unidade || ''}
              onChange={(e) => onMilitarChange({ ...militar, unidade: e.target.value })}
              placeholder="Ex: Quartel-General do Exército"
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-primary uppercase outline-none"
            />
          </div>

          <div className="fai-border-cell p-3 w-full md:w-64 bg-muted/40 relative">
            <label className="block text-[10px] uppercase text-primary font-bold mb-1">
              NIP (Número Identificação Pessoal)
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={militar.nip || ''}
                onChange={(e) => onMilitarChange({ ...militar, nip: e.target.value })}
                placeholder="Ex: 40020792"
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-data-mono text-sm font-bold text-primary outline-none"
              />
              {onSearchNip && (
                <button
                  type="button"
                  onClick={() => militar.nip && onSearchNip(militar.nip)}
                  className="p-1 bg-[#C5962B] text-white rounded hover:bg-[#9E751D] transition-colors"
                  title="Pesquisar Militar no Sistema"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Posto e Nome Completo */}
        <div className="flex flex-col md:flex-row fai-row">
          <div className="fai-border-cell p-3 w-full md:w-56">
            <label className="block text-[10px] uppercase text-muted-foreground font-bold mb-1">
              Posto / Graduação
            </label>
            <select
              value={militar.posto || ''}
              onChange={(e) => {
                const selectedPosto = POSTOS_MILITARES.find((p) => p.nome === e.target.value);
                onMilitarChange({
                  ...militar,
                  posto: e.target.value,
                  categoria: selectedPosto?.categoria || militar.categoria,
                });
              }}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-primary uppercase outline-none"
            >
              <option value="">Selecione o Posto...</option>
              {POSTOS_MILITARES.map((p) => (
                <option key={p.id} value={p.nome}>
                  {p.nome} ({p.categoria})
                </option>
              ))}
            </select>
          </div>

          <div className="fai-border-cell p-3 flex-1">
            <label className="block text-[10px] uppercase text-muted-foreground font-bold mb-1">
              Nome Completo do Avaliado
            </label>
            <input
              type="text"
              value={militar.nomeCompleto || ''}
              onChange={(e) => onMilitarChange({ ...militar, nomeCompleto: e.target.value })}
              placeholder="Nome Completo por extenso"
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-primary uppercase outline-none"
            />
          </div>
        </div>

        {/* Row 3: Função, Arma/Serviço, Quadro QE */}
        <div className="flex flex-col md:flex-row fai-row">
          <div className="fai-border-cell p-3 flex-1">
            <label className="block text-[10px] uppercase text-muted-foreground font-bold mb-1">
              Função Desempenhada no Período
            </label>
            <input
              type="text"
              value={militar.funcaoDesempenhada || ''}
              onChange={(e) => onMilitarChange({ ...militar, funcaoDesempenhada: e.target.value })}
              placeholder="Ex: Chefe da Secção de Transmissões"
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-medium text-foreground uppercase outline-none"
            />
          </div>

          <div className="fai-border-cell p-3 w-full md:w-56">
            <label className="block text-[10px] uppercase text-muted-foreground font-bold mb-1">
              Arma / Serviço / Classe (ASC)
            </label>
            <select
              value={militar.asc || ''}
              onChange={(e) => onMilitarChange({ ...militar, asc: e.target.value })}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-medium text-foreground outline-none"
            >
              <option value="">Selecione ASC...</option>
              {ARMAS_SERVICOS.map((asc) => (
                <option key={asc} value={asc}>
                  {asc}
                </option>
              ))}
            </select>
          </div>

          <div className="fai-border-cell p-3 w-full md:w-36">
            <label className="block text-[10px] uppercase text-muted-foreground font-bold mb-1">
              Quadro (QE)
            </label>
            <select
              value={militar.qe || 'QP'}
              onChange={(e) => onMilitarChange({ ...militar, qe: e.target.value as 'QP' | 'QRC' | 'QCO' })}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-center text-primary outline-none"
            >
              {QUADROS_ESPECIAIS.map((q) => (
                <option key={q.sigla} value={q.sigla}>
                  {q.sigla} - {q.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
