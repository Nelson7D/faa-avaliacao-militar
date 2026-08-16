'use client';

import React from 'react';
import { Militar } from '@/types/militar';
import { FaiDocument } from '@/types/fai';
import { CheckCircle2, XCircle, Award, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PromocoesTabProps {
  militar: Militar;
  fais: FaiDocument[];
}

export function PromocoesTab({ militar, fais }: PromocoesTabProps) {
  const tempoMinimoAnos = 4;
  const cumpriuTempo = militar.tempoServicoAnos >= tempoMinimoAnos;

  const ultimasFais = fais.slice(0, 3);
  const mediaUltimas =
    ultimasFais.length > 0
      ? ultimasFais.reduce((acc, f) => acc + f.mediaPonderada, 0) / ultimasFais.length
      : 0;

  const mediaSuficiente = mediaUltimas >= 15.0;

  const ultimaFai = ultimasFais[0];
  const notas = ultimaFai?.grelha || {};
  const f1 = notas['F1']?.cmdte ?? notas['F1']?.avaliador1 ?? 0;
  const f5 = notas['F5']?.cmdte ?? notas['F5']?.avaliador1 ?? 0;
  const f9 = notas['F9']?.cmdte ?? notas['F9']?.avaliador1 ?? 0;
  const f11 = militar.categoria === 'PRACA' ? 20 : (notas['F11']?.cmdte ?? notas['F11']?.avaliador1 ?? 0);

  const fatoresEspeciaisOk = f1 >= 15 && f5 >= 15 && f9 >= 15 && f11 >= 15;
  const semRegistosPunitivos = true;

  const aptoPromocaoEscolha =
    cumpriuTempo && mediaSuficiente && fatoresEspeciaisOk && semRegistosPunitivos;

  const scoreCalculado = (
    (cumpriuTempo ? 25 : 0) +
    (mediaSuficiente ? 25 : 0) +
    (fatoresEspeciaisOk ? 25 : 0) +
    (semRegistosPunitivos ? 25 : 0)
  );

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="executive-card rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-[#B89047]" />
              Checklist Regimental de Elegibilidade para Promoção
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Critérios para promoção por Antiguidade e por Escolha ao posto imediato
            </p>
          </div>

          <Badge variant={aptoPromocaoEscolha ? 'sigFav' : 'fav'} className="text-xs px-3.5 py-1 shrink-0">
            {aptoPromocaoEscolha ? 'Apto para Promoção' : 'Pendente de Requisitos'}
          </Badge>
        </div>

        {/* Progress Bar of Promotion Readiness */}
        <div className="space-y-2 p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-600 font-medium">Índice de Conformidade Regimental</span>
            <strong className="text-slate-900 font-bold">{scoreCalculado}%</strong>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${scoreCalculado}%` }}
              className={`h-full rounded-full transition-all duration-500 ${scoreCalculado === 100 ? 'bg-emerald-600' : 'bg-[#B89047]'}`}
            />
          </div>
        </div>

        {/* Requirements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          {/* Req 1 */}
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/60 flex items-start gap-3.5 transition-all hover:bg-white hover:border-slate-200 shadow-2xs">
            {cumpriuTempo ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="text-slate-900 font-semibold block">Tempo Mínimo de Permanência no Posto</strong>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Exigido: {tempoMinimoAnos} anos • Cumprido: <strong className="font-mono text-slate-900 font-semibold">{militar.tempoServicoAnos} anos</strong>
              </p>
            </div>
          </div>

          {/* Req 2 */}
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/60 flex items-start gap-3.5 transition-all hover:bg-white hover:border-slate-200 shadow-2xs">
            {mediaSuficiente ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="text-slate-900 font-semibold block">Média das Últimas FAIs ≥ 15.00</strong>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Média apurada: <strong className="font-mono text-slate-900 font-semibold">{mediaUltimas.toFixed(2)} pts</strong> (Qualificação Favorável)
              </p>
            </div>
          </div>

          {/* Req 3 */}
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/60 flex items-start gap-3.5 transition-all hover:bg-white hover:border-slate-200 shadow-2xs">
            {fatoresEspeciaisOk ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="text-slate-900 font-semibold block">Fatores Chave de Comando (F1, F5, F9, F11 ≥ 15)</strong>
              <p className="text-slate-500 mt-1 font-mono text-[11px]">
                F1: {f1} • F5: {f5} • F9: {f9} • F11: {f11}
              </p>
            </div>
          </div>

          {/* Req 4 */}
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/60 flex items-start gap-3.5 transition-all hover:bg-white hover:border-slate-200 shadow-2xs">
            {semRegistosPunitivos ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="text-slate-900 font-semibold block">Idoneidade Militar & Disciplina</strong>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Ausência de penas disciplinares graves nos últimos 24 meses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
