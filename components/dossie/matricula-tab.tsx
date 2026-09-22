'use client';

import React, { useState } from 'react';
import { Militar } from '@/types/militar';
import { Lock, Edit3, Save, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatDataPt, formatNip } from '@/lib/utils';
import { saveMilitarData } from '@/services/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';

interface MatriculaTabProps {
  militar: Militar;
  onMilitarUpdated: (m: Militar) => void;
}

export function MatriculaTab({ militar, onMilitarUpdated }: MatriculaTabProps) {
  const { profile } = useAuth();
  const canEditMatricula = profile?.role === 'DPQ' || profile?.role === 'ADMIN';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Militar>({ ...militar });
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = async () => {
    const updated = await saveMilitarData(formData);
    onMilitarUpdated(updated);
    setIsEditing(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      {savedMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-semibold flex items-center gap-2 shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>Folha de Matrícula atualizada com sucesso!</span>
        </div>
      )}

      {/* 1. Dados Fixos a Tinta (ReadOnly) */}
      <div className="executive-card rounded-2xl overflow-hidden shadow-card">
        <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/60">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
                Registos Fixos de Matrícula (Protegidos / Inalteráveis)
              </h3>
              <p className="text-[11px] text-slate-500">
                Campos bloqueados e auditados conforme regulamento de pessoal das FAA
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
            Registo Permanente
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl">
            <span className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Data de Nascimento
            </span>
            <span className="font-data-mono font-bold text-slate-900 text-sm">
              {formatDataPt(militar.dataNascimento)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl">
            <span className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Naturalidade / Província
            </span>
            <span className="font-semibold text-slate-900 text-sm">{militar.naturalidade}</span>
          </div>

          <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl">
            <span className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Bilhete de Identidade (BI)
            </span>
            <span className="font-data-mono font-bold text-slate-900 text-sm">{militar.bi}</span>
          </div>

          <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl sm:col-span-2">
            <span className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Filiação (Pai e Mãe)
            </span>
            <span className="font-semibold text-slate-900">{militar.filiacao}</span>
          </div>

          <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl">
            <span className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Data de Incorporação / Ingresso
            </span>
            <span className="font-data-mono font-bold text-primary text-sm">
              {formatDataPt(militar.dataIngresso)} <span className="text-xs text-slate-500 font-normal font-sans">({militar.tempoServicoAnos} anos)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Dados Complementares (Editáveis) */}
      <div className="executive-card rounded-2xl overflow-hidden shadow-card">
        <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B89047] flex items-center justify-center border border-amber-200/60">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
                Dados Complementares e Qualificações (Editáveis)
              </h3>
              <p className="text-[11px] text-slate-500">
                Informações atualizáveis mediante aprovação do Órgão de Pessoal
              </p>
            </div>
          </div>

          {canEditMatricula ? (
            !isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Editar Dados
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFormData({ ...militar });
                    setIsEditing(false);
                  }}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSave}
                  className="text-xs flex items-center gap-1 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar Alterações
                </Button>
              </div>
            )
          ) : (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
              Gestão Exclusiva: Órgão de Pessoal (DPQ)
            </span>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Habilitações Literárias / Cursos Militares
            </label>
            {isEditing ? (
              <Input
                value={formData.habilitacoesLiterarias || ''}
                onChange={(e) => setFormData({ ...formData, habilitacoesLiterarias: e.target.value })}
                className="text-xs bg-slate-50 focus:bg-white"
              />
            ) : (
              <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl font-medium text-slate-800">
                {militar.habilitacoesLiterarias}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Estado Civil
            </label>
            {isEditing ? (
              <select
                value={formData.estadoCivil || 'Casado'}
                onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                <option value="Solteiro">Solteiro(a)</option>
                <option value="Casado">Casado(a)</option>
                <option value="Divorciado">Divorciado(a)</option>
                <option value="Viúvo">Viúvo(a)</option>
              </select>
            ) : (
              <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl font-medium text-slate-800">
                {militar.estadoCivil}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Idiomas e Nível Linguístico
            </label>
            {isEditing ? (
              <Input
                value={formData.idiomas || ''}
                onChange={(e) => setFormData({ ...formData, idiomas: e.target.value })}
                className="text-xs bg-slate-50 focus:bg-white"
              />
            ) : (
              <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl font-medium text-slate-800">
                {militar.idiomas}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Morada Atual / Residência
            </label>
            {isEditing ? (
              <Input
                value={formData.morada || ''}
                onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                className="text-xs bg-slate-50 focus:bg-white"
              />
            ) : (
              <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl font-medium text-slate-800">
                {militar.morada}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10.5px] uppercase font-medium text-slate-500 block mb-1">
              Contacto Telefónico
            </label>
            {isEditing ? (
              <Input
                value={formData.contacto || ''}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                mono
                className="text-xs bg-slate-50 focus:bg-white"
              />
            ) : (
              <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl font-mono font-medium text-slate-800">
                {militar.contacto}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
