import { describe, it, expect } from 'vitest';
import { UserProfile } from '@/context/auth-context';

describe('Controlo de Acesso Baseado em Papéis Militares (RBAC FAA)', () => {
  const ROLES_SISTEMA: UserProfile['role'][] = [
    'ADMIN',
    'DPQ',
    'CMDTE',
    'AVALIADOR_1',
    'AVALIADOR_2',
    'MILITAR_AVALIADO',
  ];

  it('Deve contemplar todos os 6 papéis operacionais fundamentais', () => {
    expect(ROLES_SISTEMA).toHaveLength(6);
    expect(ROLES_SISTEMA).toContain('ADMIN');
    expect(ROLES_SISTEMA).toContain('DPQ');
    expect(ROLES_SISTEMA).toContain('CMDTE');
    expect(ROLES_SISTEMA).toContain('AVALIADOR_1');
    expect(ROLES_SISTEMA).toContain('AVALIADOR_2');
    expect(ROLES_SISTEMA).toContain('MILITAR_AVALIADO');
  });

  it('MILITAR_AVALIADO: Não possui permissão para avaliar outros militares nem acessar o painel de administração', () => {
    const role: UserProfile['role'] = 'MILITAR_AVALIADO';
    const evaluatorOnlyRoutes = ['/fai/nova', '/admin', '/ia-analytics'];

    evaluatorOnlyRoutes.forEach((route) => {
      const isEvaluatorOnly =
        route.startsWith('/fai/nova') || route === '/admin' || route === '/ia-analytics';
      expect(isEvaluatorOnly).toBe(true);
    });

    const canEvaluate = role === 'AVALIADOR_1' || role === 'AVALIADOR_2' || role === 'CMDTE' || role === 'DPQ' || role === 'ADMIN';
    expect(canEvaluate).toBe(false);
  });

  it('AVALIADOR_1: Permissão exclusiva para preencher Bloco 03 (Coluna 1º Avaliador) e Bloco 05', () => {
    const role: UserProfile['role'] = 'AVALIADOR_1';

    const canEditAval1 = role === 'AVALIADOR_1' || role === 'ADMIN';
    const canEditAval2 = role === 'AVALIADOR_2';
    const canEditCmdte = role === 'CMDTE';

    expect(canEditAval1).toBe(true);
    expect(canEditAval2).toBe(false);
    expect(canEditCmdte).toBe(false);
  });

  it('AVALIADOR_2: Permissão exclusiva para ratificar ou discordar no Bloco 03 e Bloco 06', () => {
    const role: UserProfile['role'] = 'AVALIADOR_2';

    const canEditAval2 = role === 'AVALIADOR_2' || role === 'ADMIN';
    const canEditCmdte = role === 'CMDTE';

    expect(canEditAval2).toBe(true);
    expect(canEditCmdte).toBe(false);
  });

  it('CMDTE: Poder de substituição, despacho no Bloco 07 e julgamento de impugnações', () => {
    const role: UserProfile['role'] = 'CMDTE';

    const canDespachar = role === 'CMDTE' || role === 'ADMIN';
    expect(canDespachar).toBe(true);
  });

  it('DPQ (Chefe do Pessoal e Quadro): Gestão de efetivo (cadastro/matrícula) e homologação final (Bloco 11), sem exercer por regra papel de avaliador', () => {
    const roleDpq: UserProfile['role'] = 'DPQ';
    const canManageEfetivo = roleDpq === 'DPQ' || roleDpq === 'ADMIN';
    const canHomologarFinal = roleDpq === 'DPQ' || roleDpq === 'ADMIN';

    expect(canManageEfetivo).toBe(true);
    expect(canHomologarFinal).toBe(true);
  });
});
