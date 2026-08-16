import { NivelFator } from './fai';
import { Militar } from './militar';

export type TipoImpugnacao = 'RECLAMACAO' | 'RECURSO_HIERARQUICO';

export type StatusImpugnacao =
  | 'EM_ANALISE'
  | 'AGUARDANDO_PARECER'
  | 'DEFERIDA'
  | 'INDEFERIDA'
  | 'RETIFICADA';

export interface FatorContestado {
  fatorId: string;
  fatorNome: string;
  notaOriginal: NivelFator;
  notaRequerida: NivelFator;
  notaDeferida?: NivelFator;
  fundamentacaoRequerente: string;
}

export interface ImpugnacaoDocument {
  id: string; // e.g. 'IMP-2026-009'
  tipo: TipoImpugnacao;
  faiId: string;
  militarNip: string;
  militar?: Militar;
  dataSubmissao: string;
  prazoLimite: string; // 15 dias a partir da submissao
  diasRestantes: number;
  status: StatusImpugnacao;
  fatoresContestados: FatorContestado[];
  motivoGeral: string;
  parecerInstrutor?: {
    texto: string;
    oficialNip: string;
    oficialNome: string;
    data: string;
  };
  despachoCmdte?: {
    decisao: 'DEFERIDO_TOTAL' | 'DEFERIDO_PARCIAL' | 'INDEFERIDO';
    fundamentacao: string;
    cmdteNip: string;
    cmdteNome: string;
    data: string;
    alterouNotas: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
