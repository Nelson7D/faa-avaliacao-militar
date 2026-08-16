import { Militar } from '@/types/militar';
import { FaiDocument, EtapaWorkflow } from '@/types/fai';
import { ImpugnacaoDocument } from '@/types/impugnacao';
import { AuditLogEntry, WORKFLOW_ETAPAS_CONFIG } from '@/types/workflow';
import {
  INITIAL_MILITARES,
  INITIAL_FAIS,
  INITIAL_IMPUGNACOES,
  INITIAL_AUDIT_LOGS,
} from './mock-data';
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

// In-Memory & LocalStorage Store for seamless local operation
class LocalDataStore {
  private militares: Militar[] = [...INITIAL_MILITARES];
  private fais: FaiDocument[] = [...INITIAL_FAIS];
  private impugnacoes: ImpugnacaoDocument[] = [...INITIAL_IMPUGNACOES];
  private auditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMil = localStorage.getItem('faa_militares');
      if (savedMil) {
        try {
          this.militares = JSON.parse(savedMil);
        } catch {}
      }
      const savedFais = localStorage.getItem('faa_fais');
      if (savedFais) {
        try {
          this.fais = JSON.parse(savedFais);
        } catch {}
      }
      const savedImp = localStorage.getItem('faa_impugnacoes');
      if (savedImp) {
        try {
          this.impugnacoes = JSON.parse(savedImp);
        } catch {}
      }
      const savedLogs = localStorage.getItem('faa_audit_logs');
      if (savedLogs) {
        try {
          this.auditLogs = JSON.parse(savedLogs);
        } catch {}
      }
    }
  }

  private persist(key: string, data: unknown) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {}
    }
  }

  // Militares
  getMilitares(): Militar[] {
    return this.militares;
  }
  getMilitarByNip(nip: string): Militar | undefined {
    return this.militares.find((m) => m.nip === nip);
  }
  saveMilitar(militar: Militar): Militar {
    const idx = this.militares.findIndex((m) => m.nip === militar.nip);
    if (idx >= 0) {
      this.militares[idx] = militar;
    } else {
      this.militares.push(militar);
    }
    this.persist('faa_militares', this.militares);
    return militar;
  }

  // FAIs
  getFais(): FaiDocument[] {
    return this.fais.map((fai) => ({
      ...fai,
      militar: this.getMilitarByNip(fai.militarNip),
    }));
  }
  getFaiById(id: string): FaiDocument | undefined {
    const fai = this.fais.find((f) => f.id === id);
    if (!fai) return undefined;
    return {
      ...fai,
      militar: this.getMilitarByNip(fai.militarNip),
    };
  }
  getFaisByMilitar(nip: string): FaiDocument[] {
    return this.getFais().filter((f) => f.militarNip === nip);
  }
  saveFai(fai: FaiDocument): FaiDocument {
    const idx = this.fais.findIndex((f) => f.id === fai.id);
    if (idx >= 0) {
      this.fais[idx] = { ...fai, updatedAt: new Date().toISOString() };
    } else {
      this.fais.push({
        ...fai,
        createdAt: fai.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.persist('faa_fais', this.fais);
    return fai;
  }

  // Impugnações
  getImpugnacoes(): ImpugnacaoDocument[] {
    return this.impugnacoes.map((imp) => ({
      ...imp,
      militar: this.getMilitarByNip(imp.militarNip),
    }));
  }
  getImpugnacaoById(id: string): ImpugnacaoDocument | undefined {
    const imp = this.impugnacoes.find((i) => i.id === id);
    if (!imp) return undefined;
    return {
      ...imp,
      militar: this.getMilitarByNip(imp.militarNip),
    };
  }
  saveImpugnacao(impugnacao: ImpugnacaoDocument): ImpugnacaoDocument {
    const idx = this.impugnacoes.findIndex((i) => i.id === impugnacao.id);
    if (idx >= 0) {
      this.impugnacoes[idx] = { ...impugnacao, updatedAt: new Date().toISOString() };
    } else {
      this.impugnacoes.push({
        ...impugnacao,
        createdAt: impugnacao.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.persist('faa_impugnacoes', this.impugnacoes);
    return impugnacao;
  }

  // Audit Logs
  getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }
  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const log: AuditLogEntry = {
      ...entry,
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    this.persist('faa_audit_logs', this.auditLogs);
    return log;
  }
}

export const localStore = new LocalDataStore();

// ================= FIRESTORE SERVICE LAYER ================= //

export async function seedFirestoreInitialData(): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    for (const m of INITIAL_MILITARES) {
      await setDoc(doc(db, 'militares', m.nip), m);
    }
    for (const f of INITIAL_FAIS) {
      await setDoc(doc(db, 'fais', f.id), f);
    }
    for (const imp of INITIAL_IMPUGNACOES) {
      await setDoc(doc(db, 'impugnacoes', imp.id), imp);
    }
    for (const log of INITIAL_AUDIT_LOGS) {
      await setDoc(doc(db, 'audit_logs', log.id), log);
    }
    console.info('✓ Dados iniciais de militares e FAIs sincronizados com sucesso no Cloud Firestore!');
  } catch (err) {
    console.warn('Erro ao popular Firestore inicial:', err);
  }
}

export async function fetchMilitares(): Promise<Militar[]> {
  if (!isFirebaseConfigured() || !db) {
    return localStore.getMilitares();
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
    return localStore.getMilitares();
  }
}

export async function fetchMilitarByNip(nip: string): Promise<Militar | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return localStore.getMilitarByNip(nip);
  }
  try {
    const docRef = doc(db, 'militares', nip);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Militar;
    }
    return localStore.getMilitarByNip(nip);
  } catch (err) {
    return localStore.getMilitarByNip(nip);
  }
}

