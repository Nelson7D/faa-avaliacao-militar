import { Militar } from '@/types/militar';
import { FaiDocument, EtapaWorkflow } from '@/types/fai';
import { ImpugnacaoDocument } from '@/types/impugnacao';
import { AuditLogEntry, WORKFLOW_ETAPAS_CONFIG } from '@/types/workflow';
import { AtribuicaoAvaliacao, ValidacaoCodigoResult, PapelAvaliador } from '@/types/avaliacao';
import { db, isFirebaseConfigured } from './config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

// ================= FIRESTORE SERVICE LAYER ================= //

function sanitizeFirestoreData<T>(data: T): T {
  if (data === undefined) return null as any;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeFirestoreData) as any;
  }
  const clean: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeFirestoreData(value);
    }
  }
  return clean;
}

export async function fetchMilitares(): Promise<Militar[]> {
  if (!isFirebaseConfigured() || !db) {
    return [];
  }
  try {
    const col = collection(db, 'militares');
    const snap = await getDocs(col);
    if (snap.empty) {
      return [];
    }
    return snap.docs.map((d) => d.data() as Militar);
  } catch (err) {
    console.warn('Firestore fetchMilitares error:', err);
    return [];
  }
}

export async function fetchMilitarByNip(nip: string): Promise<Militar | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return undefined;
  }
  try {
    const docRef = doc(db, 'militares', nip);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Militar;
    }
    return undefined;
  } catch (err) {
    console.warn('Firestore fetchMilitarByNip error:', err);
    return undefined;
  }
}

export async function saveMilitarData(militar: Militar): Promise<Militar> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'militares', militar.nip), militar);
    } catch (err) {
      console.warn('Firestore saveMilitarData error:', err);
    }
  }
  return militar;
}

export async function fetchFais(): Promise<FaiDocument[]> {
  if (!isFirebaseConfigured() || !db) {
    return [];
  }
  try {
    const col = collection(db, 'fais');
    const snap = await getDocs(col);
    if (snap.empty) {
      return [];
    }
    const fais = snap.docs.map((d) => d.data() as FaiDocument);
    const militares = await fetchMilitares();
    return fais.map((f) => ({
      ...f,
      workflow: f.workflow || {
        etapaAtual: 'AVALIADOR_1',
        diasNaEtapa: 3,
        prazoLimiteEtapa: 30,
        atrasado: false,
        historico: [],
      },
      grelha: f.grelha || {},
      militar: militares.find((m) => m.nip === f.militarNip),
    }));
  } catch (err) {
    console.warn('Firestore fetchFais error:', err);
    return [];
  }
}

export async function fetchFaiById(id: string): Promise<FaiDocument | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return undefined;
  }
  try {
    const docRef = doc(db, 'fais', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const fai = snap.data() as FaiDocument;
      const militar = await fetchMilitarByNip(fai.militarNip);
      return {
        ...fai,
        workflow: fai.workflow || {
          etapaAtual: 'AVALIADOR_1',
          diasNaEtapa: 3,
          prazoLimiteEtapa: 30,
          atrasado: false,
          historico: [],
        },
        grelha: fai.grelha || {},
        militar,
      };
    }
    return undefined;
  } catch (err) {
    console.warn('Firestore fetchFaiById error:', err);
    return undefined;
  }
}

export async function saveFaiDocument(fai: FaiDocument): Promise<FaiDocument> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'fais', fai.id), sanitizeFirestoreData(fai));
    } catch (err) {
      console.warn('Firestore saveFaiDocument error:', err);
    }
  }
  return fai;
}

