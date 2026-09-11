export { FATORES_EXCLUIDOS_PRACAS } from './calculo-fai';

export interface FatorDefinicao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  coeficienteOficialSargento: number;
  coeficientePraca: number;
  excluidoPracas: boolean;
  especial: boolean;
  grupo: 'TECNICO_PROFISSIONAL' | 'LIDERANCA_DISCIPLINA' | 'POTENCIAL_DESENVOLVIMENTO' | 'CONDICAO_GERAL';
}

export const FATORES_AVALIACAO: FatorDefinicao[] = [
  {
    id: 'F1',
    codigo: 'F1',
    nome: 'Integridade de Carácter',
    descricao: 'Lealdade, honestidade e dignidade moral demonstradas nos atos de serviço, consideração e confiança de que desfruta.',
    coeficienteOficialSargento: 4,
    coeficientePraca: 4,
    excluidoPracas: false,
    especial: true,
    grupo: 'TECNICO_PROFISSIONAL',
  },
  {
    id: 'F2',
    codigo: 'F2',
    nome: 'Relações Humanas e Cooperação',
    descricao: 'Tacto, cortesia, camaradagem, solidariedade e participação ativa e harmoniosa no trabalho de grupo e espírito de equipa.',
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: false,
    grupo: 'LIDERANCA_DISCIPLINA',
  },
  {
    id: 'F3',
    codigo: 'F3',
    nome: 'Autoconfiança e Autodomínio',
    descricao: 'Confiança no trabalho, assunção de riscos calculados, maturidade, presença de espírito e domínio das emoções.',
    coeficienteOficialSargento: 4,
    coeficientePraca: 4,
    excluidoPracas: false,
    especial: false,
    grupo: 'TECNICO_PROFISSIONAL',
  },
  {
    id: 'F4',
    codigo: 'F4',
    nome: 'Iniciativa',
    descricao: 'Capacidade de criar alternativas eficazes na execução das tarefas e resolução quando surgem problemas imprevistos.',
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F5',
    codigo: 'F5',
    nome: 'Sentido do Dever e da Disciplina',
    descricao: 'Cumprimento consciente do dever, normas e regulamentos militares, aprumo, exercício da autoridade e cumprimento de ordens.',
    coeficienteOficialSargento: 4,
    coeficientePraca: 4,
    excluidoPracas: false,
    especial: true,
    grupo: 'LIDERANCA_DISCIPLINA',
  },
  {
    id: 'F6',
    codigo: 'F6',
    nome: 'Poder de Comunicação',
    descricao: 'Simplicidade, clareza, precisão de termos, concisão e facilidade de apresentação de ideias e conceitos operacionais.',
    coeficienteOficialSargento: 3,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F7',
    codigo: 'F7',
    nome: 'Dedicação e Empenho na Função',
    descricao: 'Disponibilidade, espírito de sacrifício, sentido de missão e níveis qualitativos e quantitativos de realização atingidos.',
    coeficienteOficialSargento: 2,
    coeficientePraca: 2,
    excluidoPracas: false,
    especial: true,
    grupo: 'CONDICAO_GERAL',
  },
  {
    id: 'F8',
    codigo: 'F8',
    nome: 'Planeamento e Organização',
    descricao: 'Previsão de problemas, planos e organização de atividades com economia de meios, equipamento e espaço.',
    coeficienteOficialSargento: 3,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F9',
    codigo: 'F9',
    nome: 'Aptidão Técnico-Profissional',
    descricao: 'Profundidade dos conhecimentos profissionais, rendimento no desempenho de funções, autonomia e valorização pedagógica.',
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: true,
    grupo: 'TECNICO_PROFISSIONAL',
  },
  {
    id: 'F10',
    codigo: 'F10',
    nome: 'Julgamento',
    descricao: 'Aptidão em apreender problemas e raciocinar para desenvolver soluções corretas e eficazes para questões complexas.',
    coeficienteOficialSargento: 4,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F11',
    codigo: 'F11',
    nome: 'Decisão',
    descricao: 'Capacidade para resolver com oportunidade, segurança, qualidade e responsabilidade os problemas de comando e chefia.',
    coeficienteOficialSargento: 4,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: true,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F12',
    codigo: 'F12',
    nome: 'Condição Física',
    descricao: 'Disponibilidade, prontidão, resistência à fadiga e poder de recuperação revelados no exercício das funções militares.',
    coeficienteOficialSargento: 2,
    coeficientePraca: 2,
    excluidoPracas: false,
    especial: true, // Proteção a feridos em campanha: F12 >= 10
    grupo: 'CONDICAO_GERAL',
  },
  {
    id: 'F13',
    codigo: 'F13',
    nome: 'Cultura Geral',
    descricao: 'Conhecimentos extra-profissionais revelados em reflexos positivos para as Forças Armadas Angolanas.',
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F14',
    codigo: 'F14',
    nome: 'Cultura Militar',
    descricao: 'Conhecimentos profissionais e doutrinários revelados e a sua potenciação para funções militares diversificadas.',
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: false,
    grupo: 'TECNICO_PROFISSIONAL',
  },
  {
    id: 'F15',
    codigo: 'F15',
    nome: 'Determinação e Perseverança',
    descricao: 'Força de vontade e constância nas ações para consecução dos objetivos traçados, não obstante as dificuldades.',
    coeficienteOficialSargento: 4,
    coeficientePraca: 4,
    excluidoPracas: false,
    especial: false,
    grupo: 'LIDERANCA_DISCIPLINA',
  },
  {
    id: 'F16',
    codigo: 'F16',
    nome: 'Adaptabilidade',
    descricao: 'Capacidade de ajustamento às mais variadas funções militares, conciliando obrigações e exigências funcionais.',
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: false,
    grupo: 'CONDICAO_GERAL',
  },
];

