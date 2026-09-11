export type NumeroAvaliadores = 2 | 3;
export type PapelAvaliador = 'avaliador1' | 'avaliador2' | 'cmdte';

export interface AtribuicaoAvaliacao {
  id: string; // ex: ATR-2025-001
  anoInstrucao: string;
  
  // Militar Avaliado
  militarAvaliadoNip: string;
  militarAvaliadoNome: string;
  militarAvaliadoPosto: string;
  militarAvaliadoUnidade: string;
  militarAvaliadoCategoria: 'OFICIAL' | 'SARGENTO' | 'PRACA';
  
  // Configuração Regimental
  numeroAvaliadores: NumeroAvaliadores; // 2 ou 3
  ultimoAvaliador: 'avaliador2' | 'cmdte';
  
  // Avaliadores Designados
  avaliador1Nip: string;
  avaliador1Nome: string;
  avaliador1Posto?: string;
  codigoAcessoAvaliador1: string; // Ex: FAA-AV1-4921
  statusAvaliador1: 'PENDENTE' | 'CONCLUIDO';
  
  avaliador2Nip?: string;
  avaliador2Nome?: string;
  avaliador2Posto?: string;
  codigoAcessoAvaliador2?: string; // Ex: FAA-AV2-8104
  statusAvaliador2?: 'PENDENTE' | 'CONCLUIDO';
  
  cmdteNip?: string;
  cmdteNome?: string;
  cmdtePosto?: string;
  codigoAcessoCmdte?: string; // Ex: FAA-CMD-3391
  statusCmdte?: 'PENDENTE' | 'CONCLUIDO';
  
  // Ligação com a FAI criada/em curso
  faiId?: string;
  statusGeral: 'PENDENTE' | 'EM_CURSO' | 'HOMOLOGADA';
  
  // Metadados do Chefe da DPQ
  criadoPorNip: string;
  criadoPorNome: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ValidacaoCodigoResult {
  valido: boolean;
  mensagem?: string;
  atribuicao?: AtribuicaoAvaliacao;
  papel?: PapelAvaliador;
  faiId?: string;
}
