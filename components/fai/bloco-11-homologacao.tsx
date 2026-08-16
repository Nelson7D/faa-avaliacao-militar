'use client';

import React from 'react';
import { FaiDocument, DespachoOrgaoPessoal } from '@/types/fai';
import { ShieldCheck, PenTool, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface Bloco11Props {
  fai: FaiDocument;
  onOrgaoPessoalChange: (orgaoPessoal: any) => void;
  onPareceresChange?: (pareceres: FaiDocument['pareceres']) => void;
  readOnly?: boolean;
}

export function Bloco11Homologacao({
  fai,
  onOrgaoPessoalChange,
  onPareceresChange,
  readOnly = false,
}: Bloco11Props) {
  const p = fai.pareceres || {};
  const op: Partial<DespachoOrgaoPessoal> = p.orgaoPessoal || {};
  const avaliado = p.avaliado || {};

  const updateAvaliado = (dados: any) => {
    if (!onPareceresChange) return;
    onPareceresChange({
      ...p,
      avaliado: {
        ...p.avaliado,
        ...dados,
      },
    });
  };

  return (
    <div className="p-6 bg-white space-y-6">
      {/* BLOCO 11: O Avaliado (Tomada de Conhecimento) */}
      <div className="border border-slate-200 rounded-xl p-5 bg-[#FAFBFC] space-y-4 shadow-2xs">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[#B89047]" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              BLOCO 11 • O AVALIADO (TOMADA DE CONHECIMENTO FORMAL)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Direito a Reclamação: 15 Dias
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-medium bg-white p-3.5 border border-slate-200 rounded-xl">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="bloco11_concorda"
              disabled={readOnly}
              checked={avaliado.concordou !== false}
              onChange={() =>
                updateAvaliado({
                  conhecimentoTomado: true,
                  concordou: true,
                  dataConhecimento: avaliado.dataConhecimento || new Date().toISOString().split('T')[0],
                })
              }
              className="accent-primary h-4 w-4"
            />
            <span className="text-slate-900 font-semibold">Tomei conhecimento e CONCORDO com a avaliação</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="bloco11_concorda"
              disabled={readOnly}
              checked={avaliado.concordou === false}
              onChange={() =>
                updateAvaliado({
                  conhecimentoTomado: true,
                  concordou: false,
                  dataConhecimento: avaliado.dataConhecimento || new Date().toISOString().split('T')[0],
                })
              }
              className="accent-rose-600 h-4 w-4"
            />
            <span className="text-rose-800 font-semibold">Tomei conhecimento e DISCORDO (Pretendo Reclamar)</span>
          </label>
        </div>

        {avaliado.concordou === false && (
          <div className="space-y-1.5 animate-in fade-in">
            <label className="text-[11px] font-medium text-slate-700">Fundamentação da Discordância</label>
            <Textarea
              value={avaliado.observacoesDiscordancia || ''}
              disabled={readOnly}
              onChange={(e) => updateAvaliado({ observacoesDiscordancia: e.target.value })}
              placeholder="Indique os factores em que considera ter havido pontuação discrepante..."
              className="min-h-[60px] bg-white text-xs"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Militar Avaliado</label>
            <Input
              value={fai.militar ? `${fai.militar.posto} ${fai.militar.nomeCompleto}` : '-'}
              disabled
              className="text-xs bg-slate-100"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">NIP do Avaliado</label>
            <Input
              value={fai.militarNip || ''}
              disabled
              className="text-xs bg-slate-100 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Data de Ciência</label>
            <Input
              type="date"
              value={avaliado.dataConhecimento || ''}
              disabled={readOnly}
              onChange={(e) => updateAvaliado({ dataConhecimento: e.target.value, conhecimentoTomado: true })}
              className="text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* BLOCO 12: Homologação DPQ */}
      <div className="border border-primary/30 rounded-xl p-5 bg-[#FAFBFC] space-y-4 shadow-2xs">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#B89047]" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              BLOCO 12 • O CHEFE DO ÓRGÃO DE PESSOAL E QUADROS RESPECTIVO (DPQ)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Prazo Regimental: 5 Dias
          </span>
        </div>

        <Textarea
          value={op.despacho || ''}
          disabled={readOnly}
          onChange={(e) =>
            onOrgaoPessoalChange({
              ...op,
              despacho: e.target.value,
              homologado: true,
              data: op.data || new Date().toISOString().split('T')[0],
              assinado: true,
            })
          }
          placeholder="Despacho de homologação superior e registo nos arquivos do Processo Individual (PI)..."
          className="min-h-[80px] bg-white text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">
              Chefe do Órgão de Pessoal (Nome / Posto)
            </label>
            <Input
              value={op.chefeNome ? `${op.posto || ''} ${op.chefeNome}` : ''}
              disabled={readOnly}
              onChange={(e) =>
                onOrgaoPessoalChange({
                  ...op,
                  chefeNome: e.target.value,
                })
              }
              placeholder="Ex: Tenente-Coronel M. Pascoal"
              className="text-xs bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">
              NIP do Chefe do DPQ
            </label>
            <Input
              value={op.chefeNip || ''}
              disabled={readOnly}
              onChange={(e) =>
                onOrgaoPessoalChange({
                  ...op,
                  chefeNip: e.target.value,
                })
              }
              placeholder="Ex: 10048291"
              mono
              className="text-xs bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">
              Data de Homologação
            </label>
            <Input
              type="date"
              value={op.data || ''}
              disabled={readOnly}
              onChange={(e) =>
                onOrgaoPessoalChange({
                  ...op,
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