export const NIVEIS_FATOR_OPCOES = [
  { valor: 5 as const, rotulo: 'Nível 5 - Insuficiente / Abaixo do Padrão', cor: 'text-red-700 bg-red-50 border-red-200' },
  { valor: 10 as const, rotulo: 'Nível 10 - Regular / Padrão Mínimo', cor: 'text-amber-700 bg-amber-50 border-amber-200' },
  { valor: 15 as const, rotulo: 'Nível 15 - Bom / Padrão Esperado', cor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { valor: 20 as const, rotulo: 'Nível 20 - Excelente / Acima do Padrão', cor: 'text-green-900 bg-green-100 border-green-300 font-bold' },
];

export const AREAS_EMPREGO_PREFERENCIA = [
  { id: 'comando', titulo: 'Comando e Direção de Unidades/Subunidades' },
  { id: 'estado_maior', titulo: 'Funções de Estado-Maior (Planeamento e Operações)' },
  { id: 'ensino', titulo: 'Ensino Militar e Instrução Técnica' },
  { id: 'logistica', titulo: 'Logística, Abastecimento e Material Bélico' },
  { id: 'transmissoes', titulo: 'Transmissões, Informática e Guerra Eletrónica' },
  { id: 'inteligencia', titulo: 'Informações e Reconhecimento Militar' },
  { id: 'saude', titulo: 'Serviços de Saúde e Assistência Médica' },
  { id: 'administracao', titulo: 'Recursos Humanos, Finanças e Administração Geral' },
];

export const POSTOS_MILITARES = [
  // Generais
  { id: 'GEN_EX', nome: 'General de Exército', categoria: 'OFICIAL' as const, sub: 'GENERAL' as const },
  { id: 'TEN_GEN', nome: 'Tenente-General', categoria: 'OFICIAL' as const, sub: 'GENERAL' as const },
  { id: 'BRIG', nome: 'Brigadeiro', categoria: 'OFICIAL' as const, sub: 'GENERAL' as const },
  // Oficiais Superiores
  { id: 'CEL', nome: 'Coronel', categoria: 'OFICIAL' as const, sub: 'SUPERIOR' as const },
  { id: 'TEN_CEL', nome: 'Tenente-Coronel', categoria: 'OFICIAL' as const, sub: 'SUPERIOR' as const },
  { id: 'MAJ', nome: 'Major', categoria: 'OFICIAL' as const, sub: 'SUPERIOR' as const },
  // Oficiais Subalternos
  { id: 'CAP', nome: 'Capitão', categoria: 'OFICIAL' as const, sub: 'SUBALTERNO' as const },
  { id: 'TEN', nome: 'Tenente', categoria: 'OFICIAL' as const, sub: 'SUBALTERNO' as const },
  { id: 'SUB_TEN', nome: 'Subtenente', categoria: 'OFICIAL' as const, sub: 'SUBALTERNO' as const },
  // Sargentos
  { id: 'SARG_CH', nome: 'Sargento-Chefe', categoria: 'SARGENTO' as const },
  { id: 'SARG_AJ', nome: 'Sargento-Ajudante', categoria: 'SARGENTO' as const },
  { id: '1_SARG', nome: '1º Sargento', categoria: 'SARGENTO' as const },
  { id: '2_SARG', nome: '2º Sargento', categoria: 'SARGENTO' as const },
  // Praças
  { id: '1_CABO', nome: '1º Cabo', categoria: 'PRACA' as const },
  { id: '2_CABO', nome: '2º Cabo', categoria: 'PRACA' as const },
  { id: 'SOLDADO', nome: 'Soldado', categoria: 'PRACA' as const },
];

export const ARMAS_SERVICOS = [
  'Infantaria',
  'Artilharia de Campanha',
  'Artilharia Antiaérea',
  'Tropas Blindadas',
  'Engenharia Militar',
  'Transmissões e Informática',
  'Logística e Material Bélico',
  'Saúde Militar',
  'Administração Militar e Finanças',
  'Polícia Militar',
];

export const QUADROS_ESPECIAIS = [
  { sigla: 'QP', nome: 'Quadro Permanente' },
  { sigla: 'QRC', nome: 'Quadro de Reserva por Contrato' },
  { sigla: 'QCO', nome: 'Quadro Complementar de Oficiais' },
];

export const ETAPAS_WORKFLOW = [
  { id: 'AVALIADOR_1', titulo: '1º Avaliador', prazoDias: 10, descricao: 'Preenchimento e fundamentação inicial das notas regimentais.' },
  { id: 'AVALIADOR_2', titulo: '2º Avaliador', prazoDias: 5, descricao: 'Ratificação ou discordância fundamentada das notas.' },
  { id: 'CMDTE', titulo: 'Comandante U/E/O', prazoDias: 5, descricao: 'Despacho de comando e exercício do poder de substituição.' },
  { id: 'CONSELHO_ASC', titulo: 'Conselho da ASC', prazoDias: 5, descricao: 'Parecer técnico da Arma, Serviço ou Classe correspondente.' },
  { id: 'DPQ', titulo: 'Direcção de Pessoal e Quadros', prazoDias: 5, descricao: 'Homologação final, registo e encerramento do processo FAI.' },
];

