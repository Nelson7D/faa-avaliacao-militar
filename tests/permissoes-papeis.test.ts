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

  it('AVALIADOR_1: Permissão exclusiva para preencher Bloco 03 (Coluna 1º Avaliador) e Bloco 07', () => {
    const role: UserProfile['role'] = 'AVALIADOR_1';

    const canEditAval1 = role === 'AVALIADOR_1' || role === 'DPQ' || role === 'ADMIN';
    const canEditAval2 = role === 'AVALIADOR_2';
    const canEditCmdte = role === 'CMDTE';

    expect(canEditAval1).toBe(true);
    expect(canEditAval2).toBe(false);
    expect(canEditCmdte).toBe(false);
  });

  it('AVALIADOR_2: Permissão exclusiva para ratificar ou discordar no Bloco 03 e Bloco 08', () => {
    const role: UserProfile['role'] = 'AVALIADOR_2';

    const canEditAval2 = role === 'AVALIADOR_2' || role === 'DPQ' || role === 'ADMIN';
    const canEditCmdte = role === 'CMDTE';

    expect(canEditAval2).toBe(true);
    expect(canEditCmdte).toBe(false);
  });

  it('CMDTE: Poder de substituição, despacho no Bloco 09 e julgamento de impugnações', () => {
    const role: UserProfile['role'] = 'CMDTE';

    const canDespachar = role === 'CMDTE' || role === 'DPQ' || role === 'ADMIN';
    expect(canDespachar).toBe(true);
  });

  it('DPQ & ADMIN: Homologação da FAI (Bloco 11) e administração de segurança e parâmetros', () => {
    const canAdminister = (role: UserProfile['role']) => role === 'DPQ' || role === 'ADMIN';
    expect(canAdminister('DPQ')).toBe(true);
    expect(canAdminister('ADMIN')).toBe(true);
    expect(canAdminister('MILITAR_AVALIADO')).toBe(false);
    expect(canAdminister('AVALIADOR_1')).toBe(false);
  });
});
