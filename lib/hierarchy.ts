import { POSTOS_MILITARES } from './constants';
import { Militar } from '@/types/militar';
import { UserProfile } from '@/context/auth-context';
import { FaiDocument } from '@/types/fai';

/**
 * Retorna o índice de precedência regimental do posto.
 * Menor índice = maior patente na hierarquia militar das FAA (0 = General de Exército, 15 = Soldado).
 */
export function getPostoPrecedencia(posto?: string): number {
  if (!posto) return 999;
  const p = posto.trim().toLowerCase();

  // 1. Correspondência exata por nome ou ID
  const exactIdx = POSTOS_MILITARES.findIndex(
    (item) => item.nome.toLowerCase() === p || item.id.toLowerCase() === p
  );
  if (exactIdx !== -1) return exactIdx;

  // 2. Correspondência aproximada (se posto contiver qualificadores como '1º Cabo', etc.)
  const partialIdx = POSTOS_MILITARES.findIndex((item) => {
    const nome = item.nome.toLowerCase();
    return p.startsWith(nome) || nome.startsWith(p);
  });

  return partialIdx !== -1 ? partialIdx : 999;
}

/**
 * Verifica se o primeiro militar é estritamente superior hierárquico ao segundo.
 */
export function isSuperiorHierarquico(postoSuperior?: string, postoSubordinado?: string): boolean {
  const rankSup = getPostoPrecedencia(postoSuperior);
  const rankSub = getPostoPrecedencia(postoSubordinado);
  if (rankSup === 999 || rankSub === 999) return false;
  return rankSup < rankSub;
}

/**
 * Verifica se o primeiro militar é subordinado hierárquico ao segundo.
 */
export function isSubordinado(postoMilitar?: string, postoReferencia?: string): boolean {
  return isSuperiorHierarquico(postoReferencia, postoMilitar);
}

/**
 * Ponto 2: Regra de Consulta aos Dados do Militar
 * O superior hierárquico tem acesso aos seus subordinados para efeitos de avaliação,
 * mas o subordinado não deverá ter acesso aos dados do seu superior hierárquico.
 * 
 * DPQ e ADMIN têm acesso para gestão de efetivo geral.
 * O próprio militar pode consultar o seu próprio registo.
 */
export function canConsultarMilitar(
  usuario: Pick<UserProfile, 'role' | 'nip' | 'posto' | 'unidade'> | null | undefined,
  militarAlvo: Militar
): boolean {
  if (!usuario) return false;

  // 1. ADMIN tem acesso irrestrito de auditoria/sistema
  if (usuario.role === 'ADMIN') return true;

  // 2. O próprio militar pode sempre consultar o seu dossiê individual
  if (usuario.nip === militarAlvo.nip) return true;

  // 3. Militar Avaliado comum (ex: Praça/Cabo) SÓ tem acesso ao seu próprio processo
  if (usuario.role === 'MILITAR_AVALIADO') {
    return usuario.nip === militarAlvo.nip;
  }

  // 4. Chefe do Pessoal e Quadro (DPQ): função principal de gestão de efetivo militar geral
  if (usuario.role === 'DPQ') return true;

  // 5. REGRA HIERÁRQUICA ESTRITA (Ponto 2):
  // Subordinado NUNCA pode aceder a dados de um superior hierárquico
  if (isSuperiorHierarquico(militarAlvo.posto, usuario.posto)) {
    return false; // Alvo é superior ao usuário -> ACESSO NEGADO
  }

  // 6. Superiores hierárquicos têm acesso aos seus subordinados
  if (isSuperiorHierarquico(usuario.posto, militarAlvo.posto)) {
    return true;
  }

  // Militares de mesmo posto não têm acesso mútuo por padrão (a menos que ADMIN/DPQ)
  return false;
}

