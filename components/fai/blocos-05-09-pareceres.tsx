'use client';

import React from 'react';
import { FaiDocument } from '@/types/fai';
import { PenTool, CheckCircle, FileCheck, UserCheck, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

interface PareceresProps {
  fai: FaiDocument;
  onPareceresChange: (pareceres: FaiDocument['pareceres']) => void;
  readOnly?: boolean;
  numeroAvaliadores?: 2 | 3;
  papelDesbloqueado?: 'avaliador1' | 'avaliador2' | 'cmdte';
}

export function Blocos05a09Pareceres({
  fai,
  onPareceresChange,
  readOnly = false,
  numeroAvaliadores = 3,
  papelDesbloqueado,
}: PareceresProps) {
  const { profile } = useAuth();
  const p = fai.pareceres || {};
  const userRole = profile?.role || 'DPQ';

  const isAvaliado = userRole === 'MILITAR_AVALIADO';
  const isAdminOrDpq = userRole === 'ADMIN' || userRole === 'DPQ';

  const canEditAval1 =
    !readOnly &&
    !isAvaliado &&
    (papelDesbloqueado
      ? papelDesbloqueado === 'avaliador1'
      : userRole === 'AVALIADOR_1' || isAdminOrDpq);

  const canEditAval2 =
    !readOnly &&
    !isAvaliado &&
    (papelDesbloqueado
      ? papelDesbloqueado === 'avaliador2'
      : userRole === 'AVALIADOR_2' || isAdminOrDpq);

  const canEditCmdte =
    numeroAvaliadores === 3 &&
    !readOnly &&
    !isAvaliado &&
    (papelDesbloqueado
      ? papelDesbloqueado === 'cmdte'
      : userRole === 'CMDTE' || isAdminOrDpq);

  const canEditAsc =
    !readOnly &&
    !isAvaliado &&
    (isAdminOrDpq || (numeroAvaliadores === 3 && (userRole === 'CMDTE' || papelDesbloqueado === 'cmdte')));

  const updateParecer = (key: keyof FaiDocument['pareceres'], value: any) => {
    onPareceresChange({
      ...p,
      [key]: value,
    });
  };

  return (
    <div className="p-6 bg-white space-y-6">
      {isAvaliado && (
        <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2 shadow-2xs">
          <Lock className="w-4 h-4 shrink-0 text-slate-500" />
          <span>
            <strong>Visualização de Pareceres:</strong> Como militar avaliado, os pareceres abaixo são apenas para sua consulta oficial.
          </span>
        </div>
      )}

      {/* BLOCO 07: 1º Avaliador */}
      <div className={cn(
        'border rounded-xl p-5 space-y-3 shadow-2xs transition-all',
        canEditAval1 ? 'border-primary/40 bg-white ring-1 ring-primary/10' : 'border-slate-200 bg-[#FAFBFC]'
      )}>
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
            BLOCO 07 • O PRIMEIRO AVALIADOR (PARECER E FUNDAMENTAÇÃO)
          </h4>
          <div className="flex items-center gap-2">
            {canEditAval1 ? (
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-semibold">
                Sua Assinatura Habilitada
              </span>
            ) : (
              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> Bloqueado
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-500 uppercase">Prazo: 10 Dias</span>
          </div>
        </div>

        <Textarea
          value={p.avaliador1?.texto || ''}
          disabled={!canEditAval1}
          onChange={(e) =>
            updateParecer('avaliador1', {
              ...p.avaliador1,
              texto: e.target.value,
              data: p.avaliador1?.data || new Date().toISOString().split('T')[0],
              nome: p.avaliador1?.nome || profile?.nomeCompleto || '',
              posto: p.avaliador1?.posto || profile?.posto || '',
              nip: p.avaliador1?.nip || profile?.nip || '',
              assinado: true,
            })
          }
          placeholder={canEditAval1 ? "Insira a fundamentação qualitativa sobre o desempenho militar do avaliado..." : "Aguardando parecer do 1º Avaliador..."}
          className="min-h-[80px] bg-white text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Nome e Posto do 1º Avaliador</label>
            <Input
              value={p.avaliador1?.nome ? `${p.avaliador1.posto || ''} ${p.avaliador1.nome}` : ''}
              disabled={!canEditAval1}
              onChange={(e) =>
                updateParecer('avaliador1', {
                  ...p.avaliador1,
                  nome: e.target.value,
                })
              }
              placeholder="Ex: Ten-Cel. M. Pascoal"
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">NIP do Avaliador</label>
            <Input
              value={p.avaliador1?.nip || ''}
              disabled={!canEditAval1}
              onChange={(e) =>
                updateParecer('avaliador1', {
                  ...p.avaliador1,
                  nip: e.target.value,
                })
              }
              placeholder="Ex: 10048291"
              mono
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Data da Assinatura</label>
            <Input
              type="date"
              value={p.avaliador1?.data || ''}
              disabled={!canEditAval1}
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
      <div className={cn(
        'border rounded-xl p-5 space-y-3 shadow-2xs transition-all',
        canEditAval2 ? 'border-primary/40 bg-white ring-1 ring-primary/10' : 'border-slate-200 bg-[#FAFBFC]'
      )}>
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
            BLOCO 08 • O SEGUNDO AVALIADOR (CONCORDÂNCIA / DISCORDÂNCIA FUNDAMENTADA)
          </h4>
          <div className="flex items-center gap-2">
            {canEditAval2 ? (
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-semibold">
                Sua Assinatura Habilitada
              </span>
            ) : (
              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> Bloqueado
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-500 uppercase">Prazo: 5 Dias</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold my-1">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="radio"
              name="aval2_concordancia"
              disabled={!canEditAval2}
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
              disabled={!canEditAval2}
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
          disabled={!canEditAval2}
          onChange={(e) =>
            updateParecer('avaliador2', {
              ...p.avaliador2,
              texto: e.target.value,
              data: p.avaliador2?.data || new Date().toISOString().split('T')[0],
              nome: p.avaliador2?.nome || profile?.nomeCompleto || '',
              posto: p.avaliador2?.posto || profile?.posto || '',
              nip: p.avaliador2?.nip || profile?.nip || '',
              assinado: true,
            })
          }
          placeholder={canEditAval2 ? "Parecer ou observações complementares do 2º Avaliador..." : "Aguardando ratificação do 2º Avaliador..."}
          className="min-h-[70px] bg-white text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Nome e Posto do 2º Avaliador</label>
            <Input
              value={p.avaliador2?.nome ? `${p.avaliador2.posto || ''} ${p.avaliador2.nome}` : ''}
              disabled={!canEditAval2}
              onChange={(e) =>
                updateParecer('avaliador2', {
                  ...p.avaliador2,
                  nome: e.target.value,
                })
              }
              placeholder="Ex: Capitão J. Pires"
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">NIP do 2º Avaliador</label>
            <Input
              value={p.avaliador2?.nip || ''}
              disabled={!canEditAval2}
              onChange={(e) =>
                updateParecer('avaliador2', {
                  ...p.avaliador2,
                  nip: e.target.value,
                })
              }
              placeholder="Ex: 10293847"
              mono
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Data da Assinatura</label>
            <Input
              type="date"
              value={p.avaliador2?.data || ''}
              disabled={!canEditAval2}
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
      <div className={cn(
        'border rounded-xl p-5 space-y-3 shadow-2xs transition-all',
        canEditCmdte ? 'border-primary/40 bg-white ring-1 ring-primary/10' : 'border-slate-200 bg-[#FAFBFC]'
      )}>
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
            BLOCO 09 • O COMANDANTE, DIRECTOR OU CHEFE DA U/E/O (PODER DE SUBSTITUIÇÃO)
          </h4>
          <div className="flex items-center gap-2">
            {canEditCmdte ? (
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-semibold">
                Sua Assinatura Habilitada
              </span>
            ) : (
              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> Bloqueado
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-500 uppercase">Prazo: 5 Dias</span>
          </div>
        </div>

        <Textarea
          value={p.cmdte?.texto || ''}
          disabled={!canEditCmdte}
          onChange={(e) =>
            updateParecer('cmdte', {
              ...p.cmdte,
              texto: e.target.value,
              data: p.cmdte?.data || new Date().toISOString().split('T')[0],
              nome: p.cmdte?.nome || profile?.nomeCompleto || '',
              posto: p.cmdte?.posto || profile?.posto || '',
              nip: p.cmdte?.nip || profile?.nip || '',
              assinado: true,
            })
          }
          placeholder={canEditCmdte ? "Despacho do Comandante. Caso altere alguma nota ou exerça o poder de substituição, insira aqui a justificação expressa..." : "Aguardando despacho de homologação do Comandante..."}
          className="min-h-[70px] bg-white text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Comandante / Diretor</label>
            <Input
              value={p.cmdte?.nome ? `${p.cmdte.posto || ''} ${p.cmdte.nome}` : ''}
              disabled={!canEditCmdte}
              onChange={(e) =>
                updateParecer('cmdte', {
                  ...p.cmdte,
                  nome: e.target.value,
                })
              }
              placeholder="Ex: General de Divisão J. Santos"
              className="text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">NIP do Comandante</label>
            <Input
              value={p.cmdte?.nip || ''}
              disabled={!canEditCmdte}
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
              disabled={!canEditCmdte}
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

      {/* BLOCO 06: Conselho da ASEC */}
      <div className={cn(
        'border rounded-xl p-5 space-y-3 shadow-2xs transition-all',
        canEditAsc ? 'border-primary/40 bg-white ring-1 ring-primary/10' : 'border-slate-200 bg-[#FAFBFC]'
      )}>
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89047]"></span>
            BLOCO 06 • PARECER DO CONSELHO DA ASEC (ARMA / SERVIÇO / CLASSE)
          </h4>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Prazo: 5 Dias</span>
        </div>

        <Textarea
          value={p.conselhoAsc?.texto || ''}
          disabled={!canEditAsc}
          onChange={(e) =>
            updateParecer('conselhoAsc', {
              ...p.conselhoAsc,
              texto: e.target.value,
              data: p.conselhoAsc?.data || new Date().toISOString().split('T')[0],
              assinado: true,
            })
          }
          placeholder={canEditAsc ? "Parecer técnico especializado do Conselho da respectiva Arma, Serviço ou Classe..." : "Aguardando parecer do Conselho da ASC..."}
          className="min-h-[70px] bg-white text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Presidente do Conselho (NIP)</label>
            <Input
              value={p.conselhoAsc?.presidenteNip || ''}
              disabled={!canEditAsc}
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
              disabled={!canEditAsc}
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
              disabled={!canEditAsc}
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
    </div>
  );
}

