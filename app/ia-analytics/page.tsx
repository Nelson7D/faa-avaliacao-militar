'use client';

import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Award,
  AlertTriangle,
  Copy,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Compass,
  Zap,
} from 'lucide-react';
import { fetchMilitares, fetchFais } from '@/services/firebase/firestore';
import { Militar } from '@/types/militar';
import { FaiDocument } from '@/types/fai';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function IaAnalyticsPage() {
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [fais, setFais] = useState<FaiDocument[]>([]);
  const [f1, setF1] = useState(20);
  const [f5, setF5] = useState(20);
  const [f9, setF9] = useState(20);
  const [f11, setF11] = useState(15);
  const [copied, setCopied] = useState(false);
  const [militarSelecionado, setMilitarSelecionado] = useState('');

  React.useEffect(() => {
    async function loadData() {
      const [milList, faiList] = await Promise.all([fetchMilitares(), fetchFais()]);
      setMilitares(milList);
      setFais(faiList);
      if (milList.length > 0) {
        setMilitarSelecionado(milList[0].nip);
      }
    }
    loadData();
  }, []);

  const gerarParecerIa = () => {
    const f1Texto =
      f1 >= 15
        ? 'demonstra sólida integridade de carácter e cumprimento exemplar dos deveres militares'
        : 'revela necessidade de aperfeiçoamento contínuo nas matérias técnico-profissionais';

    const f5Texto =
      f5 >= 15
        ? 'evidencia elevado sentido do dever, disciplina consciente e aprumo militar irrepreensível'
        : 'apresenta cumprimento regular das diretrizes de comando';

    const f9Texto =
      f9 >= 15
        ? 'distingue-se pela aptidão técnico-profissional profunda e rendimento funcional superior'
        : 'atua dentro dos padrões mínimos exigidos';

    const f11Texto =
      f11 >= 15
        ? 'manifestando capacidade de decisão serena, firme e tempestiva sob condições adversas.'
        : 'carecendo de maior celeridade decisória em cenários de crise.';

    return `O militar avaliado ${f1Texto} (F1), ${f5Texto} (F5). No âmbito funcional e potencial de liderança, ${f9Texto} (F9), ${f11Texto} (F11) Em estrita conformidade com o Manual de Preparação Especial VII das Forças Armadas Angolanas, recomenda-se a sua consideração para progressão e funções de comando.`;
  };

  const parecerGerado = gerarParecerIa();

  const handleCopy = () => {
    navigator.clipboard.writeText(parecerGerado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedMilitarFai = fais.find((f) => f.militarNip === militarSelecionado);
  const probabilidade = selectedMilitarFai
    ? Math.min(100, Math.round(((selectedMilitarFai.mediaPonderada || 10) / 20) * 100))
    : militarSelecionado ? 75 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#B89047]" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Painel de Análise Preditiva e Apoio à Decisão (IA)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Apoio ao Comando na fundamentação técnica regimental, elegibilidade de carreira e prevenção de inconsistências na FAI
          </p>
        </div>
      </div>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Assistente de Pareceres */}
        <div className="executive-card rounded-2xl overflow-hidden shadow-card">
          <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B89047] flex items-center justify-center border border-amber-200/60">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
                Assistente de Pareceres Regimentais
              </h3>
              <p className="text-[11px] text-slate-500">Fundamentação técnica doutrinária</p>
            </div>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <p className="text-xs text-slate-500 leading-relaxed">
              Ajuste as pontuações estimadas para gerar uma minuta formal fundamentada nas diretrizes doutrinárias das FAA:
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium text-slate-700 text-xs">F1 - Preparação Técnica</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">{f1} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={f1}
                  onChange={(e) => setF1(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-slate-200 rounded-full cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium text-slate-700 text-xs">F5 - Lealdade & Liderança</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">{f5} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={f5}
                  onChange={(e) => setF5(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-slate-200 rounded-full cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium text-slate-700 text-xs">F9 - Iniciativa & Proatividade</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">{f9} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={f9}
                  onChange={(e) => setF9(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-slate-200 rounded-full cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium text-slate-700 text-xs">F11 - Decisão em Crise</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">{f11} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={f11}
                  onChange={(e) => setF11(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-slate-200 rounded-full cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3 shadow-2xs">
              <span className="text-[10.5px] uppercase font-semibold text-[#B89047] block tracking-wide">
                Minuta Sugerida (Sem Termos Coloquiais):
              </span>
              <p className="text-xs text-slate-800 italic leading-relaxed">
                "{parecerGerado}"
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs w-full flex items-center justify-center gap-1.5 mt-2 bg-white hover:bg-slate-50 shadow-2xs"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                {copied ? 'Copiado para a Área de Transferência!' : 'Copiar Minuta de Parecer'}
              </Button>
            </div>
          </div>
        </div>

        {/* Column 2: Motor de Elegibilidade */}
        <div className="executive-card rounded-2xl overflow-hidden shadow-card flex flex-col justify-between">
          <div>
            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
                  Motor de Elegibilidade para Promoção
                </h3>
                <p className="text-[11px] text-slate-500">Predição baseada no histórico de FAIs</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-slate-700 text-xs block">
                  Militar em Análise Preditiva
                </label>
                <select
                  value={militarSelecionado}
                  onChange={(e) => setMilitarSelecionado(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-2xs"
                >
                  {militares.length === 0 ? (
                    <option value="">Nenhum militar registado no Firestore</option>
                  ) : (
                    militares.map((m) => (
                      <option key={m.nip} value={m.nip}>
                        {m.posto} {m.nomeCompleto} (NIP {m.nip})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Circular Gauge Visualization */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="7"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={probabilidade >= 80 ? '#0F3323' : probabilidade >= 60 ? '#B89047' : '#DC2626'}
                      strokeWidth="7"
                      strokeDasharray="238.76"
                      strokeDashoffset={238.76 - (238.76 * probabilidade) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-data-mono text-slate-900">
                      {probabilidade}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-medium tracking-wider">
                      PROBABILIDADE
                    </span>
                  </div>
                </div>
              </div>

              {/* Criteria Checklist */}
              <ul className="space-y-2 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Média ponderada consolidada ≥ 15.00 pts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fatores de comando (F1, F5, F9, F11) com pontuação máxima</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sem notas desfavoráveis ou registos punitivos</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 mx-6 mb-6 bg-emerald-50/80 border border-emerald-200/90 rounded-xl text-xs text-emerald-950">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900 mb-1">
              <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Via Recomendada pelo Sistema:</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Aptidão destacada para Funções de Comando Operacional e Estado-Maior Superior.
            </p>
          </div>
        </div>

        {/* Column 3: Detector de Incoerências */}
        <div className="executive-card rounded-2xl overflow-hidden shadow-card">
          <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
                Detector de Incoerências Regimentais
              </h3>
              <p className="text-[11px] text-slate-500">Auditoria automatizada entre fatores</p>
            </div>
          </div>

          <div className="p-6 space-y-3.5 text-xs">
            {/* Dynamic Incoherence Detection */}
            {fais.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-slate-400 mx-auto" />
                <p className="text-slate-600 font-medium text-xs">Nenhum processo FAI registado</p>
                <p className="text-[11px] text-slate-400">As auditorias automáticas serão executadas assim que forem abertas FAIs no ciclo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fais.map((f) => {
                  const notas = f.grelha || {};
                  const f10 = notas['F10']?.cmdte ?? notas['F10']?.avaliador1 ?? 15;
                  const f11 = notas['F11']?.cmdte ?? notas['F11']?.avaliador1 ?? 15;
                  const hasDiscrepancy = f11 >= 20 && f10 <= 5;

                  if (hasDiscrepancy) {
                    return (
                      <div key={f.id} className="p-4 bg-rose-50/60 border border-rose-200/90 rounded-xl space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Alerta de Discrepância • {f.id}</span>
                        </div>
                        <p className="text-slate-800 text-xs leading-relaxed">
                          Militar obteve <strong className="text-slate-900">Nível 20 em F11 (Decisão)</strong> mas <strong className="text-rose-700">Nível 5 em F10 (Julgamento)</strong>.
                        </p>
                        <div className="text-[10.5px] text-rose-800 font-mono font-medium pt-1">
                          Recomendação: Revisão técnica recomendada pelo 2º Avaliador / Conselho.
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={f.id} className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-xl space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Conformidade Regimental • {f.id}</span>
                      </div>
                      <p className="text-slate-800 text-xs leading-relaxed">
                        Média Ponderada: <strong className="font-mono">{f.mediaPonderada?.toFixed(2) || '0.00'}</strong> pts • {f.classificacao}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

