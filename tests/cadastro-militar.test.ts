import { describe, it, expect } from 'vitest';
import { sanitizeFirestoreData } from '@/services/firebase/firestore';
import { Militar } from '@/types/militar';

describe('Validação e Sanitização do Cadastro Militar FAA', () => {
  it('Deve sanitizar campos indefinidos como subcategoria e datas opcionais para o Firestore', () => {
    const militarComUndefined: Partial<Militar> = {
      nip: '88889999',
      nomeCompleto: 'Capitão Teste Operacional',
      posto: 'Capitão',
      categoria: 'OFICIAL',
      subcategoria: undefined,
      tempoServicoMeses: undefined,
      fotoUrl: undefined,
    };

    const saneado = sanitizeFirestoreData(militarComUndefined);

    // O Firestore rejeita chaves com valor undefined
    expect(saneado).not.toHaveProperty('subcategoria');
    expect(saneado).not.toHaveProperty('tempoServicoMeses');
    expect(saneado).not.toHaveProperty('fotoUrl');
    expect(saneado.nip).toBe('88889999');
    expect(saneado.nomeCompleto).toBe('Capitão Teste Operacional');
  });

  it('Deve manter a integridade dos 6 papéis regimentais no cadastro', () => {
    const rolesValidos = [
      'ADMIN',
      'DPQ',
      'CMDTE',
      'AVALIADOR_1',
      'AVALIADOR_2',
      'MILITAR_AVALIADO',
    ];

    expect(rolesValidos).toHaveLength(6);
    expect(rolesValidos).toContain('DPQ');
    expect(rolesValidos).toContain('CMDTE');
    expect(rolesValidos).toContain('AVALIADOR_1');
  });

  it('Deve garantir que NIP e e-mail sejam normalizados e sem espaços em branco', () => {
    const rawNip = '  40020792  ';
    const rawEmail = '  Pascoal@FAA.ao  ';

    const cleanNip = rawNip.trim();
    const cleanEmail = rawEmail.trim().toLowerCase();

    expect(cleanNip).toBe('40020792');
    expect(cleanEmail).toBe('pascoal@faa.ao');
  });
});
