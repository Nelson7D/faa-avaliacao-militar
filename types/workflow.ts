import { EtapaWorkflow } from './fai';

export interface WorkflowEtapaConfig {
  id: EtapaWorkflow;
  titulo: string;
  subtitulo: string;
  prazoDias: number;
  responsavelPadrao: string;
}

export const WORKFLOW_ETAPAS_CONFIG: Record<EtapaWorkflow, WorkflowEtapaConfig> = {
  AVALIADOR_1: {
    id: 'AVALIADOR_1',
    titulo: '1º Avaliador',
    subtitulo: 'Preenchimento e Atribuição de Notas (F1-F16)',
    prazoDias: 10,
    responsavelPadrao: 'Oficial Superior Direto',
  },
  AVALIADOR_2: {
    id: 'AVALIADOR_2',
    titulo: '2º Avaliador',
    subtitulo: 'Revisão e Concordância de Notas',
    prazoDias: 5,
    responsavelPadrao: 'Segundo Oficial Interveniente',
  },
  CMDTE: {
    id: 'CMDTE',
    titulo: 'Cmdte / Diretor / Chefe U/E/O',
    subtitulo: 'Homologação Interna & Alteração de Notas',
    prazoDias: 5,
    responsavelPadrao: 'Comandante da Unidade',
  },
  CONSELHO_ASC: {
    id: 'CONSELHO_ASC',
    titulo: 'Conselho da ASC',
    subtitulo: 'Parecer Técnico da Arma/Serviço/Classe',
    prazoDias: 5,
    responsavelPadrao: 'Presidente do Conselho ASC',
  },
  DPQ: {
    id: 'DPQ',
    titulo: 'Chefe Órgão de Pessoal (DPQ)',
    subtitulo: 'Homologação Final e Inserção no Dossier',
    prazoDias: 5,
    responsavelPadrao: 'Diretor de Pessoal e Quadros',
  },
  HOMOLOGADO: {
    id: 'HOMOLOGADO',
    titulo: 'Processo Concluído',
    subtitulo: 'Arquivado no Processo Individual',
    prazoDias: 0,
    responsavelPadrao: 'Sistema Central',
  },
};

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  acao: string;
  operadorNip?: string;
  operadorNome?: string;
  operadorPosto?: string;
  militarNip?: string;
  faiId?: string;
  responsavel?: string;
  despacho?: string;
  etapaDe?: string;
  etapaPara?: string;
  entidade?: 'FAI' | 'MILITAR' | 'IMPUGNACAO' | 'SISTEMA';
  entidadeId?: string;
  detalhes?: any;
  ipOrigem?: string;
}
