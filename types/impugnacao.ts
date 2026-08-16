export type TipoImpugnacao = 'RECLAMACAO' | 'RECURSO_HIERARQUICO';

export type StatusImpugnacao = 'EM_ANALISE' | 'DEFERIDO_TOTAL' | 'DEFERIDO_PARCIAL' | 'INDEFERIDO';

export interface Impugnacao {
  id: string;
  faiId: string;
  militarNip: string;
  militarNome: string;
  militarPosto: string;
  militarUnidade: string;
  tipo: TipoImpugnacao;
  dataSubmissao: string;
  prazoLimiteResposta: string;
  fatoresContestados: Array<{
    fatorId: string;
    fatorNome: string;
    notaOriginal: number;
    notaRequerida: number;
    argumentacao: string;
  }>;
  fundamentacaoGeral: string;
  anexosUrls?: string[];
  status: StatusImpugnacao;
  despachoComando?: {
    dataDespacho: string;
    autoridadeNip: string;
    autoridadeNome: string;
    autoridadePosto: string;
    decisao: StatusImpugnacao;
    textoDespacho: string;
    notasRetificadas?: Record<string, number>;
  };
}
