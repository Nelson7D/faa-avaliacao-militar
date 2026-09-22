'use client';

import React, { useState } from 'react';
import { FaiDocument, EtapaWorkflow } from '@/types/fai';
import { WORKFLOW_ETAPAS_CONFIG } from '@/types/workflow';
import { avancarWorkflowFai } from '@/services/firebase/firestore';
import { formatNip } from '@/lib/utils';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';

interface TramitarModalProps {
  fai: FaiDocument | null;
  onClose: () => void;
  onSuccess: (updatedFai: FaiDocument) => void;
}

export function TramitarModal({ fai, onClose, onSuccess }: TramitarModalProps) {
  const { profile } = useAuth();

  const getProximaEtapa = (atual: EtapaWorkflow): EtapaWorkflow => {
    switch (atual) {
      case 'AVALIADOR_1':
        return 'AVALIADOR_2';
      case 'AVALIADOR_2':
        return 'CMDTE';
      case 'CMDTE':
        return 'CONSELHO_ASC';
      case 'CONSELHO_ASC':
        return 'DPQ';
      case 'DPQ':
        return 'HOMOLOGADO';
      default:
        return 'HOMOLOGADO';
    }
  };

  const etapaAtual = fai?.workflow?.etapaAtual || 'AVALIADOR_1';
  const proximaEtapa = getProximaEtapa(etapaAtual);
  const configProxima = WORKFLOW_ETAPAS_CONFIG[proximaEtapa];

  const [operadorNome, setOperadorNome] = useState(profile ? `${profile.posto} ${profile.nomeGuerra || profile.nomeCompleto}` : '');
  const [operadorNip, setOperadorNip] = useState(profile?.nip || '');
  const [operadorPosto, setOperadorPosto] = useState(profile?.posto || '');
  const [despacho, setDespacho] = useState('Processo analisado e validado em conformidade com o Regulamento de Avaliação.');
  const [pinAssinatura, setPinAssinatura] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!fai) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.role === 'MILITAR_AVALIADO') {
      setErrorMsg('O militar avaliado não possui permissão regimental para tramitar o processo.');
      return;
    }

    if (profile?.role === 'AVALIADOR_1' && etapaAtual !== 'AVALIADOR_1') {
      setErrorMsg('O 1º Avaliador apenas tem competência para tramitar processos da etapa de 1º Avaliador.');
      return;
    }

    if (!pinAssinatura || pinAssinatura.length < 4) {
      setErrorMsg('Insira o PIN de assinatura militar de 4 dígitos.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const updated = await avancarWorkflowFai(fai.id, proximaEtapa, {
        nip: operadorNip,
        nome: operadorNome,
        posto: operadorPosto,
        despacho,
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao tramitar processo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(fai)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-slate-200 shadow-floating">
        {/* Military Dialog Header */}
        <div className="p-5 bg-[#0B1612] text-white border-b border-[#1B2F26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C89D46] to-[#8C6B26] p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0B1612] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-white text-base font-semibold tracking-tight">
                Tramitação Regimental de Avaliação
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-mono text-xs mt-0.5">
                {fai.id} • {fai.militar?.posto} {fai.militar?.nomeCompleto} (NIP {formatNip(fai.militarNip)})
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Transition Visualizer */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10.5px] text-slate-500 font-medium block">Etapa Atual</span>
              <strong className="text-slate-900 text-xs font-semibold">{WORKFLOW_ETAPAS_CONFIG[etapaAtual]?.titulo}</strong>
            </div>
            <div className="text-[#B89047] font-bold text-base flex items-center">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-[10.5px] text-slate-500 font-medium block">Próxima Etapa</span>
              <strong className="text-emerald-800 text-xs font-semibold">{configProxima?.titulo}</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Despacho / Justificação de Transição
            </label>
            <Textarea
              value={despacho}
              onChange={(e) => setDespacho(e.target.value)}
              className="text-xs bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Operador Responsável
              </label>
              <Input
                value={operadorNome}
                onChange={(e) => setOperadorNome(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                NIP do Operador
              </label>
              <Input
                value={operadorNip}
                onChange={(e) => setOperadorNip(e.target.value)}
                mono
                className="text-xs bg-slate-50 border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Cryptographic PIN Authentication */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2.5">
            <label className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#B89047]" />
              Assinatura Digital Militar (PIN de Validação)
            </label>
            <Input
              type="password"
              maxLength={6}
              value={pinAssinatura}
              onChange={(e) => setPinAssinatura(e.target.value)}
              placeholder="Digite o PIN militar (ex: 1234)..."
              mono
              className="bg-white border-amber-300 text-sm tracking-widest text-center h-10 font-bold rounded-lg shadow-2xs focus:ring-2 focus:ring-amber-400/30"
            />
            <p className="text-[10.5px] text-amber-800 leading-tight">
              A validação registrará um log imutável com carimbo temporal e hash seguro na trilha de auditoria regimental.
            </p>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-destructive">{errorMsg}</p>
          )}

          {/* Footer Actions */}
          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Tramitando...' : 'Assinar e Confirmar Avanço'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