export async function avancarWorkflowFai(
  faiId: string,
  proximaEtapa: EtapaWorkflow,
  operador: { nip: string; nome: string; posto: string; despacho?: string }
): Promise<FaiDocument> {
  const fai = await fetchFaiById(faiId);
  if (!fai) throw new Error(`FAI ${faiId} não encontrada`);

  const prazoDias = WORKFLOW_ETAPAS_CONFIG[proximaEtapa]?.prazoDias || 5;

  const updatedFai: FaiDocument = {
    ...fai,
    workflow: {
      ...fai.workflow,
      etapaAtual: proximaEtapa,
      diasNaEtapa: 0,
      prazoLimiteEtapa: prazoDias,
      atrasado: false,
      dataEntradaEtapa: new Date().toISOString().split('T')[0],
      historico: [
        ...(fai.workflow.historico || []),
        {
          etapa: proximaEtapa,
          dataTransicao: new Date().toISOString(),
          responsavelNip: operador.nip,
          responsavelNome: operador.nome,
          despacho: operador.despacho,
        },
      ],
    },
  };

  await saveFaiDocument(updatedFai);

  await registrarAuditLog({
    operadorNip: operador.nip,
    operadorNome: operador.nome,
    operadorPosto: operador.posto,
    acao: `AVANCO_WORKFLOW_${proximaEtapa}`,
    entidade: 'FAI',
    entidadeId: faiId,
    detalhes: {
      etapaAnterior: fai.workflow.etapaAtual,
      novaEtapa: proximaEtapa,
      despacho: operador.despacho,
    },
  });

  return updatedFai;
}

export async function fetchImpugnacoes(): Promise<ImpugnacaoDocument[]> {
  if (!isFirebaseConfigured() || !db) {
    return [];
  }
  try {
    const col = collection(db, 'impugnacoes');
    const snap = await getDocs(col);
    if (snap.empty) {
      return [];
    }
    const imp = snap.docs.map((d) => d.data() as ImpugnacaoDocument);
    const militares = await fetchMilitares();
    return imp.map((i) => ({
      ...i,
      militar: militares.find((m) => m.nip === i.militarNip),
    }));
  } catch (err) {
    console.warn('Firestore fetchImpugnacoes error:', err);
    return [];
  }
}

export async function fetchImpugnacaoById(id: string): Promise<ImpugnacaoDocument | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return undefined;
  }
  try {
    const docRef = doc(db, 'impugnacoes', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const imp = snap.data() as ImpugnacaoDocument;
      const militar = await fetchMilitarByNip(imp.militarNip);
      return { ...imp, militar };
    }
    return undefined;
  } catch (err) {
    console.warn('Firestore fetchImpugnacaoById error:', err);
    return undefined;
  }
}

export async function saveImpugnacaoDocument(impugnacao: ImpugnacaoDocument): Promise<ImpugnacaoDocument> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'impugnacoes', impugnacao.id), sanitizeFirestoreData(impugnacao));
    } catch (err) {
      console.warn('Firestore saveImpugnacaoDocument error:', err);
    }
  }
  return impugnacao;
}

export async function registrarAuditLog(
  log: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<AuditLogEntry> {
  const created: AuditLogEntry = {
    ...log,
    id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
  };
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'audit_logs', created.id), created);
    } catch (err) {
      console.warn('Firestore registrarAuditLog error:', err);
    }
  }
  return created;
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  if (!isFirebaseConfigured() || !db) {
    return [];
  }
  try {
    const col = collection(db, 'audit_logs');
    const snap = await getDocs(query(col, orderBy('timestamp', 'desc')));
    if (snap.empty) {
      return [];
    }
    return snap.docs.map((d) => d.data() as AuditLogEntry);
  } catch (err) {
    console.warn('Firestore fetchAuditLogs error:', err);
    return [];
  }
}

// ================= ADMIN & USER MANAGEMENT ================= //

export interface SystemUserRecord {
  uid: string;
  email: string;
  nip: string;
  nomeCompleto: string;
  posto: string;
  unidade: string;
  role: 'ADMIN' | 'DPQ' | 'CMDTE' | 'AVALIADOR_1' | 'AVALIADOR_2' | 'MILITAR_AVALIADO';
  categoria: 'OFICIAL' | 'SARGENTO' | 'PRACA';
}

export async function fetchUsers(): Promise<SystemUserRecord[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const col = collection(db, 'users');
      const snap = await getDocs(col);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) }));
      }
    } catch (err) {
      console.warn('Firestore fetchUsers warning:', err);
    }
  }

  return [];
}

