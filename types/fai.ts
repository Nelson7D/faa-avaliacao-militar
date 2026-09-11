import { CategoriaMilitar, Militar } from './militar';

export type { CategoriaMilitar, Militar };
export type NivelFator = 5 | 10 | 15 | 20;

export type ClassificacaoRegimental =
  | 'SIGNIFICATIVAMENTE FAVORÁVEL'
  | 'FAVORÁVEL'
  | 'DESFAVORÁVEL';

export type EtapaWorkflow =
  | 'AVALIADOR_1'
  | 'AVALIADOR_2'
  | 'CMDTE'
  | 'CONSELHO_ASC'
  | 'DPQ'
  | 'HOMOLOGADO';

export interface FatorNota {
  avaliador1?: NivelFator;
  avaliador2?: NivelFator;
  cmdte?: NivelFator;
}

export interface FaiBloco03Grelha {
  [fatorId: string]: FatorNota;
}

export interface ParecerAvaliador1 {
  texto: string;
  nip: string;
  nome: string;
  posto: string;
  data: string;
  assinado: boolean;
}

export interface ParecerAvaliador2 {
  texto: string;
  nip: string;
  nome: string;
  posto: string;
  data: string;
  concordancia: boolean;
  assinado: boolean;
}

export interface ParecerCmdte {
  texto: string;
  nip: string;
  nome: string;
  posto: string;
  data: string;
  modificouNotas?: boolean;
  justificacaoModificacao?: string;
  assinado: boolean;
}

export interface ParecerConselhoAsc {
  texto: string;
  presidenteNip: string;
  presidenteNome: string;
  secretarioNip: string;
  secretarioNome: string;
  data: string;
  assinado: boolean;
}

export interface ParecerAvaliadoCiencia {
  nip?: string;
  nome?: string;
  data?: string;
  dataConhecimento?: string;
  concorda?: boolean;
  concordou?: boolean;
  conhecimentoTomado?: boolean;
  requerReclamacao?: boolean;
  observacoesDiscordancia?: string;
  nomeAvaliado?: string;
  postoAvaliado?: string;
  assinado?: boolean;
}

export interface DespachoOrgaoPessoal {
  despacho: string;
  chefeNip: string;
  chefeNome: string;
  posto: string;
  data: string;
  homologado: boolean;
  assinado: boolean;
}

export interface PreferenciaArea {
  op1?: boolean;
  op2?: boolean;
  op3?: boolean;
  sugestaoIa?: boolean;
}

export interface FaiDocument {
  id: string;
  militarNip: string;
  militar?: Militar;
  anoInstrucao: string;
  periodoInicio: string;
  periodoFim: string;
  tipo: 'PERIODICA' | 'EXTRAORDINARIA';
  numeroAvaliadores?: 2 | 3;
  ultimoAvaliador?: 'avaliador2' | 'cmdte';
  mediaCalculadaPor?: 'avaliador1' | 'avaliador2' | 'cmdte';
  atribuicaoId?: string;
  observacoesBloco02?: string;
  grelha: FaiBloco03Grelha;
  mediaPonderada: number;
  divisor: 52 | 31;
  classificacao: ClassificacaoRegimental;
  pareceres: {
    avaliador1?: ParecerAvaliador1;
    avaliador2?: ParecerAvaliador2;
    cmdte?: ParecerCmdte;
    conselhoAsc?: ParecerConselhoAsc;
    avaliado?: ParecerAvaliadoCiencia;
    avaliadoCiencia?: ParecerAvaliadoCiencia;
    orgaoPessoal?: DespachoOrgaoPessoal;
  };
  preferenciasEmprego: {
    [area: string]: PreferenciaArea;
  };
  workflow: {
    etapaAtual: EtapaWorkflow;
    diasNaEtapa: number;
    prazoLimiteEtapa: number; // 10 para avaliador1, 5 para as restantes
    atrasado: boolean;
    dataEntradaEtapa: string;
    historico?: Array<{
      etapa: EtapaWorkflow;
      dataTransicao: string;
      responsavelNip: string;
      responsavelNome: string;
      despacho?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}
