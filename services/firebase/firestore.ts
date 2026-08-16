import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { FaiDocument, EtapaWorkflowFai } from '@/types/fai';
import { Militar } from '@/types/militar';
import { Impugnacao } from '@/types/impugnacao';
import { AuditLogEntry } from '@/types/workflow';

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

export async function fetchMilitares(): Promise<Militar[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'militares'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as Militar);
    }
  } catch (err) {
    console.error('Erro ao buscar militares no Firestore:', err);
  }
  return [];
}

export async function fetchMilitarByNip(nip: string): Promise<Militar | null> {
  if (!db) return null;
  try {
    const d = await getDoc(doc(db, 'militares', nip));
    if (d.exists()) {
      return d.data() as Militar;
    }
  } catch (err) {
    console.error('Erro ao buscar militar por NIP:', err);
  }
  return null;
}

export async function saveMilitarData(militar: Militar): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'militares', militar.nip), militar);
  } catch (err) {
    console.error('Erro ao salvar militar no Firestore:', err);
  }
}

export async function fetchFais(): Promise<FaiDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'fais'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as FaiDocument);
    }
  } catch (err) {
    console.error('Erro ao buscar FAIs no Firestore:', err);
  }
  return [];
}

export async function fetchFaiById(id: string): Promise<FaiDocument | null> {
  if (!db) return null;
  try {
    const d = await getDoc(doc(db, 'fais', id));
    if (d.exists()) {
      return d.data() as FaiDocument;
    }
  } catch (err) {
    console.error('Erro ao buscar FAI por ID:', err);
  }
  return null;
}

export async function saveFaiDocument(fai: FaiDocument): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'fais', fai.id), fai);
  } catch (err) {
    console.error('Erro ao salvar FAI no Firestore:', err);
  }
}

export async function avancarWorkflowFai(
  faiId: string,
  novaEtapa: EtapaWorkflowFai,
  responsavel: { nip: string; nome: string; posto: string; despacho?: string }
): Promise<FaiDocument | null> {
  if (!db) return null;
  try {
    const faiRef = doc(db, 'fais', faiId);
    const snap = await getDoc(faiRef);
    if (!snap.exists()) return null;

    const faiData = snap.data() as FaiDocument;
    const etapaAnterior = faiData.workflow.etapaAtual;
    const now = new Date().toISOString();

    const historicoAtual = faiData.workflow.historicoEtapas || [];
    historicoAtual.push({
      etapa: etapaAnterior,
      dataEntrada: faiData.workflow.dataInicioEtapa,
      dataSaida: now,
      responsavelNip: responsavel.nip,
      despacho: responsavel.despacho,
    });

    const updatedFai: FaiDocument = {
      ...faiData,
      workflow: {
        etapaAtual: novaEtapa,
        dataInicioEtapa: now,
        historicoEtapas: historicoAtual,
      },
      updatedAt: now,
    };

    await setDoc(faiRef, updatedFai);

    await registrarAuditLog({
      evento: 'TRANSICAO_WORKFLOW',
      detalhes: `Avanço de etapa de ${etapaAnterior} para ${novaEtapa}. Despacho: ${responsavel.despacho || 'Sem despacho'}`,
      militarNip: faiData.militarNip,
      faiId: faiId,
      etapaDe: etapaAnterior,
      etapaPara: novaEtapa,
      responsavel: `${responsavel.posto} ${responsavel.nome} (${responsavel.nip})`,
    });

    return updatedFai;
  } catch (err) {
    console.error('Erro ao avançar workflow:', err);
    return null;
  }
}

export async function assinarTomadaConhecimento(
  faiId: string,
  dados: {
    nip: string;
    nome: string;
    posto: string;
    concordou: boolean;
    observacoes?: string;
  }
): Promise<FaiDocument | null> {
  if (!db) return null;
  try {
    const faiRef = doc(db, 'fais', faiId);
    const snap = await getDoc(faiRef);
    if (!snap.exists()) return null;

    const faiData = snap.data() as FaiDocument;
    const now = new Date().toISOString();

    const updatedFai: FaiDocument = {
      ...faiData,
      pareceres: {
        ...faiData.pareceres,
        avaliado: {
          dataConhecimento: now,
          conhecimentoTomado: true,
          concordou: dados.concordou,
          observacoesDiscordancia: dados.observacoes,
          nomeAvaliado: dados.nome,
          postoAvaliado: dados.posto,
          nipAvaliado: dados.nip,
          assinaturaDigital: `ASS-DIGITAL-${dados.nip}-${Date.now().toString(36).toUpperCase()}`,
        },
      },
      updatedAt: now,
    };

    await setDoc(faiRef, updatedFai);

    await registrarAuditLog({
      evento: 'TOMADA_CONHECIMENTO',
      detalhes: `Tomada de conhecimento assinada pelo militar avaliado (${dados.concordou ? 'Concordou' : 'Discordou / Reservou Reclamação'}).`,
      militarNip: faiData.militarNip,
      faiId: faiId,
      responsavel: `${dados.posto} ${dados.nome} (${dados.nip})`,
    });

    return updatedFai;
  } catch (err) {
    console.error('Erro ao assinar tomada de conhecimento:', err);
    return null;
  }
}