/**
 * Ponto 1 e Ponto 3: Regra de Elegibilidade para Avaliação
 * - Apenas Praças podem ser avaliadas no sistema.
 * - Chefe da DPQ: por regra NÃO avalia, salvo subordinados diretos da sua própria secção/órgão.
 * - 1º Avaliador / Comandante: apenas subordinados diretos da cadeia funcional.
 */
export function canAvaliarMilitar(
  avaliador: (Pick<UserProfile, 'role' | 'nip' | 'posto' | 'unidade'> & { orgao?: string }) | null | undefined,
  militarAlvo: Militar
): boolean {
  if (!avaliador) return false;

  // 1. Apenas militares da categoria Praça são elegíveis para avaliação regimental
  if (militarAlvo.categoria !== 'PRACA') return false;

  // 2. Não pode auto-avaliar-se
  if (avaliador.nip === militarAlvo.nip) return false;

  // 3. ADMIN pode testar/gerir o sistema
  if (avaliador.role === 'ADMIN') return true;

  // 4. PONTO 1: CHEFE DO PESSOAL E QUADRO (DPQ)
  // Não avalia por regra. Apenas se tiver subordinados diretos na própria secção/órgão.
  if (avaliador.role === 'DPQ') {
    const isMesmoOrgaoSecao =
      Boolean(avaliador.orgao && militarAlvo.orgao && avaliador.orgao.toLowerCase() === militarAlvo.orgao.toLowerCase()) ||
      Boolean(militarAlvo.funcaoDesempenhada?.toLowerCase().includes('pessoal') || militarAlvo.orgao?.toLowerCase().includes('pessoal') || militarAlvo.orgao?.toLowerCase().includes('dpq')) ||
      Boolean(avaliador.unidade && militarAlvo.unidade && avaliador.unidade.toLowerCase() === militarAlvo.unidade.toLowerCase() && (militarAlvo.funcaoDesempenhada?.toLowerCase().includes('secção') || militarAlvo.funcaoDesempenhada?.toLowerCase().includes('seccao')));

    return isMesmoOrgaoSecao && isSuperiorHierarquico(avaliador.posto, militarAlvo.posto);
  }

  // 5. PONTO 3: PRIMEIRO AVALIADOR & DEMAIS AVALIADORES
  // Deve ser superior hierárquico ao militar avaliado
  if (!isSuperiorHierarquico(avaliador.posto, militarAlvo.posto)) {
    return false;
  }

  // Pode avaliar se for superior hierárquico
  return true;
}

/**
 * Ponto 2 e Ponto 4: Regra de Acesso à FAI
 * - Avaliado só pode aceder à sua própria FAI.
 * - Subordinado não pode ver FAI de superior.
 * - Avaliadores só veem FAIs onde são intervenientes ou superiores da cadeia.
 */
export function canAcessarFai(
  usuario: Pick<UserProfile, 'role' | 'nip' | 'posto' | 'unidade'> | null | undefined,
  fai: FaiDocument
): boolean {
  if (!usuario) return false;
  if (usuario.role === 'ADMIN') return true;

  // Avaliado
  if (usuario.nip === fai.militarNip) return true;
  if (usuario.role === 'MILITAR_AVALIADO') return false; // Tentando aceder a FAI de outro

  // Chefe da DPQ (audita e homologa processos na etapa final)
  if (usuario.role === 'DPQ') return true;

  // Se o militar avaliado for superior hierárquico ao usuário, bloqueia
  if (fai.militar?.posto && isSuperiorHierarquico(fai.militar.posto, usuario.posto)) {
    return false;
  }

  // Avaliador atribuído à FAI
  if (
    fai.pareceres?.avaliador1?.nip === usuario.nip ||
    fai.pareceres?.avaliador2?.nip === usuario.nip ||
    fai.pareceres?.cmdte?.nip === usuario.nip
  ) {
    return true;
  }

  // Superiores da unidade
  if (usuario.role === 'CMDTE' || usuario.role === 'AVALIADOR_1' || usuario.role === 'AVALIADOR_2') {
    return true;
  }

  return false;
}
