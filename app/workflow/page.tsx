'use client';

import React, { useState, useEffect } from 'react';
import { fetchFais } from '@/services/firebase/firestore';
import { FaiDocument, EtapaWorkflow } from '@/types/fai';
import { WorkflowKanbanColumn } from '@/components/workflow/workflow-kanban-column';
import { WorkflowAuditTable } from '@/components/workflow/workflow-audit-table';
import { TramitarModal } from '@/components/workflow/tramitar-modal';
import { LayoutGrid, Table as TableIcon, Search, FilterX, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { canAcessarFai, isSuperiorHierarquico } from '@/lib/hierarchy';

const COLUMNS: EtapaWorkflow[] = [
  'AVALIADOR_1',
  'AVALIADOR_2',
  'CMDTE',
  'CONSELHO_ASC',
  'DPQ',
];

export default function WorkflowPage() {
  const { profile } = useAuth();
  const [fais, setFais] = useState<FaiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('TODAS');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Modal
  const [selectedFaiForTramite, setSelectedFaiForTramite] = useState<FaiDocument | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchFais();
      setFais(data);
    } catch (err) {
      console.error('Erro ao carregar workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFais = fais.filter((fai) => {
    // Ponto 2 e Ponto 3: Limitar visualização aos processos sob responsabilidade do militar
    if (!canAcessarFai(profile, fai)) {
      return false;
    }

    // Para o 1º Avaliador, limita estritamente às suas avaliações ou subordinados diretos
    if (profile?.role === 'AVALIADOR_1') {
      const isMeuProcesso =
        fai.pareceres?.avaliador1?.nip === profile.nip ||
        (fai.militar?.posto && isSuperiorHierarquico(profile.posto, fai.militar.posto));
      if (!isMeuProcesso) return false;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      fai.militarNip?.toLowerCase().includes(term) ||
      fai.militar?.nomeCompleto?.toLowerCase().includes(term) ||
      fai.militar?.posto?.toLowerCase().includes(term);

    const matchesCat =
      categoriaFilter === 'TODAS' || fai.militar?.categoria === categoriaFilter;

    let matchesStatus = true;
    if (statusFilter === 'ATRASADO') {
      matchesStatus = Boolean(fai.workflow?.atrasado || ((fai.workflow?.prazoLimiteEtapa || 30) - (fai.workflow?.diasNaEtapa || 0)) < 0);
    } else if (statusFilter === 'ALERTA') {
      const rest = (fai.workflow?.prazoLimiteEtapa || 30) - (fai.workflow?.diasNaEtapa || 0);
      matchesStatus = rest >= 0 && rest <= 2;
    } else if (statusFilter === 'EM_DIA') {
      const rest = (fai.workflow?.prazoLimiteEtapa || 30) - (fai.workflow?.diasNaEtapa || 0);
      matchesStatus = rest > 2;
    }

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              Central de Workflow & Tramitação Regimental
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitorização estrita do ciclo de 30 dias (10d 1º Avaliador • 5d 2º Avaliador • 5d Cmdte • 5d Conselho ASC • 5d DPQ)
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Quadro Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" /> Tabela de Auditoria
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs shadow-card">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por NIP, Posto ou Nome..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="py-1.5 px-3 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-2xs"
        >
          <option value="TODAS">Todas as Categorias</option>
          <option value="OFICIAL">Oficiais</option>
          <option value="SARGENTO">Sargentos</option>
          <option value="PRACA">Praças</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-1.5 px-3 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-2xs"
        >
          <option value="TODOS">Todos os Status de Prazo</option>
          <option value="EM_DIA">Em Dia (&gt; 2 dias)</option>
          <option value="ALERTA">Alerta Crítico (≤ 48h)</option>
          <option value="ATRASADO">Fora do Prazo (Atrasado)</option>
        </select>

        {(searchTerm || categoriaFilter !== 'TODAS' || statusFilter !== 'TODOS') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoriaFilter('TODAS');
              setStatusFilter('TODOS');
            }}
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1 ml-auto"
          >
            <FilterX className="w-3.5 h-3.5" /> Limpar Filtros
          </button>
        )}
      </div>

      {/* Main View: Kanban vs Table */}
      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-slate-400 animate-pulse">
          Carregando fluxos de tramitação militar...
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
          {COLUMNS.map((etapa) => {
            const columnFais = filteredFais.filter((f) => f.workflow.etapaAtual === etapa);
            return (
              <WorkflowKanbanColumn
                key={etapa}
                etapaId={etapa}
                fais={columnFais}
                onOpenTramitarModal={(f) => setSelectedFaiForTramite(f)}
              />
            );
          })}
        </div>
      ) : (
        <WorkflowAuditTable
          fais={filteredFais}
          onOpenTramitarModal={(f) => setSelectedFaiForTramite(f)}
        />
      )}

      {/* Tramitar Modal */}
      <TramitarModal
        fai={selectedFaiForTramite}
        onClose={() => setSelectedFaiForTramite(null)}
        onSuccess={() => {
          loadData();
          setSelectedFaiForTramite(null);
        }}
      />
    </div>
  );
}
