import { describe, it, expect } from 'vitest';
import { calcularMediaRegimental } from '@/lib/calculo-fai';
import { FaiBloco03Grelha } from '@/types/fai';

describe('Motor de Cálculo Regimental das FAA (calculo-fai.ts)', () => {
  it('Cenário 1: Oficial com notas máximas (20 em todos os 16 fatores) deve ser SIGNIFICATIVAMENTE FAVORÁVEL com MP = 20.00 e Divisor 52', () => {
    const grelha: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      grelha[`F${i}`] = { avaliador1: 20 };
    }

    const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');

    expect(res.divisor).toBe(52);
    expect(res.MP).toBe(20.0);
    expect(res.classificacao).toBe('SIGNIFICATIVAMENTE FAVORÁVEL');
    expect(res.contagemNivel20).toBe(16);
    expect(res.contagemNivel5).toBe(0);
  });

  it('Cenário 2: Oficial com notas 15 em todos os fatores deve ser SIGNIFICATIVAMENTE FAVORÁVEL com MP = 15.00', () => {
    const grelha: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      grelha[`F${i}`] = { avaliador1: 15 };
    }

    const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');

    expect(res.divisor).toBe(52);
    expect(res.MP).toBe(15.0);
    expect(res.classificacao).toBe('SIGNIFICATIVAMENTE FAVORÁVEL');
  });

  it('Cenário 3: Oficial com MP >= 15 mas com uma nota em nível 10 deve ser classificado como FAVORÁVEL (não preenche todas >= 15)', () => {
    const grelha: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      grelha[`F${i}`] = { avaliador1: 20 };
    }
    // F2 (não especial) com nota 10
    grelha['F2'] = { avaliador1: 10 };

    const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');

    expect(res.MP).toBeGreaterThanOrEqual(15.0);
    expect(res.classificacao).toBe('FAVORÁVEL');
  });

  it('Cenário 4: Oficial com Fator Especial F1 = 10 (< 15) deve ser classificado como DESFAVORÁVEL', () => {
    const grelha: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      grelha[`F${i}`] = { avaliador1: 20 };
    }
    // F1 é especial (Preparação Militar e Técnica)
    grelha['F1'] = { avaliador1: 10 };

    const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');

    expect(res.classificacao).toBe('DESFAVORÁVEL');
  });

  it('Cenário 5: Oficial com 3 fatores em nível 5 deve ser classificado como DESFAVORÁVEL mesmo com MP alta', () => {
    const grelha: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      grelha[`F${i}`] = { avaliador1: 20 };
    }
    // F2, F4, F6 (não especiais) com nível 5 (total 3)
    grelha['F2'] = { avaliador1: 5 };
    grelha['F4'] = { avaliador1: 5 };
    grelha['F6'] = { avaliador1: 5 };

    const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');

    expect(res.contagemNivel5).toBe(3);
    expect(res.classificacao).toBe('DESFAVORÁVEL');
  });

  it('Cenário 6: Oficial ferido em serviço com F12 = 5 deve ser DESFAVORÁVEL; com F12 >= 10 deve ser FAVORÁVEL', () => {
    const grelha: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      grelha[`F${i}`] = { avaliador1: 15 };
    }
    grelha['F12'] = { avaliador1: 5 };

    const resFeridoF12_5 = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1', true);
    expect(resFeridoF12_5.classificacao).toBe('DESFAVORÁVEL');

    grelha['F12'] = { avaliador1: 10 };
    const resFeridoF12_10 = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1', true);
    expect(resFeridoF12_10.classificacao).toBe('FAVORÁVEL');
  });

  it('Cenário 7: Praça deve usar Divisor 31 e excluir F6, F8, F10 e F11 (Manual VII)', () => {
    const grelha: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      grelha[`F${i}`] = { avaliador1: 15 };
    }

    const res = calcularMediaRegimental('PRACA', grelha, 'avaliador1');

    expect(res.divisor).toBe(31);
    expect(res.MP).toBe(15.00);
    expect(res.classificacao).toBe('SIGNIFICATIVAMENTE FAVORÁVEL');
    // Fatores excluídos não devem estar nas notas efetivas
    expect(res.notasEfetivas['F6']).toBeUndefined();
    expect(res.notasEfetivas['F8']).toBeUndefined();
    expect(res.notasEfetivas['F10']).toBeUndefined();
    expect(res.notasEfetivas['F11']).toBeUndefined();
    // F15 está incluído para Praças com coeficiente 4
    expect(res.notasEfetivas['F15']).toBe(15);
  });

  it('Cenário 8: Prioridade de intervenção (Cmdte > 2º Avaliador > 1º Avaliador)', () => {
    const grelha: FaiBloco03Grelha = {
      F1: { avaliador1: 10, avaliador2: 15, cmdte: 20 },
    };

    const resCmdte = calcularMediaRegimental('OFICIAL', grelha, 'efetivo');
    expect(resCmdte.notasEfetivas['F1']).toBe(20);

    const resAval2 = calcularMediaRegimental('OFICIAL', grelha, 'avaliador2');
    expect(resAval2.notasEfetivas['F1']).toBe(15);

    const resAval1 = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');
    expect(resAval1.notasEfetivas['F1']).toBe(10);
  });

  it('Cenário 9: Detector de Incoerências (F11=20 e F10=5)', () => {
    const grelha: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      grelha[`F${i}`] = { avaliador1: 15 };
    }
    grelha['F11'] = { avaliador1: 20 };
    grelha['F10'] = { avaliador1: 5 };

    const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');
    expect(res.incoerenciasDetectadas?.length).toBeGreaterThan(0);
    expect(res.incoerenciasDetectadas?.[0]).toContain('Incoerência grave: Nível 20 em F11');
  });
});
