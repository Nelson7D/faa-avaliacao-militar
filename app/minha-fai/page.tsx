'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Award,
  ShieldCheck,
  FolderLock,
  PenTool,
  Clock,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { fetchFais, assinarTomadaConhecimento, fetchFaiById } from '@/services/firebase/firestore';
import { FaiDocument } from '@/types/fai';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FATORES_AVALIACAO } from '@/lib/constants';

export default function MinhaFaiPage() {
  const { profile } = useAuth();
  const [fai, setFai] = useState<FaiDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [concordou, setConcordou] = useState(true);
  const [observacoes, setObservacoes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadMyFai() {
      try {
        const allFais = await fetchFais();
        const myFai = profile?.nip
          ? allFais.find((f) => f.militarNip === profile.nip) || null
          : null;
        setFai(myFai);
      } catch (err) {
        console.error('Erro ao carregar FAI do militar:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMyFai();
  }, [profile]);

  const handleAssinar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fai || !profile) return;
    setSubmitting(true);
    try {
      const updated = await assinarTomadaConhecimento(fai.id, {
        nip: profile.nip,
        nome: profile.nomeCompleto,
        posto: profile.posto,
        concordou,
        observacoes,
      });
      if (updated) {
        setFai(updated);
      }
      setSuccessMessage('Tomada de conhecimento regimental assinada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs font-mono text-slate-400 animate-pulse">
        A carregar a sua Ficha de Avaliação Individual...
      </div>
    );
  }

  if (!fai) {
    return (
      <div className="executive-card rounded-2xl p-12 text-center space-y-4">
        <div className="inline-flex p-3 bg-slate-100 rounded-full text-slate-500">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Nenhuma FAI Ativa Encontrada</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Não foi encontrada nenhuma Ficha de Avaliação Individual associada ao seu NIP ({profile?.nip || 'desconhecido'}) para o ciclo corrente.
        </p>
      </div>
    );
  }

  const jaAssinou = Boolean(fai.pareceres?.avaliado?.conhecimentoTomado);
  const avaliadoData = fai.pareceres?.avaliado;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Minha Ficha de Avaliação Individual (FAI)
            </h1>
            <Badge variant="fav" className="text-[10px] px-2.5">
              Ano {fai.anoInstrucao}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {profile?.posto} {profile?.nomeCompleto} • NIP {profile?.nip} • {profile?.unidade}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/militares/${profile?.nip || ''}`}>
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <FolderLock className="w-3.5 h-3.5" /> Meu Dossiê
            </Button>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-semibold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Classification Card */}
      <div className="executive-card rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="space-y-2 flex-1 w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B89047]" />
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-tight">
                Classificação Regimental Homologada
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Processo FAI ID: <strong className="font-mono text-slate-800">{fai.id}</strong> • Etapa Atual:{' '}
              <span className="font-mono font-semibold text-primary">{fai.workflow?.etapaAtual || 'AVALIADOR_1'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-slate-600 pt-1">
              <span>Divisor Aplicado: <strong className="text-slate-900">{fai.divisor || 52}</strong></span>
              <span>Modalidade: <strong className="text-slate-900">{fai.tipo || 'NORMAL'}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-left sm:text-center">
              <span className="block text-[10px] uppercase text-slate-400 font-mono font-medium tracking-wider mb-0.5">
                MÉDIA PONDERADA
              </span>
              <div className="flex items-baseline justify-start sm:justify-center gap-1.5">
                <span className="font-data-mono text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  {(fai.mediaPonderada || 0).toFixed(2)}
                </span>
                <span className="text-xs font-mono text-slate-400">/ 20.00</span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200 hidden sm:block" />

            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-mono font-medium tracking-wider mb-1.5">
                QUALIFICAÇÃO OFICIAL
              </span>
              <Badge
                variant={
                  fai.classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL'
                    ? 'sigFav'
                    : fai.classificacao === 'FAVORÁVEL'
                    ? 'fav'
                    : 'desfav'
                }
                className="text-xs px-3.5 py-1.5 shadow-2xs"
              >
                <ShieldCheck
                  className={`w-4 h-4 mr-1 ${
                    fai.classificacao === 'SIGNIFICATIVAMENTE FAVORÁVEL'
                      ? 'text-emerald-700'
                      : fai.classificacao === 'FAVORÁVEL'
                      ? 'text-[#B89047]'
                      : 'text-rose-600'
                  }`}
                />
                <span>{fai.classificacao || 'FAVORÁVEL'}</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Factores Avaliados */}
      <div className="executive-card rounded-2xl p-6 shadow-card space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
          Discriminação de Notas por Fator Regimental (F1 a F16)
        </h3>

        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3 font-mono w-12 text-center">ID</th>
                <th className="p-3">Fator de Avaliação</th>
                <th className="p-3 text-center w-16">Coef.</th>
                <th className="p-3 text-center w-36">Nota Atribuída</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {FATORES_AVALIACAO.map((fator) => {
                const notaObj = fai.grelha ? fai.grelha[fator.id] : null;
                const notaFinal = notaObj?.cmdte ?? notaObj?.avaliador2 ?? notaObj?.avaliador1 ?? 15;
                const coef = profile?.categoria === 'PRACA' ? fator.coeficientePraca : fator.coeficienteOficialSargento;

                return (
                  <tr key={fator.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 inline-block">
                        {fator.id}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{fator.nome}</div>
                      <div className="text-[11px] text-slate-500">{fator.descricao}</div>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-600 font-semibold">{coef}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                          notaFinal >= 15
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : notaFinal >= 10
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {notaFinal} pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BLOCO 11: TOMADA DE CONHECIMENTO FORMAL */}
      <div className="executive-card rounded-2xl p-6 shadow-card space-y-4 border border-slate-200/80">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <PenTool className="w-4 h-4 text-[#B89047]" />
          <h3 className="text-sm font-bold text-slate-900">
            BLOCO 11 • O AVALIADO (TOMADA DE CONHECIMENTO FORMAL)
          </h3>
        </div>

        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#B89047] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Norma Regimental (Manual VII FAA):</strong> O parecer do militar avaliado é estritamente declaratório de ciência ou de fundamentação de recurso. <strong>Não altera nenhuma das notas ou médias atribuídas na FAI</strong>. Serve apenas para formalizar a concordância ou instruir o processo de impugnação.
          </p>
        </div>

        {jaAssinou ? (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Tomada de conhecimento realizada e registada formalmente.</span>
            </div>
            <p className="text-xs text-emerald-800">
              Data do Registo: <strong className="font-mono">{new Date(avaliadoData?.dataConhecimento || '').toLocaleDateString('pt-AO')}</strong> • Situação:{' '}
              <strong>{avaliadoData?.concordou ? 'Concordou com as Notas' : 'Discordou das Notas (Reclamação Aberta)'}</strong>
            </p>
            {avaliadoData?.observacoesDiscordancia && (
              <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-emerald-200 mt-2">
                <strong>Fundamentação:</strong> {avaliadoData.observacoesDiscordancia}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleAssinar} className="space-y-4">
            <p className="text-xs text-slate-600">
              Nos termos do Regulamento de Avaliação Individual das FAA, o militar avaliado tem o direito e o dever de tomar conhecimento formal da classificação que lhe foi atribuída pelos avaliadores.
            </p>

            <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  name="conhecimento"
                  checked={concordou === true}
                  onChange={() => setConcordou(true)}
                  className="accent-primary h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-900">
                  Tomo conhecimento e CONCORDO com a classificação e notas atribuídas.
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
                <input
                  type="radio"
                  name="conhecimento"
                  checked={concordou === false}
                  onChange={() => setConcordou(false)}
                  className="accent-rose-600 h-4 w-4"
                />
                <span className="text-xs font-semibold text-rose-800">
                  Tomo conhecimento e DISCORDO (Pretendo recorrer / impugnar as notas ao Comandante).
                </span>
              </label>
            </div>

            {!concordou && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-medium text-slate-700">
                  Motivo da Discordância / Fundamentação do Recurso *
                </label>
                <textarea
                  rows={3}
                  required
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Especifique os fatores que considera terem sido pontuados com discrepância..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="text-xs flex items-center gap-2 bg-[#B89047] hover:bg-[#A37E3A] text-white shadow-xs"
            >
              <PenTool className="w-3.5 h-3.5" />
              {submitting ? 'A registar assinatura...' : 'Assinar Tomada de Conhecimento Digital'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
