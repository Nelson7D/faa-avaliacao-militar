'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BookOpen, Scale, Award, Clock } from 'lucide-react';

interface ManualAjudaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualAjudaModal({ open, onOpenChange }: ManualAjudaModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F3323] text-[#D4AF37] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Manual de Apoio Regimental — FAI
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Manual de Preparação Especial VII • Academia Militar / Forças Armadas Angolanas
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs text-slate-700">
          {/* Seção 1: Escala e Ponderação */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono text-[11px]">
              <Scale className="w-3.5 h-3.5 text-[#B89047]" />
              1. Escala de Pontuação e Coeficientes
            </h4>
            <p className="leading-relaxed">
              As notas são atribuídas estritamente nos níveis regimentais:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-center font-bold">
                Nível 5 (Insuficiente)
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-center font-bold">
                Nível 10 (Regular)
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-center font-bold">
                Nível 15 (Bom)
              </div>
              <div className="p-2 rounded-lg bg-green-100 border border-green-300 text-green-950 text-center font-bold">
                Nível 20 (Excelente)
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 space-y-1">
              <p>• <strong>Oficiais e Sargentos:</strong> Avaliados em 16 fatores (F1 a F16) com Divisor Base = <strong>52</strong>.</p>
              <p>• <strong>Praças:</strong> Fatores F6, F8, F10, F11, F13 e F14 são excluídos; Divisor Base = <strong>31</strong>.</p>
            </div>
          </div>

          {/* Seção 2: Critérios de Classificação */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono text-[11px]">
              <Award className="w-3.5 h-3.5 text-[#B89047]" />
              2. Critérios de Classificação Regimental
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-emerald-800">SIGNIFICATIVAMENTE FAVORÁVEL:</span>
                <p className="mt-0.5 text-slate-600">Média Ponderada (MP) &ge; 15.00 e nenhuma nota individual inferior a nível 15 em todos os fatores.</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-blue-800">FAVORÁVEL:</span>
                <p className="mt-0.5 text-slate-600">MP &ge; 11.25, todos os fatores nucleares (F1, F5, F7, F9 e F11) &ge; 15, e no máximo 2 fatores em nível 5.</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="font-bold text-rose-800">DESFAVORÁVEL:</span>
                <p className="mt-0.5 text-slate-600">MP &lt; 11.25, ou qualquer fator nuclear &lt; 15, ou 3 ou mais fatores com nível 5.</p>
              </div>
            </div>
          </div>

          {/* Seção 3: Prazos e Workflow */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#B89047]" />
              3. Prazos Regimentais (Ciclo de 30 Dias)
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
              <li><strong>1º Avaliador:</strong> 10 dias úteis para preenchimento de notas e parecer fundamentado.</li>
              <li><strong>2º Avaliador:</strong> 5 dias úteis para revisão e concordância/discordância.</li>
              <li><strong>Comandante U/E/O:</strong> 5 dias úteis para homologação ou substituição fundamentada de notas.</li>
              <li><strong>Conselho ASC e DPQ:</strong> 5 dias úteis cada para parecer técnico e homologação final.</li>
              <li><strong>Impugnações / Recursos:</strong> 15 dias corridos para despacho do Comando da Unidade.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
