'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FileClock, Calculator, Award, PlusCircle, ArrowUpRight } from 'lucide-react';
import { TacticalKPICard } from '@/components/dashboard/tactical-kpi-card';
import { DistributionChart } from '@/components/dashboard/distribution-chart';
import { DeadlinesAlertWidget } from '@/components/dashboard/deadlines-alert-widget';
import { RecentFaisTable } from '@/components/dashboard/recent-fais-table';
import { fetchFais, fetchMilitares } from '@/services/firebase/firestore';
import { FaiDocument } from '@/types/fai';
import { Militar } from '@/types/militar';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [fais, setFais] = useState<FaiDocument[]>([]);
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [faisData, militaresData] = await Promise.all([
          fetchFais(),
          fetchMilitares(),
        ]);
        setFais(faisData);
        setMilitares(militaresData);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute 4 KPIs directly from Firestore data
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
      {/* Top Executive Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard de Prontidão e Gestão de Avaliações
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitorização operacional do ciclo anual de avaliação individual (FAI) • Exército Angolano
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/workflow">
            <Button variant="outline" size="sm" className="text-xs">
              Tramitação Regimental
            </Button>
          </Link>
          <Link href="/fai/nova">
            <Button variant="default" size="sm" className="text-xs flex items-center gap-1.5 shadow-xs">
              <PlusCircle className="w-3.5 h-3.5" /> Nova FAI Digital
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Tactical KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TacticalKPICard
          title="Total de Militares Avaliados"
          value={totalAvaliados}
          subvalue={`/ ${totalMilitares} total`}
          subtitle={`${Math.round((totalAvaliados / totalMilitares) * 100)}% do efetivo avaliado`}
          icon={Users}
          accentColor="default"
        />

        <TacticalKPICard
          title="FAIs em Tramitação"
          value={faisEmTramitacao}
          subtitle={`${alertasPrazoCritico} com alerta de prazo crítico`}
          icon={FileClock}
          badge={{ text: 'Regra 30d', variant: 'warning' }}
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
          badge={{ text: 'Regimental', variant: 'gold' }}
          accentColor="gold"
        />
      </div>

      {/* Analytics & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DistributionChart fais={fais} />
        </div>
        <div className="lg:col-span-1">
          <DeadlinesAlertWidget fais={fais} />
        </div>
      </div>

      {/* Recent FAIs Data Table */}
      <RecentFaisTable fais={fais} />
    </div>
  );
}
