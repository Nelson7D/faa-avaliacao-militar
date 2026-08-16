import { CategoriaMilitar, ClassificacaoRegimental, FaiBloco03Grelha, NivelFator } from '@/types/fai';

export const COEFICIENTES_OFICIAL_SARGENTO: Record<string, number> = {
  F1: 4,
  F2: 3,
  F3: 4,
  F4: 3,
  F5: 4,
  F6: 3,
  F7: 2,
  F8: 3,
  F9: 3,
  F10: 4,
  F11: 4,
  F12: 2,
  F13: 3,
  F14: 3,
  F15: 4,
  F16: 3,
};

export const COEFICIENTES_PRACA: Record<string, number> = {
  F1: 4,
  F2: 3,
  F3: 4,
  F4: 3,
  F5: 4,
  F7: 2,
  F9: 3,
  F12: 2,
  F15: 3,
  F16: 3,
};

// Praças: Fatores F6, F8, F10, F11, F13 e F14 não são considerados na avaliação individual das Praças (Página 35/36 do Manual)
// Divisor Base das Praças = 31 (4+3+4+3+4+2+3+2+3+3 = 31)
export const FATORES_EXCLUIDOS_PRACAS = ['F6', 'F8', 'F10', 'F11', 'F13', 'F14'];

export interface ResultadoCalculoFai {
  MP: number;
  divisor: 52 | 31;
  classificacao: ClassificacaoRegimental;
  somaPonderada: number;
  notasEfetivas: Record<string, NivelFator>;
  contagemNivel5: number;
  contagemNivel10: number;
  contagemNivel15: number;
  contagemNivel20: number;
  fatoresEspeciaisValidos: boolean;
  motivoClassificacao?: string;
  incoerenciasDetectadas?: string[];
}

/**
 * Calcula a Média Ponderada (MP) e a Classificação Regimental Oficial das FAA
 * em estrita conformidade com o Manual de Preparação Especial VII (Academia Militar, 2021).
 */
