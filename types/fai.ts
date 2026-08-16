import { CategoriaMilitar, Militar } from './militar';

export type ClassificacaoRegimental =
  | 'SIGNIFICATIVAMENTE FAVORÁVEL'
  | 'FAVORÁVEL'
  | 'DESFAVORÁVEL';

export type NivelFator = 5 | 10 | 15 | 20;

export interface PontuacaoFator {
  avaliador1?: NivelFator;
  avaliador2?: NivelFator;
  cmdte?: NivelFator;
}

export type FaiBloco03Grelha = Record<string, PontuacaoFator>;

export type EtapaWorkflowFai =
  | 'RASCUNHO'
  | 'AVALIADOR_1'
  | 'AVALIADOR_2'
  | 'CMDTE'
  | 'CONSELHO_ASC'
  | 'DPQ'
  | 'HOMOLOGADO'
  | 'IMPUGNADO';

export interface ParecerAvaliador {
  dataAssinatura?: string;
  nip?: string;
  nome?: string;
  posto?: string;
  funcao?: string;
  parecerTexto?: string;
  concordaComPrimeiroAvaliador?: boolean;
  justificacaoDiscordancia?: string;
  motivoSubstituicao?: string;
}

export interface ParecerConselhoArma {
  dataReuniao?: string;
  numeroAta?: string;
  aptoParaPromocao?: boolean;
  ordemPrecedenciaProposta?: number;
  observacoes?: string;
}

export interface ParecerOrgaoPessoal {
  dataHomologacao?: string;
  despacho?: 'HOMOLOGADO' | 'RETIFICADO' | 'DEVOLVIDO';
  numeroOrdemServico?: string;
  responsavelNome?: string;
  responsavelPosto?: string;
  observacoes?: string;
}

export interface ParecerAvaliadoCiencia {
  dataConhecimento?: string;
  conhecimentoTomado?: boolean;
  concordou?: boolean;
  observacoesDiscordancia?: string;
  nomeAvaliado?: string;
  postoAvaliado?: string;
  nipAvaliado?: string;
  assinaturaDigital?: string;
}

export interface PreferenciasEmprego {
  area1?: string;
  area2?: string;
  desejaFrequentarCurso?: boolean;
  cursoPretendido?: string;
  observacoes?: string;
}

export interface FaiDocument {
  id: string;
  militarNip: string;
  militar?: Militar;
  anoInstrucao: string;
  periodoInicio: string;
  periodoFim: string;
  tipo: 'PERIODICA' | 'EXTRAORDINARIA';
  observacoesBloco02?: string;
  grelha: FaiBloco03Grelha;
  mediaPonderada: number;
  divisor: 52 | 31;
  classificacao: ClassificacaoRegimental;
  pareceres: {
    avaliador1?: ParecerAvaliador;
    avaliador2?: ParecerAvaliador;
    cmdte?: ParecerAvaliador;
    conselhoArma?: ParecerConselhoArma;
    orgaoPessoal?: ParecerOrgaoPessoal;
    avaliado?: ParecerAvaliadoCiencia;
  };
  preferenciasEmprego?: PreferenciasEmprego;
  workflow: {
    etapaAtual: EtapaWorkflowFai;
    dataInicioEtapa: string;
    historicoEtapas?: Array<{
      etapa: EtapaWorkflowFai;
      dataEntrada: string;
      dataSaida?: string;
      responsavelNip?: string;
      despacho?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}
