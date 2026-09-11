'use client';

import React, { useState } from 'react';
import { CategoriaMilitar, FaiBloco03Grelha, NivelFator } from '@/types/fai';
import { FATORES_AVALIACAO, FATORES_EXCLUIDOS_PRACAS, NIVEIS_FATOR_OPCOES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Lock,
  CheckCircle2,
  Zap,
  CheckCheck,
  Sparkles,
  Award,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

interface Bloco03GrelhaProps {
  categoria: CategoriaMilitar;
  grelha: FaiBloco03Grelha;
  onGrelhaChange: (novaGrelha: FaiBloco03Grelha) => void;
  perfilPraçaSimulado?: boolean;
  onTogglePraçaSimulada?: (simulado: boolean) => void;
  avaliadorInterveniente?: 'avaliador1' | 'avaliador2' | 'cmdte' | 'efetivo';
  readOnly?: boolean;
  numeroAvaliadores?: 2 | 3;
  papelDesbloqueado?: 'avaliador1' | 'avaliador2' | 'cmdte';
}

const NIVEIS: NivelFator[] = [5, 10, 15, 20];

export function Bloco03Grelha({
  categoria,
  grelha,
  onGrelhaChange,
  perfilPraçaSimulado = false,
  onTogglePraçaSimulada,
  readOnly = false,
  numeroAvaliadores = 3,
  papelDesbloqueado,
}: Bloco03GrelhaProps) {
  const { profile } = useAuth();
  const isPraca = categoria === 'PRACA' || perfilPraçaSimulado;
  const userRole = profile?.role || 'DPQ';

  const [batchActionSuccess, setBatchActionSuccess] = useState<string | null>(null);

  // Permission Logic per Column
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

  const triggerBatchMessage = (msg: string) => {
    setBatchActionSuccess(msg);
    setTimeout(() => setBatchActionSuccess(null), 3000);
  };

  const handleNotaChange = (
    fatorId: string,
    avaliador: 'avaliador1' | 'avaliador2' | 'cmdte',
    valor?: NivelFator
  ) => {
    if (readOnly || isAvaliado) return;
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

  // Batch action: preenchimento rápido de base para 1º Avaliador
  const handlePreencherBaseAval1 = (nivel: NivelFator) => {
    if (!canEditAval1) return;
    const updated: FaiBloco03Grelha = { ...grelha };
    FATORES_AVALIACAO.forEach((f) => {
      const isExcluded = isPraca && FATORES_EXCLUIDOS_PRACAS.includes(f.id);
      if (!isExcluded) {
        updated[f.id] = {
          ...(updated[f.id] || {}),
          avaliador1: nivel,
        };
      }
    });
    onGrelhaChange(updated);
    triggerBatchMessage(`1º Avaliador: Todos os fatores preenchidos com nível ${nivel} pts!`);
  };

  // Batch action: 2º Avaliador concorda integralmente com 1º
  const handleConcordarTudoAval2 = () => {
    if (!canEditAval2) return;
    const updated: FaiBloco03Grelha = { ...grelha };
    FATORES_AVALIACAO.forEach((f) => {
      const isExcluded = isPraca && FATORES_EXCLUIDOS_PRACAS.includes(f.id);
      if (!isExcluded && updated[f.id]) {
        const { avaliador2, ...resto } = updated[f.id];
        updated[f.id] = resto;
      }
    });
    onGrelhaChange(updated);
    triggerBatchMessage('2º Avaliador: Concordância integral com o 1º Avaliador registada!');
  };

  // Batch action: Comandante homologa integralmente
  const handleHomologarTudoCmdte = () => {
    if (!canEditCmdte) return;
    const updated: FaiBloco03Grelha = { ...grelha };
    FATORES_AVALIACAO.forEach((f) => {
      const isExcluded = isPraca && FATORES_EXCLUIDOS_PRACAS.includes(f.id);
      if (!isExcluded && updated[f.id]) {
        const { cmdte, ...resto } = updated[f.id];
        updated[f.id] = resto;
      }
    });
    onGrelhaChange(updated);
    triggerBatchMessage('Comandante: Homologação integral registada com sucesso!');
  };

  // Group filtering to reduce cognitive load
  const [grupoAtivo, setGrupoAtivo] = useState<string>('TODOS');
  const [apenasNucleares, setApenasNucleares] = useState<boolean>(false);

  const GRUPOS_LABELS: Record<string, string> = {
    TODOS: 'Todos os Factores',
    TECNICO_PROFISSIONAL: 'Técnico-Profissional',
    LIDERANCA_DISCIPLINA: 'Liderança e Disciplina',
    POTENCIAL_DESENVOLVIMENTO: 'Potencial de Desenv.',
    CONDICAO_GERAL: 'Condição Geral',
  };

  // Contagem de fatores nucleares com nota < 15
  const nuclearesAbaixoDe15 = FATORES_AVALIACAO.filter((f) => {
    if (!f.especial) return false;
    if (isPraca && FATORES_EXCLUIDOS_PRACAS.includes(f.id)) return false;
    const notaObj = grelha[f.id] || {};
    const notaEfetiva =
      (numeroAvaliadores === 3 && notaObj.cmdte !== undefined ? notaObj.cmdte : null) ??
      (notaObj.avaliador2 !== undefined ? notaObj.avaliador2 : null) ??
      notaObj.avaliador1 ??
      15;
    return notaEfetiva < 15;
  });

  const fatoresFiltrados = FATORES_AVALIACAO.filter((f) => {
    if (apenasNucleares && !f.especial) return false;
    if (grupoAtivo !== 'TODOS' && f.grupo !== grupoAtivo) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 space-y-4">
      {/* Top Tactical Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
              Factores de Avaliação (F1 a F16)
            </h3>
            {nuclearesAbaixoDe15.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {nuclearesAbaixoDe15.length} nuclear(es) &lt; 15
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Nucleares Conformados
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pontuação regimental: <strong className="text-slate-800">5</strong> (Insuficiente), <strong className="text-slate-800">10</strong> (Regular), <strong className="text-slate-800">15</strong> (Bom), <strong className="text-slate-800">20</strong> (Excelente).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onTogglePraçaSimulada && (
            <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-xl border border-slate-300/80 text-xs font-semibold text-slate-800 select-none transition-all shadow-2xs">
              <input
                type="checkbox"
                checked={isPraca}
                onChange={(e) => onTogglePraçaSimulada(e.target.checked)}
                className="accent-[#0F3323] h-4 w-4 rounded"
              />
              <span>Simular Praça (Divisor 31)</span>
            </label>
          )}
        </div>
      </div>

      {/* Group Navigation Bar - Reduces cognitive load */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200/80 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-1">
          {Object.entries(GRUPOS_LABELS).map(([key, label]) => {
            const count = FATORES_AVALIACAO.filter((f) => {
              if (key !== 'TODOS' && f.grupo !== key) return false;
              if (apenasNucleares && !f.especial) return false;
              return true;
            }).length;

            const active = grupoAtivo === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setGrupoAtivo(key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                  active
                    ? 'bg-[#0F3323] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.2 rounded-full',
                    active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setApenasNucleares(!apenasNucleares)}
          className={cn(
            'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer',
            apenasNucleares
              ? 'bg-[#B89047] text-white border-[#B89047] shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          )}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Apenas Nucleares (*)</span>
        </button>
      </div>

      {/* Role Alert / Lock Notices */}
      {isAvaliado && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0 text-[#B89047]" />
          <span>
            <strong>Modo de Consulta:</strong> Grelha de visualização protegida. A tomada de conhecimento realiza-se no Bloco 11.
          </span>
        </div>
      )}

      {/* Dynamic Batch Actions Bar (1-Click Fill) */}
      {(canEditAval1 || canEditAval2 || canEditCmdte) && (
        <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Preenchimento rápido:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canEditAval1 && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreencherBaseAval1(15)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-[11px] h-7 px-2.5 rounded-lg font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#D4AF37] mr-1" />
                  Preencher Base (15 - Bom)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreencherBaseAval1(20)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-[11px] h-7 px-2.5 rounded-lg font-semibold cursor-pointer"
                >
                  <Award className="w-3 h-3 text-amber-300 mr-1" />
                  Nível 20 (Excelente)
                </Button>
              </>
            )}

            {canEditAval2 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleConcordarTudoAval2}
                className="bg-[#D4AF37] hover:bg-[#B89047] text-slate-950 font-bold border-none text-[11px] h-7 px-2.5 rounded-lg cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Concordar c/ 1º Avaliador (Todos)
              </Button>
            )}

            {canEditCmdte && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleHomologarTudoCmdte}
                className="bg-[#D4AF37] hover:bg-[#B89047] text-slate-950 font-bold border-none text-[11px] h-7 px-2.5 rounded-lg cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Homologar Tudo (Comandante)
              </Button>
            )}
          </div>
        </div>
      )}

      {batchActionSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{batchActionSuccess}</span>
        </div>
      )}

      {/* Factors Table with Segmented Buttons */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-800 border-b border-slate-200 font-bold tracking-tight">
                <th className="p-3 font-mono w-14 text-center">ID</th>
                <th className="p-3 min-w-[240px]">Factor de Avaliação</th>
                <th className="p-3 text-center w-14 font-mono">Coef.</th>

                {/* Coluna 1º Avaliador */}
                <th className="p-3 text-center w-56 border-l border-slate-200">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-slate-900">1º Avaliador</span>
                    {!canEditAval1 && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>
                </th>

                {/* Coluna 2º Avaliador */}
                <th className="p-3 text-center w-56 border-l border-slate-200 bg-slate-50/50">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-900">2º Avaliador</span>
                      {!canEditAval2 && <Lock className="w-3 h-3 text-slate-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {numeroAvaliadores === 2 ? '(Determina Média)' : '(Revisão)'}
                    </span>
                  </div>
                </th>

                {/* Coluna Comandante */}
                {numeroAvaliadores === 3 ? (
                  <th className="p-3 text-center w-56 border-l border-slate-200 bg-amber-50/20">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900">Comandante</span>
                        {!canEditCmdte && <Lock className="w-3 h-3 text-slate-400" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">(Homologação)</span>
                    </div>
                  </th>
                ) : (
                  <th className="p-3 text-center w-28 border-l border-slate-200 bg-slate-100/40 text-slate-400 font-normal text-[11px]">
                    Dispensado
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {fatoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <p className="text-xs font-semibold">Nenhum factor encontrado para este filtro.</p>
                  </td>
                </tr>
              ) : (
                fatoresFiltrados.map((fator, index) => {
                  const isExcluded = isPraca && FATORES_EXCLUIDOS_PRACAS.includes(fator.id);
                  const coef = isPraca ? fator.coeficientePraca : fator.coeficienteOficialSargento;
                  const notaFator = grelha[fator.id] || {};

                  // Valores efetivos
                  const valAval1 = notaFator.avaliador1 ?? 15;
                  const valAval2 = notaFator.avaliador2;
                  const valCmdte = notaFator.cmdte;

                  return (
                    <tr
                      key={fator.id}
                      className={cn(
                        'transition-colors',
                        isExcluded
                          ? 'bg-slate-50/70 text-slate-400 select-none'
                          : index % 2 === 0
                          ? 'bg-white hover:bg-slate-50/80'
                          : 'bg-slate-50/30 hover:bg-slate-50/80'
                      )}
                    >
                      {/* ID */}
                      <td className="p-3 text-center font-data-mono font-bold text-slate-800">
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/80">
                          {fator.id}
                        </div>
                      </td>

                      {/* Nome & Descrição */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn('font-bold', isExcluded ? 'text-slate-500' : 'text-slate-900')}>
                            {fator.nome}
                          </span>
                          {fator.especial && (
                            <span
                              className="text-[10px] font-mono font-bold text-[#B89047] bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded"
                              title="Factor Nuclear Regimental (Mínimo Nível 15)"
                            >
                              ★ Nuclear
                            </span>
                          )}
                          {isExcluded && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-200/80 px-1.5 py-0.2 rounded">
                              Excluído em Praças (Divisor 31)
                            </span>
                          )}
                        </div>
                        <p className={cn('text-[11px] mt-0.5 leading-tight', isExcluded ? 'text-slate-400' : 'text-slate-500')}>
                          {fator.descricao}
                        </p>
                      </td>

                    {/* Coeficiente */}
                    <td className="p-3 text-center font-data-mono font-bold text-slate-700">
                      {isExcluded ? '-' : coef}
                    </td>

                    {/* 1º AVALIADOR - Segmented Pills */}
                    <td className="p-2 border-l border-slate-100 text-center">
                      {isExcluded ? (
                        <span className="text-slate-400 font-mono text-xs">-</span>
                      ) : (
                        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 gap-1 shadow-2xs">
                          {NIVEIS.map((n) => {
                            const isSelected = valAval1 === n;
                            return (
                              <button
                                key={n}
                                type="button"
                                disabled={!canEditAval1}
                                onClick={() => handleNotaChange(fator.id, 'avaliador1', n)}
                                className={cn(
                                  'w-8 h-7 text-xs font-mono font-bold rounded-lg transition-all',
                                  isSelected
                                    ? n === 20
                                      ? 'bg-gradient-to-r from-[#B89047] to-[#D4AF37] text-slate-950 shadow-xs ring-1 ring-amber-400'
                                      : n === 15
                                      ? 'bg-[#0F3323] text-white shadow-xs'
                                      : n === 10
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
                                  !canEditAval1 && 'opacity-60 cursor-not-allowed'
                                )}
                              >
                                {n}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* 2º AVALIADOR - Segmented Pills + Concordar */}
                    <td className="p-2 border-l border-slate-100 text-center bg-slate-50/40">
                      {isExcluded ? (
                        <span className="text-slate-400 font-mono text-xs">-</span>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 gap-1 shadow-2xs">
                            {NIVEIS.map((n) => {
                              const isSelected = valAval2 === n;
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  disabled={!canEditAval2}
                                  onClick={() => handleNotaChange(fator.id, 'avaliador2', n)}
                                  className={cn(
                                    'w-8 h-7 text-xs font-mono font-bold rounded-lg transition-all',
                                    isSelected
                                      ? n === 20
                                        ? 'bg-gradient-to-r from-[#B89047] to-[#D4AF37] text-slate-950 shadow-xs ring-1 ring-amber-400'
                                        : n === 15
                                        ? 'bg-[#0F3323] text-white shadow-xs'
                                        : n === 10
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : 'bg-rose-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:bg-white hover:text-slate-900',
                                    !canEditAval2 && 'opacity-60 cursor-not-allowed'
                                  )}
                                >
                                  {n}
                                </button>
                              );
                            })}
                          </div>

                          {valAval2 === undefined ? (
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              ✓ Concorda ({valAval1} pts)
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={!canEditAval2}
                              onClick={() => handleNotaChange(fator.id, 'avaliador2', undefined)}
                              className="text-[10px] font-mono text-[#B89047] hover:underline cursor-pointer"
                            >
                              Repor concordância
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* COMANDANTE - Segmented Pills + Homologar */}
                    {numeroAvaliadores === 3 ? (
                      <td className="p-2 border-l border-slate-100 text-center bg-amber-50/20">
                        {isExcluded ? (
                          <span className="text-slate-400 font-mono text-xs">-</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 gap-1 shadow-2xs">
                              {NIVEIS.map((n) => {
                                const isSelected = valCmdte === n;
                                return (
                                  <button
                                    key={n}
                                    type="button"
                                    disabled={!canEditCmdte}
                                    onClick={() => handleNotaChange(fator.id, 'cmdte', n)}
                                    className={cn(
                                      'w-8 h-7 text-xs font-mono font-bold rounded-lg transition-all',
                                      isSelected
                                        ? n === 20
                                          ? 'bg-gradient-to-r from-[#B89047] to-[#D4AF37] text-slate-950 shadow-xs ring-1 ring-amber-400'
                                          : n === 15
                                          ? 'bg-[#0F3323] text-white shadow-xs'
                                          : n === 10
                                          ? 'bg-amber-600 text-white shadow-xs'
                                          : 'bg-rose-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-white hover:text-slate-900',
                                      !canEditCmdte && 'opacity-60 cursor-not-allowed'
                                    )}
                                  >
                                    {n}
                                  </button>
                                );
                              })}
                            </div>

                            {valCmdte === undefined ? (
                              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                ✓ Homologa ({valAval2 ?? valAval1} pts)
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={!canEditCmdte}
                                onClick={() => handleNotaChange(fator.id, 'cmdte', undefined)}
                                className="text-[10px] font-mono text-[#B89047] hover:underline cursor-pointer"
                              >
                                Repor homologação
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    ) : (
                      <td className="p-2 border-l border-slate-100 text-center bg-slate-100/40">
                        <span className="text-slate-300 font-mono text-xs">-</span>
                      </td>
                    )}
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
