import { EtapaWorkflowFai } from './fai';

export interface WorkflowEtapaConfig {
  id: EtapaWorkflowFai;
  titulo: string;
  descricao: string;
  prazoMaximoDias: number;
  icone: string;
  corBadge: string;
  cargoResponsavel: string;
}

export const WORKFLOW_CONFIG_ETAPAS: Record<EtapaWorkflowFai, WorkflowEtapaConfig> = {
  RASCUNHO: {
    id: 'RASCUNHO',
    titulo: 'Rascunho Inicial',
    descricao: 'Abertura da FAI e recolha de dados de instrução',
    prazoMaximoDias: 3,
    icone: 'FileEdit',
    corBadge: 'bg-slate-100 text-slate-700 border-slate-300',
    cargoResponsavel: 'Oficial Secretário / Avaliador 1',
  },
  AVALIADOR_1: {
    id: 'AVALIADOR_1',
    titulo: '1º Avaliador (Direto)',
    descricao: 'Atribuição de pontuações de F1 a F16 e fundamentação',
    prazoMaximoDias: 10,
    icone: 'UserCheck',
    corBadge: 'bg-blue-50 text-blue-800 border-blue-200',
    cargoResponsavel: 'Comandante de Pelotão / Companhia',
  },
  AVALIADOR_2: {
    id: 'AVALIADOR_2',
    titulo: '2º Avaliador (Hierárquico)',
    descricao: 'Concordância ou retificação fundamentada das notas',
    prazoMaximoDias: 5,
    icone: 'UserPlus',
    corBadge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    cargoResponsavel: 'Comandante de Batalhão / Chefe de Repartição',
  },
  CMDTE: {
    id: 'CMDTE',
    titulo: 'Comandante / Chefe U/E/O',
    descricao: 'Despacho institucional com poder de substituição regimental',
    prazoMaximoDias: 5,
    icone: 'Award',
    corBadge: 'bg-amber-50 text-amber-900 border-amber-300',
    cargoResponsavel: 'Comandante de Regimento / Brigada / Unidade',
  },
  CONSELHO_ASC: {
    id: 'CONSELHO_ASC',
    titulo: 'Conselho da Arma / Classe',
    descricao: 'Análise de especialidade e precedência para promoções',
    prazoMaximoDias: 5,
    icone: 'Shield',
    corBadge: 'bg-purple-50 text-purple-800 border-purple-200',
    cargoResponsavel: 'Direção da Arma / Serviço / Classe',
  },
  DPQ: {
    id: 'DPQ',
    titulo: 'Direção de Pessoal e Quadros (DPQ)',
    descricao: 'Homologação final, arquivo no PI e publicação em Ordem de Serviço',
    prazoMaximoDias: 5,
    icone: 'FileCheck2',
    corBadge: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    cargoResponsavel: 'Chefe do DPQ / EMG-FAA',
  },
  HOMOLOGADO: {
    id: 'HOMOLOGADO',
    titulo: 'Processo Homologado',
    descricao: 'Ficha definitiva arquivada na Folha de Matrícula',
    prazoMaximoDias: 0,
    icone: 'CheckCircle2',
    corBadge: 'bg-emerald-100 text-emerald-800 border-emerald-400',
    cargoResponsavel: 'Arquivo Permanente DPQ',
  },
  IMPUGNADO: {
    id: 'IMPUGNADO',
    titulo: 'Em Reclamação / Recurso',
    descricao: 'Contestação formal pelo avaliado em análise (Prazo 15d)',
    prazoMaximoDias: 15,
    icone: 'AlertTriangle',
    corBadge: 'bg-rose-50 text-rose-800 border-rose-300',
    cargoResponsavel: 'Comandante da Unidade / CEMG-FAA',
  },
};