export async function saveMilitarData(militar: Militar): Promise<Militar> {
  localStore.saveMilitar(militar);
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
    return localStore.getFais();
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
    return localStore.getFais();
  }
}

export async function fetchFaiById(id: string): Promise<FaiDocument | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return localStore.getFaiById(id);
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
    return localStore.getFaiById(id);
  } catch (err) {
    return localStore.getFaiById(id);
  }
}

export async function saveFaiDocument(fai: FaiDocument): Promise<FaiDocument> {
  localStore.saveFai(fai);
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'fais', fai.id), fai);
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
    return localStore.getImpugnacoes();
  }
  try {
    const col = collection(db, 'impugnacoes');
    const snap = await getDocs(col);
    if (snap.empty) {
      return localStore.getImpugnacoes();
    }
    const imp = snap.docs.map((d) => d.data() as ImpugnacaoDocument);
    const militares = await fetchMilitares();
    return imp.map((i) => ({
      ...i,
      militar: militares.find((m) => m.nip === i.militarNip),
    }));
  } catch (err) {
    return localStore.getImpugnacoes();
  }
}

export async function fetchImpugnacaoById(id: string): Promise<ImpugnacaoDocument | undefined> {
  if (!isFirebaseConfigured() || !db) {
    return localStore.getImpugnacaoById(id);
  }
  try {
    const docRef = doc(db, 'impugnacoes', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const imp = snap.data() as ImpugnacaoDocument;
      const militar = await fetchMilitarByNip(imp.militarNip);
      return { ...imp, militar };
    }
    return localStore.getImpugnacaoById(id);
  } catch (err) {
    return localStore.getImpugnacaoById(id);
  }
}

export async function saveImpugnacaoDocument(impugnacao: ImpugnacaoDocument): Promise<ImpugnacaoDocument> {
  localStore.saveImpugnacao(impugnacao);
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'impugnacoes', impugnacao.id), impugnacao);
    } catch (err) {
      console.warn('Firestore saveImpugnacaoDocument error:', err);
    }
  }
  return impugnacao;
}

export async function registrarAuditLog(
  log: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<AuditLogEntry> {
  const created = localStore.addAuditLog(log);
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
    return localStore.getAuditLogs();
  }
  try {
    const col = collection(db, 'audit_logs');
    const snap = await getDocs(query(col, orderBy('timestamp', 'desc')));
    if (snap.empty) {
      return localStore.getAuditLogs();
    }
    return snap.docs.map((d) => d.data() as AuditLogEntry);
  } catch (err) {
    return localStore.getAuditLogs();
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

