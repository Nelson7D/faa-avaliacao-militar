'use client';

import React from 'react';
import { FaiDocument } from '@/types/fai';
import { PenTool, CheckCircle, FileCheck, UserCheck, AlertCircle, ShieldCheck } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface PareceresProps {
  fai: FaiDocument;
  onPareceresChange: (pareceres: FaiDocument['pareceres']) => void;
  readOnly?: boolean;
}

export function Blocos05a09Pareceres({ fai, onPareceresChange, readOnly = false }: PareceresProps) {
  const p = fai.pareceres || {};

  const updateParecer = (key: keyof FaiDocument['pareceres'], value: any) => {
    onPareceresChange({
      ...p,
      [key]: value,
    });
  };

  return (
    <div className="p-6 bg-white space-y-6">
      {/* BLOCO 06: Conselho da ASEC */}
      <div className="border border-slate-200 rounded-xl p-5 bg-[#FAFBFC] space-y-3 shadow-2xs">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
            BLOCO 06 • PARECER DO CONSELHO DA ASEC (ARMA / SERVIÇO / CLASSE)
          </h4>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Prazo Regimental: 5 Dias</span>
        </div>

        <Textarea
          value={p.conselhoAsc?.texto || ''}
          disabled={readOnly}
          onChange={(e) =>
            updateParecer('conselhoAsc', {
              ...p.conselhoAsc,
              texto: e.target.value,
              data: p.conselhoAsc?.data || new Date().toISOString().split('T')[0],
              assinado: true,
            })
          }
          placeholder="Parecer técnico especializado do Conselho da respectiva Arma, Serviço ou Classe..."
          className="min-h-[70px] bg-white text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Presidente do Conselho (NIP)</label>
            <Input
              value={p.conselhoAsc?.presidenteNip || ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('conselhoAsc', {
                  ...p.conselhoAsc,
                  presidenteNip: e.target.value,
                })
              }
              placeholder="Ex: 01029384"
              mono
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Secretário do Conselho (NIP)</label>
            <Input
              value={p.conselhoAsc?.secretarioNip || ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('conselhoAsc', {
                  ...p.conselhoAsc,
                  secretarioNip: e.target.value,
                })
              }
              placeholder="Ex: 02039485"
              mono
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Data da Ata</label>
            <Input
              type="date"
              value={p.conselhoAsc?.data || ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('conselhoAsc', {
                  ...p.conselhoAsc,
                  data: e.target.value,
                })
              }
              className="text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* BLOCO 07: 1º Avaliador */}
      <div className="border border-slate-200 rounded-xl p-5 bg-[#FAFBFC] space-y-3 shadow-2xs">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
            BLOCO 07 • O PRIMEIRO AVALIADOR (PARECER E FUNDAMENTAÇÃO)
          </h4>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Prazo Regimental: 10 Dias</span>
        </div>

        <Textarea
          value={p.avaliador1?.texto || ''}
          disabled={readOnly}
          onChange={(e) =>
            updateParecer('avaliador1', {
              ...p.avaliador1,
              texto: e.target.value,
              data: p.avaliador1?.data || new Date().toISOString().split('T')[0],
              assinado: true,
            })
          }
          placeholder="Fundamentação técnica e qualitativa sobre o desempenho militar do avaliado..."
          className="min-h-[80px] bg-white text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Nome e Posto do 1º Avaliador</label>
            <Input
              value={p.avaliador1?.nome ? `${p.avaliador1.posto || ''} ${p.avaliador1.nome}` : ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('avaliador1', {
                  ...p.avaliador1,
                  nome: e.target.value,
                })
              }
              placeholder="Ex: Major M. Pascoal"
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">NIP do Avaliador</label>
            <Input
              value={p.avaliador1?.nip || ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('avaliador1', {
                  ...p.avaliador1,
                  nip: e.target.value,
                })
              }
              placeholder="Ex: 40020792"
              mono
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Data da Assinatura</label>
            <Input
              type="date"
              value={p.avaliador1?.data || ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('avaliador1', {
                  ...p.avaliador1,
                  data: e.target.value,
                })
              }
              className="text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* BLOCO 08: 2º Avaliador */}
      <div className="border border-slate-200 rounded-xl p-5 bg-[#FAFBFC] space-y-3 shadow-2xs">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
            BLOCO 08 • O SEGUNDO AVALIADOR (CONCORDÂNCIA / DISCORDÂNCIA FUNDAMENTADA)
          </h4>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Prazo Regimental: 5 Dias</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold my-1">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="radio"
              name="aval2_concordancia"
              checked={p.avaliador2?.concordancia !== false}
              onChange={() =>
                updateParecer('avaliador2', {
                  ...p.avaliador2,
                  concordancia: true,
                })
              }
              className="accent-primary"
            />
            <span className="text-slate-900">Concordo expressamente com o 1º Avaliador</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="radio"
              name="aval2_concordancia"
              checked={p.avaliador2?.concordancia === false}
              onChange={() =>
                updateParecer('avaliador2', {
                  ...p.avaliador2,
                  concordancia: false,
                })
              }
              className="accent-rose-600"
            />
            <span className="text-rose-800 font-bold">Discordo Parcial / Totalmente (Fundamentação Obrigatória)</span>
          </label>
        </div>

        <Textarea
          value={p.avaliador2?.texto || ''}
          disabled={readOnly}
          onChange={(e) =>
            updateParecer('avaliador2', {
              ...p.avaliador2,
              texto: e.target.value,
              data: p.avaliador2?.data || new Date().toISOString().split('T')[0],
              assinado: true,
            })
          }
          placeholder="Parecer ou observações complementares do 2º Avaliador..."
          className="min-h-[70px] bg-white text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Nome e Posto do 2º Avaliador</label>
            <Input
              value={p.avaliador2?.nome ? `${p.avaliador2.posto || ''} ${p.avaliador2.nome}` : ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('avaliador2', {
                  ...p.avaliador2,
                  nome: e.target.value,
                })
              }
              placeholder="Ex: Coronel F. Ramos"
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">NIP do 2º Avaliador</label>
            <Input
              value={p.avaliador2?.nip || ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('avaliador2', {
                  ...p.avaliador2,
                  nip: e.target.value,
                })
              }
              placeholder="Ex: 08192847"
              mono
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Data da Assinatura</label>
            <Input
              type="date"
              value={p.avaliador2?.data || ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('avaliador2', {
                  ...p.avaliador2,
                  data: e.target.value,
                })
              }
              className="text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* BLOCO 09: Comandante da U/E/O */}
      <div className="border border-slate-200 rounded-xl p-5 bg-[#FAFBFC] space-y-3 shadow-2xs">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
            BLOCO 09 • O COMANDANTE, DIRECTOR OU CHEFE DA U/E/O (PODER DE SUBSTITUIÇÃO)
          </h4>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Prazo Regimental: 5 Dias</span>
        </div>

        <Textarea
          value={p.cmdte?.texto || ''}
          disabled={readOnly}
          onChange={(e) =>
            updateParecer('cmdte', {
              ...p.cmdte,
              texto: e.target.value,
              data: p.cmdte?.data || new Date().toISOString().split('T')[0],
              assinado: true,
            })
          }
          placeholder="Despacho do Comandante. Caso altere alguma nota ou exerça o poder de substituição, insira aqui a justificação expressa..."
          className="min-h-[70px] bg-white text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Comandante / Diretor</label>
            <Input
              value={p.cmdte?.nome ? `${p.cmdte.posto || ''} ${p.cmdte.nome}` : ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('cmdte', {
                  ...p.cmdte,
                  nome: e.target.value,
                })
              }
              placeholder="Ex: General de Brigada J. Santos"
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">NIP do Comandante</label>
            <Input
              value={p.cmdte?.nip || ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('cmdte', {
                  ...p.cmdte,
                  nip: e.target.value,
                })
              }
              placeholder="Ex: 00192837"
              mono
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Data do Despacho</label>
            <Input
              type="date"
              value={p.cmdte?.data || ''}
              disabled={readOnly}
              onChange={(e) =>
                updateParecer('cmdte', {
                  ...p.cmdte,
                  data: e.target.value,
                })
              }
              className="text-xs bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