export async function updateUserRole(
  uid: string,
  newRole: SystemUserRecord['role']
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'users', uid), { role: newRole }, { merge: true });
    } catch (err) {
      console.warn('Firestore updateUserRole error:', err);
    }
  }
  // Also register audit log
  await registrarAuditLog({
    militarNip: uid,
    acao: `Alteração de papel regimental para ${newRole}`,
    etapaDe: 'SISTEMA',
    etapaPara: newRole,
    responsavel: 'Administrador do Sistema',
  });
}

// ================= TOMADA DE CONHECIMENTO (BLOCO 09) ================= //

export async function assinarTomadaConhecimento(
  faiId: string,
  dados: {
    nip: string;
    nome: string;
    posto: string;
    concordou: boolean;
    observacoes?: string;
  }
): Promise<FaiDocument | undefined> {
  const fai = await fetchFaiById(faiId);
  if (!fai) return undefined;

  const updatedPareceres = {
    ...fai.pareceres,
    avaliado: {
      conhecimentoTomado: true,
      dataConhecimento: new Date().toISOString(),
      concordou: dados.concordou,
      observacoesDiscordancia: dados.concordou ? undefined : dados.observacoes,
      nomeAvaliado: dados.nome,
      postoAvaliado: dados.posto,
      nipAvaliado: dados.nip,
    },
  };

  const updatedFai: FaiDocument = {
    ...fai,
    pareceres: updatedPareceres,
    updatedAt: new Date().toISOString(),
  };

  await saveFaiDocument(updatedFai);

  // Register in audit log
  await registrarAuditLog({
    faiId,
    militarNip: dados.nip,
    acao: dados.concordou
      ? 'Tomada de conhecimento favorável (Concordou com a nota)'
      : 'Tomada de conhecimento com discordância (Reclamação fundamentada)',
    etapaDe: fai.workflow.etapaAtual,
    etapaPara: fai.workflow.etapaAtual,
    responsavel: `${dados.posto} ${dados.nome}`,
    despacho: dados.observacoes,
  });

  return updatedFai;
}

// ================= CONFIGURAÇÕES GERAIS DO SISTEMA ================= //

export interface SystemConfigGeral {
  anoInstrucao: string;
  prazoFai: string;
  prazoImpugnacao: string;
  travarSubmissoes: boolean;
}

export async function fetchConfiguracoesGeral(): Promise<SystemConfigGeral> {
  const defaultConfig: SystemConfigGeral = {
    anoInstrucao: '2025/2026',
    prazoFai: '30',
    prazoImpugnacao: '15',
    travarSubmissoes: false,
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'configuracoes', 'geral');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...defaultConfig, ...(snap.data() as Partial<SystemConfigGeral>) };
      }
    } catch (err) {
      console.warn('Firestore fetchConfiguracoesGeral error:', err);
    }
  }

  return defaultConfig;
}

export async function saveConfiguracoesGeral(config: SystemConfigGeral): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'configuracoes', 'geral'), config, { merge: true });
    } catch (err) {
      console.warn('Firestore saveConfiguracoesGeral error:', err);
    }
  }
}

// ================= ATRIBUIÇÕES E CÓDIGOS DE ACESSO INDIVIDUAIS (DPQ) ================= //

