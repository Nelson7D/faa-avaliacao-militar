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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#758652]/20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#D4AF37]" />
              Central de Workflow & Tramitação Regimental
            </h2>
          </div>
          <p className="text-xs text-[#9EAF94] mt-1 font-medium">
            Monitorização estrita do ciclo de 30 dias (10d 1º Avaliador • 5d 2º Avaliador • 5d Cmdte • 5d Conselho ASC • 5d DPQ)
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-[rgba(12,18,11,0.85)] p-1 rounded-xl border border-[#758652]/40 shadow-2xs">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'kanban'
                ? 'bg-[#D4AF37] text-[#0D140B] shadow-xs font-bold'
                : 'text-[#9EAF94] hover:text-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Quadro Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-[#D4AF37] text-[#0D140B] shadow-xs font-bold'
                : 'text-[#9EAF94] hover:text-slate-100'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" /> Tabela de Auditoria
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[rgba(24,34,21,0.72)] backdrop-blur-xl p-3.5 rounded-2xl border border-white/[0.08] text-xs shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA39A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por NIP, Posto ou Nome..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#758652]/40 rounded-xl bg-[rgba(12,18,11,0.85)] text-slate-100 placeholder:text-[#6C7D63] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
          />
        </div>

        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="py-1.5 px-3 border border-[#758652]/40 rounded-xl bg-[rgba(12,18,11,0.85)] text-slate-100 text-xs font-medium focus:outline-none focus:border-[#D4AF37] transition-all cursor-pointer shadow-2xs"
        >
          <option value="TODAS" className="bg-[#10180F] text-slate-200">Todas as Categorias</option>
          <option value="OFICIAL" className="bg-[#10180F] text-slate-200">Oficiais</option>
          <option value="SARGENTO" className="bg-[#10180F] text-slate-200">Sargentos</option>
          <option value="PRACA" className="bg-[#10180F] text-slate-200">Praças</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-1.5 px-3 border border-[#758652]/40 rounded-xl bg-[rgba(12,18,11,0.85)] text-slate-100 text-xs font-medium focus:outline-none focus:border-[#D4AF37] transition-all cursor-pointer shadow-2xs"
        >
          <option value="TODOS" className="bg-[#10180F] text-slate-200">Todos os Status de Prazo</option>
          <option value="EM_DIA" className="bg-[#10180F] text-slate-200">Em Dia (&gt; 2 dias)</option>
          <option value="ALERTA" className="bg-[#10180F] text-slate-200">Alerta Crítico (≤ 48h)</option>
          <option value="ATRASADO" className="bg-[#10180F] text-slate-200">Fora do Prazo (Atrasado)</option>
        </select>

        {(searchTerm || categoriaFilter !== 'TODAS' || statusFilter !== 'TODOS') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoriaFilter('TODAS');
              setStatusFilter('TODOS');
            }}
            className="text-xs text-[#D4AF37] font-medium hover:underline flex items-center gap-1 ml-auto"
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
