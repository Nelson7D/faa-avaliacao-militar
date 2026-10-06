export type CategoriaMilitar = 'OFICIAL' | 'SARGENTO' | 'PRACA';

export type SubcategoriaOficial = 'GENERAL' | 'SUPERIOR' | 'SUBALTERNO';

export interface Militar {
  nip: string; // Número de Identificação Pessoal
  bi: string; // Bilhete de Identidade
  nomeCompleto: string;
  nomeGuerra: string;
  posto: string; // e.g., 'Major', 'Capitão', '1º Sargento', '1º Cabo'
  categoria: CategoriaMilitar;
  subcategoria?: SubcategoriaOficial;
  unidade: string; // e.g., 'Quartel-General do Exército', 'Comando de Transmissões'
  orgao: string; // e.g., 'Direção de Recursos Humanos'
  funcaoDesempenhada: string;
  asc: string; // Arma, Serviço ou Classe (e.g., 'Infantaria', 'Transmissões e Informática')
  qe: 'QP' | 'QC' | 'QRC' | 'QCO'; // Quadro Especial: QP (Quadro Permanente), QC (Quadro por Contrato)
  dataNascimento: string;
  naturalidade: string;
  filiacao: string;
  dataIngresso: string;
  tempoServicoAnos: number;
  tempoServicoMeses?: number;
  feridoEmServico: boolean;
  habilitacoesLiterarias: string;
  estadoCivil: string;
  idiomas: string;
  morada: string;
  contacto: string;
  fotoUrl?: string;
  situacao: 'ACTIVO' | 'RESERVA' | 'DESTACADO' | 'LICENCA';
}