function gerarCodigoRegimental(prefixo: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FAA-${prefixo}-${rand}`;
}

export async function criarAtribuicaoAvaliacao(
  dados: Omit<
    AtribuicaoAvaliacao,
    | 'id'
    | 'codigoAcessoAvaliador1'
    | 'codigoAcessoAvaliador2'
    | 'codigoAcessoCmdte'
    | 'statusAvaliador1'
    | 'statusAvaliador2'
    | 'statusCmdte'
    | 'statusGeral'
    | 'criadoEm'
    | 'atualizadoEm'
  >
): Promise<AtribuicaoAvaliacao> {
  const id = `ATR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  const codAval1 = gerarCodigoRegimental('AV1');
  const codAval2 = dados.numeroAvaliadores >= 2 ? gerarCodigoRegimental('AV2') : undefined;
  const codCmdte = dados.numeroAvaliadores === 3 ? gerarCodigoRegimental('CMD') : undefined;

  const atribuicao: AtribuicaoAvaliacao = {
    ...dados,
    id,
    codigoAcessoAvaliador1: codAval1,
    statusAvaliador1: 'PENDENTE',
    codigoAcessoAvaliador2: codAval2,
    statusAvaliador2: dados.numeroAvaliadores >= 2 ? 'PENDENTE' : undefined,
    codigoAcessoCmdte: codCmdte,
    statusCmdte: dados.numeroAvaliadores === 3 ? 'PENDENTE' : undefined,
    statusGeral: 'PENDENTE',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'atribuicoes_avaliacao', id), sanitizeFirestoreData(atribuicao));
    } catch (err) {
      console.warn('Firestore criarAtribuicaoAvaliacao error:', err);
    }
  }

  await registrarAuditLog({
    operadorNip: dados.criadoPorNip,
    operadorNome: dados.criadoPorNome,
    acao: `Criação de Atribuição de Avaliação para Militar ${dados.militarAvaliadoNome} (NIP ${dados.militarAvaliadoNip}) com ${dados.numeroAvaliadores} avaliadores`,
    entidade: 'SISTEMA',
    entidadeId: id,
    militarNip: dados.militarAvaliadoNip,
    responsavel: dados.criadoPorNome,
  });

  return atribuicao;
}

export async function fetchAtribuicoes(): Promise<AtribuicaoAvaliacao[]> {
  if (!isFirebaseConfigured() || !db) {
    return [];
  }
  try {
    const col = collection(db, 'atribuicoes_avaliacao');
    const snap = await getDocs(col);
    if (snap.empty) {
      return [];
    }
    return snap.docs.map((d) => d.data() as AtribuicaoAvaliacao);
  } catch (err) {
    console.warn('Firestore fetchAtribuicoes error:', err);
    return [];
  }
}

export async function fetchAtribuicaoById(id: string): Promise<AtribuicaoAvaliacao | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return undefined;
  }
  try {
    const docRef = doc(db, 'atribuicoes_avaliacao', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AtribuicaoAvaliacao;
    }
  } catch (err) {
    console.warn('Firestore fetchAtribuicaoById error:', err);
  }
  return undefined;
}

export async function fetchAtribuicoesPorAvaliador(nip: string): Promise<AtribuicaoAvaliacao[]> {
  const todas = await fetchAtribuicoes();
  return todas.filter(
    (a) =>
      a.avaliador1Nip === nip ||
      a.avaliador2Nip === nip ||
      a.cmdteNip === nip
  );
}

export async function validarCodigoAcessoAvaliacao(
  codigo: string
): Promise<ValidacaoCodigoResult> {
  const cleanCode = (codigo || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valido: false, mensagem: 'Introduza o código individual de avaliação.' };
  }

  const todas = await fetchAtribuicoes();
  for (const atr of todas) {
    if (atr.codigoAcessoAvaliador1 === cleanCode) {
      return {
        valido: true,
        atribuicao: atr,
        papel: 'avaliador1',
        faiId: atr.faiId,
      };
    }
    if (atr.codigoAcessoAvaliador2 === cleanCode) {
      return {
        valido: true,
        atribuicao: atr,
        papel: 'avaliador2',
        faiId: atr.faiId,
      };
    }
    if (atr.codigoAcessoCmdte === cleanCode) {
      return {
        valido: true,
        atribuicao: atr,
        papel: 'cmdte',
        faiId: atr.faiId,
      };
    }
  }

  return {
    valido: false,
    mensagem: 'Código de acesso não encontrado ou inválido. Contacte o Chefe da DPQ/RH.',
  };
}

export async function vincularFaiAtribuicao(
  atribuicaoId: string,
  faiId: string
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(
        doc(db, 'atribuicoes_avaliacao', atribuicaoId),
        { faiId, statusGeral: 'EM_CURSO', atualizadoEm: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore vincularFaiAtribuicao error:', err);
    }
  }
}


