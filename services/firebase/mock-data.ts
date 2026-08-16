import { Militar } from '@/types/militar';
import { FaiDocument } from '@/types/fai';
import { ImpugnacaoDocument } from '@/types/impugnacao';
import { AuditLogEntry } from '@/types/workflow';

// Clean initial state (no mock data)
export const INITIAL_MILITARES: Militar[] = [];
export const INITIAL_FAIS: FaiDocument[] = [];
export const INITIAL_IMPUGNACOES: ImpugnacaoDocument[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
