export type CategoriaMilitar = 'OFICIAL' | 'SARGENTO' | 'PRACA';
export type SubcategoriaMilitar = 'GENERAL' | 'SUPERIOR' | 'CAPITAO' | 'SUBALTERNO';
export type SituacaoMilitar = 'ACTIVO' | 'RESERVA' | 'REFORMA';

export interface Militar {
  nip: string;
  bi: string;
  nomeCompleto: string;
  nomeGuerra: string;
  posto: string;
  categoria: CategoriaMilitar;
  subcategoria?: SubcategoriaMilitar;
  unidade: string;
  orgao?: string;
  funcaoDesempenhada: string;
  asc?: string;
  qe?: string;
  dataNascimento: string;
  naturalidade: string;
  filiacao: string;
  dataIngresso: string;
  tempoServicoAnos: number;
  feridoEmServico: boolean;
  habilitacoesLiterarias: string;
  estadoCivil: string;
  idiomas?: string;
  morada: string;
  contacto: string;
  fotoUrl?: string;
  situacao: SituacaoMilitar;
}