export async function fetchImpugnacoes(): Promise<Impugnacao[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'impugnacoes'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as Impugnacao);
    }
  } catch (err) {
    console.error('Erro ao buscar impugnações:', err);
  }
  return [];
}

export async function saveImpugnacao(imp: Impugnacao): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'impugnacoes', imp.id), imp);
    await registrarAuditLog({
      evento: 'IMPUGNACAO_REGISTADA',
      detalhes: `Reclamação ${imp.id} submetida para a FAI ${imp.faiId}.`,
      militarNip: imp.militarNip,
      faiId: imp.faiId,
      responsavel: `${imp.militarPosto} ${imp.militarNome} (${imp.militarNip})`,
    });
  } catch (err) {
    console.error('Erro ao salvar impugnação:', err);
  }
}

export async function despacharImpugnacao(
  impId: string,
  despacho: {
    decisao: Impugnacao['status'];
    textoDespacho: string;
    autoridadeNip: string;
    autoridadeNome: string;
    autoridadePosto: string;
    notasRetificadas?: Record<string, number>;
  }
): Promise<void> {
  if (!db) return;
  try {
    const impRef = doc(db, 'impugnacoes', impId);
    const snap = await getDoc(impRef);
    if (!snap.exists()) return;

    const impData = snap.data() as Impugnacao;
    const now = new Date().toISOString();

    const updated: Impugnacao = {
      ...impData,
      status: despacho.decisao,
      despachoComando: {
        dataDespacho: now,
        autoridadeNip: despacho.autoridadeNip,
        autoridadeNome: despacho.autoridadeNome,
        autoridadePosto: despacho.autoridadePosto,
        decisao: despacho.decisao,
        textoDespacho: despacho.textoDespacho,
        notasRetificadas: despacho.notasRetificadas,
      },
    };

    await setDoc(impRef, updated);

    await registrarAuditLog({
      evento: 'DESPACHO_IMPUGNACAO',
      detalhes: `Despacho ${despacho.decisao} emitido para a reclamação ${impId}.`,
      militarNip: impData.militarNip,
      faiId: impData.faiId,
      responsavel: `${despacho.autoridadePosto} ${despacho.autoridadeNome} (${despacho.autoridadeNip})`,
    });
  } catch (err) {
    console.error('Erro ao despachar impugnação:', err);
  }
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50)));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as AuditLogEntry);
    }
  } catch (err) {
    console.error('Erro ao buscar logs de auditoria:', err);
  }
  return [];
}

export async function registrarAuditLog(entry: Partial<AuditLogEntry>): Promise<void> {
  if (!db) return;
  try {
    const id = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const logData: AuditLogEntry = {
      id,
      timestamp: new Date().toISOString(),
      evento: entry.evento || 'OPERACAO_SISTEMA',
      detalhes: entry.detalhes || '',
      militarNip: entry.militarNip,
      faiId: entry.faiId,
      responsavel: entry.responsavel || 'Sistema FAA',
      etapaDe: entry.etapaDe,
      etapaPara: entry.etapaPara,
      despacho: entry.despacho,
      hashSeguranca: `SHA256-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
    await setDoc(doc(db, 'audit_logs', id), logData);
  } catch (err) {
    console.error('Erro ao registrar log de auditoria:', err);
  }
}

export async function fetchUsers(): Promise<SystemUserRecord[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as SystemUserRecord);
    }
  } catch (err) {
    console.error('Erro ao buscar utilizadores:', err);
  }
  return [];
}

export async function updateUserRole(
  uid: string,
  newRole: SystemUserRecord['role']
): Promise<void> {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'users', uid), { role: newRole });
    await registrarAuditLog({
      evento: 'ALTERACAO_PAPEL_UTILIZADOR',
      detalhes: `Papel do utilizador ${uid} alterado para ${newRole}.`,
      responsavel: 'Administrador do Sistema',
    });
  } catch (err) {
    console.error('Erro ao atualizar papel do utilizador:', err);
  }
}