export function calcularMediaRegimental(
  categoria: CategoriaMilitar,
  grelha: FaiBloco03Grelha,
  avaliadorAtivo: 'avaliador1' | 'avaliador2' | 'cmdte' | 'efetivo' = 'efetivo',
  feridoEmCombate: boolean = false
): ResultadoCalculoFai {
  const isPraca = categoria === 'PRACA';
  const divisor: 52 | 31 = isPraca ? 31 : 52;

  let somaPonderada = 0;
  const notasEfetivas: Record<string, NivelFator> = {};

  for (let i = 1; i <= 16; i++) {
    const fId = `F${i}`;
    if (isPraca && FATORES_EXCLUIDOS_PRACAS.includes(fId)) {
      continue;
    }

    let nota: NivelFator = 5;
    if (avaliadorAtivo === 'efetivo') {
      // Prioridade: Comandante > 2º Avaliador > 1º Avaliador
      nota = grelha[fId]?.cmdte ?? grelha[fId]?.avaliador2 ?? grelha[fId]?.avaliador1 ?? 5;
    } else if (avaliadorAtivo === 'cmdte') {
      nota = grelha[fId]?.cmdte ?? grelha[fId]?.avaliador2 ?? grelha[fId]?.avaliador1 ?? 5;
    } else if (avaliadorAtivo === 'avaliador2') {
      nota = grelha[fId]?.avaliador2 ?? grelha[fId]?.avaliador1 ?? 5;
    } else {
      nota = grelha[fId]?.avaliador1 ?? 5;
    }

    notasEfetivas[fId] = nota;
    const coef = isPraca ? (COEFICIENTES_PRACA[fId] || 0) : (COEFICIENTES_OFICIAL_SARGENTO[fId] || 0);
    somaPonderada += nota * coef;
  }

  const MP = Number((somaPonderada / divisor).toFixed(2));

  // Contagens
  const todasNotas = Object.values(notasEfetivas);
  const contagemNivel5 = todasNotas.filter((n) => n === 5).length;
  const contagemNivel10 = todasNotas.filter((n) => n === 10).length;
  const contagemNivel15 = todasNotas.filter((n) => n === 15).length;
  const contagemNivel20 = todasNotas.filter((n) => n === 20).length;

  const todasMaiorIgual15 = todasNotas.every((n) => n >= 15);

  // Factores Nucleares Regimentais: F1, F5, F7, F9 e F11 (pág. 35 e 37)
  const f1 = notasEfetivas['F1'] ?? 5;
  const f5 = notasEfetivas['F5'] ?? 5;
  const f7 = notasEfetivas['F7'] ?? 5;
  const f9 = notasEfetivas['F9'] ?? 5;
  const f11 = isPraca ? 20 : (notasEfetivas['F11'] ?? 5);
  const f12 = notasEfetivas['F12'] ?? 5;

  const fatoresNuclearesValidos =
    f1 >= 15 && f5 >= 15 && f7 >= 15 && f9 >= 15 && (isPraca || f11 >= 15);

  // Detecção de Incoerências
  const incoerenciasDetectadas: string[] = [];
  if (!isPraca && notasEfetivas['F11'] === 20 && (notasEfetivas['F10'] ?? 0) <= 5) {
    incoerenciasDetectadas.push(
      'Incoerência grave: Nível 20 em F11 (Decisão) com Nível 5 em F10 (Julgamento).'
    );
  }
  if (notasEfetivas['F1'] === 20 && (notasEfetivas['F5'] ?? 0) <= 5) {
    incoerenciasDetectadas.push(
      'Incoerência: Integridade Máxima (F1=20) associada a Falta de Sentido do Dever e Disciplina (F5=5).'
    );
  }

  // Aplicação Rigorosa das Regras Regimentais (Páginas 34-37 do Manual)
  let classificacao: ClassificacaoRegimental = 'DESFAVORÁVEL';
  let motivoClassificacao = '';

  // 1. Significativamente Favorável: MP >= 15.00 e nenhum factor com nota inferior a 15
  if (MP >= 15.0 && todasMaiorIgual15) {
    classificacao = 'SIGNIFICATIVAMENTE FAVORÁVEL';
    motivoClassificacao = 'Média Ponderada >= 15.00 e todos os fatores de avaliação com nível >= 15.';
  }
  // 2. Favorável: MP >= 11.25, F1, F5, F9, F11 >= 15 e no máximo 2 fatores em nível 5
  else if (
    MP >= 11.25 &&
    f1 >= 15 &&
    f5 >= 15 &&
    f9 >= 15 &&
    (isPraca || f11 >= 15) &&
    contagemNivel5 <= 2 &&
    (!feridoEmCombate || f12 >= 10)
  ) {
    classificacao = 'FAVORÁVEL';
    motivoClassificacao =
      'Média Ponderada >= 11.25, fatores nucleares (F1, F5, F9, F11) >= 15 e no máximo 2 fatores com nível 5.';
  }
  // 3. Desfavorável: F1, F5, F7, F9, F11 < 15, ou >= 3 fatores com nível 5, ou MP < 11.25
  else {
    classificacao = 'DESFAVORÁVEL';
    if (f1 < 15 || f5 < 15 || f7 < 15 || f9 < 15 || (!isPraca && f11 < 15)) {
      motivoClassificacao = 'Nível inferior a 15 em fator nuclear obrigatório (F1, F5, F7, F9 ou F11).';
    } else if (contagemNivel5 >= 3) {
      motivoClassificacao = `Nível 5 atribuído em 3 ou mais fatores de avaliação (${contagemNivel5} fatores com nível 5).`;
    } else if (MP < 11.25) {
      motivoClassificacao = `Média Ponderada (${MP}) inferior ao limiar mínimo regimental de 11.25.`;
    } else if (feridoEmCombate && f12 < 10) {
      motivoClassificacao = 'Militar ferido em combate ou serviço com F12 inferior a nível 10.';
    }
  }

  return {
    MP,
    divisor,
    classificacao,
    somaPonderada,
    notasEfetivas,
    contagemNivel5,
    contagemNivel10,
    contagemNivel15,
    contagemNivel20,
    fatoresEspeciaisValidos: fatoresNuclearesValidos,
    motivoClassificacao,
    incoerenciasDetectadas,
  };
}
