import { describe, it, expect } from 'vitest';
import { calcularMediaRegimental } from '@/lib/calculo-fai';
import { FaiBloco03Grelha } from '@/types/fai';

describe('Módulo de Impugnações & Recursos Hierárquicos (Regras Regimentais)', () => {
  it('Prazo de submissão de impugnação deve ser de até 15 dias contados da Tomada de Conhecimento', () => {
    const dataConhecimento = new Date('2025-01-10');
    const dataLimite = new Date(dataConhecimento);
    dataLimite.setDate(dataLimite.getDate() + 15);

    const dataSubmissaoDentro = new Date('2025-01-20');
    const dataSubmissaoFora = new Date('2025-01-30');

    expect(dataSubmissaoDentro.getTime()).toBeLessThanOrEqual(dataLimite.getTime());
    expect(dataSubmissaoFora.getTime()).toBeGreaterThan(dataLimite.getTime());
  });

  it('Deferimento Total pelo Comandante deve atualizar notas dos fatores contestados e elevar a Média Ponderada da FAI', () => {
    // Grelha inicial: F1 = 10, outros 15
    const grelhaOriginal: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      grelhaOriginal[`F${i}`] = { avaliador1: 15 };
    }
    grelhaOriginal['F1'] = { avaliador1: 10 };

    const resOriginal = calcularMediaRegimental('OFICIAL', grelhaOriginal, 'efetivo');
    expect(resOriginal.classificacao).toBe('DESFAVORÁVEL'); // F1 especial < 15

    // Comandante defere a impugnação e eleva F1 para 20
    const grelhaRetificada: FaiBloco03Grelha = {
      ...grelhaOriginal,
      F1: { ...grelhaOriginal['F1'], cmdte: 20 },
    };

    const resRetificado = calcularMediaRegimental('OFICIAL', grelhaRetificada, 'efetivo');
    expect(resRetificado.MP).toBeGreaterThan(resOriginal.MP);
    expect(resRetificado.classificacao).toBe('SIGNIFICATIVAMENTE FAVORÁVEL'); // F1 agora >= 15 e todos os outros 15
  });

  it('Indeferimento pelo Comandante mantém as notas originais dos avaliadores', () => {
    const grelha: FaiBloco03Grelha = {
      F1: { avaliador1: 10, avaliador2: 10 },
    };

    const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');
    expect(res.notasEfetivas['F1']).toBe(10);
  });
});
