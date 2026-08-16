import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ClassificacaoRegimental } from '@/types/fai';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNip(nip: string): string {
  if (!nip) return '';
  const cleaned = nip.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  return nip;
}

export function formatDataPt(dataStr?: string): string {
  if (!dataStr) return '-';
  try {
    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return dataStr;
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(data);
  } catch {
    return dataStr;
  }
}

export function calcularDiasRestantes(dataEntradaStr: string, prazoLimiteDias: number): {
  diasDecorridos: number;
  diasRestantes: number;
  atrasado: boolean;
  percentualUsado: number;
  corStatus: 'verde' | 'amarelo' | 'vermelho';
} {
  const agora = new Date();
  const entrada = new Date(dataEntradaStr);
  const diffMs = agora.getTime() - entrada.getTime();
  const diasDecorridos = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diasRestantes = prazoLimiteDias - diasDecorridos;
  const atrasado = diasRestantes < 0;

  const percentualUsado = Math.min(100, Math.max(0, Math.round((diasDecorridos / prazoLimiteDias) * 100)));

  let corStatus: 'verde' | 'amarelo' | 'vermelho' = 'verde';
  if (atrasado || diasRestantes <= 2) {
    corStatus = 'vermelho';
  } else if (diasRestantes <= 5) {
    corStatus = 'amarelo';
  }

  return {
    diasDecorridos,
    diasRestantes,
    atrasado,
    percentualUsado,
    corStatus,
  };
}

export function getClassificacaoBadge(classificacao: ClassificacaoRegimental): {
  rotulo: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (classificacao) {
    case 'SIGNIFICATIVAMENTE FAVORÁVEL':
      return {
        rotulo: 'Significativamente Favorável',
        bgClass: 'bg-emerald-100 dark:bg-emerald-950/60',
        textClass: 'text-emerald-800 dark:text-emerald-300 font-bold',
        borderClass: 'border-emerald-300 dark:border-emerald-800',
      };
    case 'FAVORÁVEL':
      return {
        rotulo: 'Favorável',
        bgClass: 'bg-green-50 dark:bg-green-950/40',
        textClass: 'text-green-800 dark:text-green-300 font-semibold',
        borderClass: 'border-green-200 dark:border-green-800',
      };
    case 'DESFAVORÁVEL':
    default:
      return {
        rotulo: 'Desfavorável',
        bgClass: 'bg-red-50 dark:bg-red-950/50',
        textClass: 'text-red-700 dark:text-red-300 font-bold',
        borderClass: 'border-red-200 dark:border-red-800',
      };
  }
}
