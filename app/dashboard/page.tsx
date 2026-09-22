'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileClock,
  Calculator,
  Award,
  PlusCircle,
  ArrowUpRight,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Clipboard,
  AlertCircle,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { TacticalKPICard } from '@/components/dashboard/tactical-kpi-card';
import { DistributionChart } from '@/components/dashboard/distribution-chart';
import { DeadlinesAlertWidget } from '@/components/dashboard/deadlines-alert-widget';
import { RecentFaisTable } from '@/components/dashboard/recent-fais-table';
import { PipelineWorkflowWidget } from '@/components/dashboard/pipeline-workflow-widget';
import { fetchFais, fetchMilitares, validarCodigoAcessoAvaliacao } from '@/services/firebase/firestore';
import { FaiDocument } from '@/types/fai';
import { Militar } from '@/types/militar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [fais, setFais] = useState<FaiDocument[]>([]);
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter by pipeline stage
  const [filtroEtapa, setFiltroEtapa] = useState<string | null>(null);

  // Quick Access Code State
  const [codigoQuick, setCodigoQuick] = useState('');
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [codigoError, setCodigoError] = useState('');

  async function loadData() {
    setLoading(true);
    setFetchError(null);
    try {
      const [faisData, militaresData] = await Promise.all([
        fetchFais(),
        fetchMilitares(),
      ]);
      setFais(faisData);
      setMilitares(militaresData);
    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setFetchError('Não foi possível carregar os dados de avaliação. Verifique a sua ligação ao servidor.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleValidarCodigoRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoQuick.trim()) return;
    setValidandoCodigo(true);
    setCodigoError('');
    try {
      const res = await validarCodigoAcessoAvaliacao(codigoQuick);
      if (res.valido && res.atribuicao) {
        if (res.faiId) {
          router.push(`/fai/${res.faiId}?codigo=${encodeURIComponent(codigoQuick.trim().toUpperCase())}`);
        } else {
          router.push(
            `/fai/nova?atribuicaoId=${res.atribuicao.id}&nip=${res.atribuicao.militarAvaliadoNip}&codigo=${encodeURIComponent(
              codigoQuick.trim().toUpperCase()
            )}`
          );
        }
      } else {
        setCodigoError(res.mensagem || 'Código não encontrado no sistema.');
      }
    } catch (err: any) {
      setCodigoError('Erro de conexão ao validar o código.');
    } finally {
      setValidandoCodigo(false);
    }
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="A carregar dados do dashboard">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-4">
          <div className="space-y-2">
            <div className="h-6 w-72 bg-slate-200 rounded"></div>
            <div className="h-3.5 w-96 bg-slate-100 rounded"></div>
          </div>
          <div className="h-9 w-64 bg-slate-200 rounded-xl"></div>
        </div>

        {/* Tactical KPIs Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-28 bg-slate-200 rounded"></div>
                <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
              </div>
              <div className="h-6 w-16 bg-slate-200 rounded"></div>
              <div className="h-2.5 w-36 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>

        {/* Pipeline Skeleton */}
        <div className="h-36 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Charts and Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-xl border border-slate-200 p-4"></div>
          <div className="lg:col-span-1 h-72 bg-white rounded-xl border border-slate-200 p-4"></div>
        </div>
      </div>
    );
  }

  // 2. Fetch Error Recovery State
  if (fetchError) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 bg-white rounded-2xl border border-rose-200 shadow-sm mt-8">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Falha ao Carregar o Dashboard</h3>
          <p className="text-xs text-slate-500 mt-1">{fetchError}</p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="gap-2 text-xs border-slate-300 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // 3. P0: Role Segregation for MILITAR_AVALIADO (Confidentiality & Domain Specificity)
  const isMilitarAvaliado = profile?.role === 'MILITAR_AVALIADO';
  if (isMilitarAvaliado) {
    const minhaFai = profile?.nip
      ? fais.find((f) => f.militarNip === profile.nip)
      : null;

    return (
      <div className="space-y-6">
        {/* Personal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] uppercase font-mono bg-slate-50 text-slate-700 border-slate-300">
                Portal do Avaliado
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border-emerald-300">
                NIP {profile?.nip || '---'}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Dossiê Individual de Avaliação (FAI)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {profile?.posto} {profile?.nomeCompleto} • Consulta confidencial do processo de qualificação
            </p>
          </div>

          <Link href="/minha-fai">
            <Button className="bg-[#0F3323] hover:bg-[#184A34] text-white text-xs font-medium gap-2 shadow-xs cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              Aceder ao Meu Formulário FAI
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Security & Confidentiality Notice */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
          <Lock className="w-4 h-4 text-[#B89047] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Segregação de Informação Regimental:</span> Conforme as normas de avaliação das Forças Armadas Angolanas, o militar avaliado tem acesso estrito ao seu próprio processo avaliativo, às garantias de tomada de conhecimento e aos prazos regimentais de reclamação e recurso.
          </div>
        </div>

        {minhaFai ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0F3323]" />
                  <h3 className="text-sm font-bold text-slate-900">Estado Atual do Processo</h3>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-[#0F3323] bg-emerald-50 border-emerald-200">
                  {minhaFai.workflow?.etapaAtual || 'EM_CURSO'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Ano de Instrução</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{minhaFai.anoInstrucao || '2025/2026'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Dias na Etapa</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{minhaFai.workflow?.diasNaEtapa ?? 0} dias</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Tomada de Conhecimento</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {minhaFai.pareceres?.avaliado?.assinado || minhaFai.pareceres?.avaliadoCiencia?.assinado ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Assinado
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pendente
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Orientações Regimentais</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Caso a sua avaliação já se encontre na fase de Tomada de Conhecimento ou Homologada, poderá consultar os fatores individuais, assinar regimentalmente o termo ou interpor recurso administrativo através do painel individual.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Link href="/minha-fai">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
                    Ver Detalhes do FAI <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                <Link href="/minha-fai" className="block">
                  <div className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Visualizar Formulário FAI</div>
                      <div className="text-[11px] text-slate-500">Consultar pontuação e grelha</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
                {profile?.nip && (
                  <Link href={`/militares/${profile.nip}`} className="block">
                    <div className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">Ficha Biográfica</div>
                        <div className="text-[11px] text-slate-500">Dados cadastrais e histórico</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                )}
                <Link href="/workflow" className="block">
                  <div className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Fluxo de Avaliação</div>
                      <div className="text-[11px] text-slate-500">Compreender as 6 etapas FAA</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Nenhum FAI Registado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ainda não existe um processo de avaliação individual associado ao seu NIP ({profile?.nip || '---'}). O processo será iniciado pelo Oficial Avaliador designado pela Direcção de Pessoal e Quadros.
            </p>
          </div>
        )}
      </div>
    );
  }

  // 4. Standard Operational Dashboard (Command / Officers / Evaluators)
  const totalMilitares = militares.length;
  const totalAvaliados = fais.length;
  const faisEmTramitacao = fais.filter((f) => f.workflow?.etapaAtual !== 'HOMOLOGADO').length;
  const alertasPrazoCritico = fais.filter(
    (f) => f.workflow?.etapaAtual !== 'HOMOLOGADO' && (f.workflow?.atrasado || ((f.workflow?.prazoLimiteEtapa || 30) - (f.workflow?.diasNaEtapa || 0)) <= 2)
  ).length;

  const somaMedias = fais.reduce((acc, curr) => acc + (curr.mediaPonderada || 0), 0);
  const mediaGeralUnidade = totalAvaliados > 0 ? (somaMedias / totalAvaliados).toFixed(2) : '0.00';

  const aptosPromocao = fais.filter((f) => {
    const notas = f.grelha || {};
    const f1 = notas['F1']?.cmdte ?? notas['F1']?.avaliador1 ?? 0;
    const f5 = notas['F5']?.cmdte ?? notas['F5']?.avaliador1 ?? 0;
    const f9 = notas['F9']?.cmdte ?? notas['F9']?.avaliador1 ?? 0;
    const f11 = notas['F11']?.cmdte ?? notas['F11']?.avaliador1 ?? 15;
    return (f.mediaPonderada || 0) >= 15.0 && f1 >= 15 && f5 >= 15 && f9 >= 15 && f11 >= 15;
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Executive Banner & Fast Code Unlock Widget */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-4 border-b border-[#758652]/20 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Dashboard de Prontidão e Gestão de Avaliações
          </h2>
          <p className="text-xs text-[#9EAF94] mt-1 font-medium">
            Monitorização operacional do ciclo anual de avaliação individual (FAI) - Exército Angolano
          </p>
        </div>

        {/* Quick Access by Individual Code */}
        <div className="w-full lg:w-auto bg-[rgba(24,34,21,0.72)] backdrop-blur-xl p-2 sm:px-3.5 sm:py-2 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-[rgba(16,24,15,0.8)] text-[#D4AF37] border border-[#758652]/30">
              <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <span className="text-xs font-semibold text-[#C5D4BD] whitespace-nowrap">
              Código DPQ:
            </span>
          </div>

          <form onSubmit={handleValidarCodigoRapido} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="text"
                placeholder="FAA-AV1-XXXX"
                value={codigoQuick}
                onChange={(e) => setCodigoQuick(e.target.value.toUpperCase())}
                className="pl-2.5 pr-7 py-1 text-xs font-mono uppercase bg-[rgba(12,18,11,0.85)] border border-[#758652]/40 rounded-lg text-slate-100 placeholder:text-[#6C7D63] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] w-36 transition-colors"
              />
              <button
                type="button"
                title="Colar da área de transferência"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setCodigoQuick(text.trim().toUpperCase());
                  } catch {}
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8FA39A] hover:text-[#D4AF37] cursor-pointer"
              >
                <Clipboard className="w-3 h-3" />
              </button>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={validandoCodigo}
              className="bg-[#13281B] hover:bg-[#1A3826] border border-[#758652]/80 text-[#D4AF37] hover:text-[#FDE68A] font-medium text-xs px-3 h-7 rounded-lg shadow-xs cursor-pointer"
            >
              {validandoCodigo ? '...' : 'Aceder'}
            </Button>
          </form>
        </div>
      </div>

      {codigoError && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs font-mono text-rose-200 flex items-center justify-between">
          <span>{codigoError}</span>
          <button onClick={() => setCodigoError('')} className="text-rose-400 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* 4 Tactical KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TacticalKPICard
          title="Total de Militares Avaliados"
          value={totalAvaliados}
          subvalue={`/ ${totalMilitares} total`}
          subtitle={`${Math.round((totalAvaliados / (totalMilitares || 1)) * 100)}% do efetivo avaliado`}
          icon={Users}
          accentColor="default"
        />

        <TacticalKPICard
          title="FAIs em Tramitação"
          value={faisEmTramitacao}
          subtitle={`${alertasPrazoCritico} com alerta de prazo crítico`}
          icon={FileClock}
          accentColor={alertasPrazoCritico > 0 ? 'gold' : 'default'}
        />

        <TacticalKPICard
          title="Média Geral da Unidade"
          value={mediaGeralUnidade}
          subvalue="/ 20.0"
          subtitle="Qualificação Geral: Favorável"
          icon={Calculator}
          accentColor="emerald"
        />

        <TacticalKPICard
          title="Aptos p/ Promoção por Escolha"
          value={aptosPromocao}
          subtitle="Fatores F1, F5, F9, F11 ≥ 15 pts"
          icon={Award}
          accentColor="gold"
        />
      </div>

      {/* Pipeline Visual de Tramitação Regimental (6 Fases) with interactive filtering */}
      <PipelineWorkflowWidget
        fais={fais}
        selectedEtapa={filtroEtapa}
        onSelectEtapa={(etapa) => setFiltroEtapa((prev) => (prev === etapa ? null : etapa))}
      />

      {/* Analytics & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DistributionChart fais={fais} />
        </div>
        <div className="lg:col-span-1">
          <DeadlinesAlertWidget fais={fais} />
        </div>
      </div>

      {/* Recent FAIs Data Table connected to interactive filter */}
      <RecentFaisTable
        fais={fais}
        filtroEtapa={filtroEtapa}
        onLimparEtapaFiltro={() => setFiltroEtapa(null)}
      />
    </div>
  );
}

