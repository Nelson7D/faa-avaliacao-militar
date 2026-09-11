'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  ShieldAlert,
  Sliders,
  Database,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Save,
  Clock,
  KeyRound,
  FileSpreadsheet,
  Copy,
  PlusCircle,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import {
  fetchUsers,
  updateUserRole,
  fetchAuditLogs,
  SystemUserRecord,
  fetchConfiguracoesGeral,
  saveConfiguracoesGeral,
  fetchAtribuicoes,
  criarAtribuicaoAvaliacao,
  fetchMilitares,
} from '@/services/firebase/firestore';
import { AuditLogEntry } from '@/types/workflow';
import { AtribuicaoAvaliacao } from '@/types/avaliacao';
import { Militar } from '@/types/militar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<SystemUserRecord[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<AtribuicaoAvaliacao[]>([]);
  const [militaresList, setMilitaresList] = useState<Militar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [searchLog, setSearchLog] = useState('');
  const [searchAtribuicao, setSearchAtribuicao] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Form de Nova Atribuição
  const [showNovaAtribuicaoModal, setShowNovaAtribuicaoModal] = useState(false);
  const [selMilitarNip, setSelMilitarNip] = useState('');
  const [numAvaliadoresForm, setNumAvaliadoresForm] = useState<2 | 3>(3);
  const [aval1Nip, setAval1Nip] = useState('');
  const [aval2Nip, setAval2Nip] = useState('');
  const [cmdteNip, setCmdteNip] = useState('');
  const [criandoAtribuicao, setCriandoAtribuicao] = useState(false);

  // System parameters state
  const [anoInstrucao, setAnoInstrucao] = useState('2025/2026');
  const [prazoFai, setPrazoFai] = useState('30');
  const [prazoImpugnacao, setPrazoImpugnacao] = useState('15');
  const [travarSubmissoes, setTravarSubmissoes] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [usersData, logsData, configData, atribuicoesData, militaresData] = await Promise.all([
          fetchUsers(),
          fetchAuditLogs(),
          fetchConfiguracoesGeral(),
          fetchAtribuicoes(),
          fetchMilitares(),
        ]);
        setUsers(usersData);
        setLogs(logsData);
        setAtribuicoes(atribuicoesData);
        setMilitaresList(militaresData);
        if (configData) {
          setAnoInstrucao(configData.anoInstrucao || '2025/2026');
          setPrazoFai(configData.prazoFai || '30');
          setPrazoImpugnacao(configData.prazoImpugnacao || '15');
          setTravarSubmissoes(Boolean(configData.travarSubmissoes));
        }
      } catch (err) {
        console.error('Erro ao carregar dados de administração:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleCriarAtribuicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selMilitarNip || !aval1Nip) {
      alert('Selecione o militar avaliado e o 1º Avaliador.');
      return;
    }
    const milAvaliado = militaresList.find((m) => m.nip === selMilitarNip);
    if (!milAvaliado) {
      alert('Militar avaliado não encontrado.');
      return;
    }
    const aval1 = users.find((u) => u.nip === aval1Nip) || militaresList.find((m) => m.nip === aval1Nip);
    const aval2 = users.find((u) => u.nip === aval2Nip) || militaresList.find((m) => m.nip === aval2Nip);
    const cmdte = users.find((u) => u.nip === cmdteNip) || militaresList.find((m) => m.nip === cmdteNip);

    setCriandoAtribuicao(true);
    try {
      const nova = await criarAtribuicaoAvaliacao({
        anoInstrucao,
        militarAvaliadoNip: milAvaliado.nip,
        militarAvaliadoNome: milAvaliado.nomeCompleto,
        militarAvaliadoPosto: milAvaliado.posto,
        militarAvaliadoUnidade: milAvaliado.unidade,
        militarAvaliadoCategoria: milAvaliado.categoria,
        numeroAvaliadores: numAvaliadoresForm,
        ultimoAvaliador: numAvaliadoresForm === 2 ? 'avaliador2' : 'cmdte',
        avaliador1Nip: aval1?.nip || aval1Nip,
        avaliador1Nome: aval1?.nomeCompleto || aval1Nip,
        avaliador1Posto: aval1?.posto,
        avaliador2Nip: numAvaliadoresForm >= 2 ? (aval2?.nip || aval2Nip) : undefined,
        avaliador2Nome: numAvaliadoresForm >= 2 ? (aval2?.nomeCompleto || aval2Nip) : undefined,
        avaliador2Posto: numAvaliadoresForm >= 2 ? aval2?.posto : undefined,
        cmdteNip: numAvaliadoresForm === 3 ? (cmdte?.nip || cmdteNip) : undefined,
        cmdteNome: numAvaliadoresForm === 3 ? (cmdte?.nomeCompleto || cmdteNip) : undefined,
        cmdtePosto: numAvaliadoresForm === 3 ? cmdte?.posto : undefined,
        criadoPorNip: profile?.nip || '00000001',
        criadoPorNome: profile?.nomeCompleto || 'Chefe da DPQ',
      });
      setAtribuicoes((prev) => [nova, ...prev]);
      setShowNovaAtribuicaoModal(false);
      setSelMilitarNip('');
      setAval1Nip('');
      setAval2Nip('');
      setCmdteNip('');
      setStatusMessage('Atribuição regimental criada e Códigos de Acesso emitidos com sucesso!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      alert(`Erro ao criar atribuição: ${err.message || err}`);
    } finally {
      setCriandoAtribuicao(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: SystemUserRecord['role']) => {
    try {
      await updateUserRole(uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
      setStatusMessage(`Papel do utilizador atualizado para ${newRole}!`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveConfiguracoesGeral({
        anoInstrucao,
        prazoFai,
        prazoImpugnacao,
        travarSubmissoes,
      });
      setStatusMessage('Parâmetros regimentais guardados com sucesso no Cloud Firestore!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      setStatusMessage(`Erro ao gravar parâmetros: ${err.message || err}`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchUser.toLowerCase();
    return (
      u.nip?.toLowerCase().includes(term) ||
      u.nomeCompleto?.toLowerCase().includes(term) ||
      u.posto?.toLowerCase().includes(term) ||
      u.unidade?.toLowerCase().includes(term)
    );
  });

  const filteredLogs = logs.filter((l) => {
    const term = searchLog.toLowerCase();
    return (
      l.militarNip?.toLowerCase().includes(term) ||
      l.acao?.toLowerCase().includes(term) ||
      l.responsavel?.toLowerCase().includes(term) ||
      l.etapaPara?.toLowerCase().includes(term)
    );
  });

  const filteredAtribuicoes = atribuicoes.filter((a) => {
    const term = searchAtribuicao.toLowerCase();
    return (
      a.militarAvaliadoNip?.toLowerCase().includes(term) ||
      a.militarAvaliadoNome?.toLowerCase().includes(term) ||
      a.avaliador1Nome?.toLowerCase().includes(term) ||
      a.avaliador2Nome?.toLowerCase().includes(term) ||
      a.cmdteNome?.toLowerCase().includes(term) ||
      a.codigoAcessoAvaliador1?.toLowerCase().includes(term) ||
      a.codigoAcessoAvaliador2?.toLowerCase().includes(term) ||
      a.codigoAcessoCmdte?.toLowerCase().includes(term)
    );
  });

  if (profile?.role !== 'ADMIN' && profile?.role !== 'DPQ') {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-2xl shadow-card">
        <div className="inline-flex p-3 bg-amber-50 border border-amber-200 rounded-full text-[#B89047]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Acesso Reservado à Administração / DPQ</h2>
        <p className="text-xs text-slate-500">
          Este módulo de governação requer autenticação com papel de <strong>ADMIN</strong> ou <strong>DPQ</strong>.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F3323] hover:bg-[#184A34] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Iniciar Sessão como Administrador
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#B89047]" />
            Painel de Administração do Sistema FAA
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão global de utilizadores, atribuição de funções regimentais, auditoria de segurança e parâmetros.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-semibold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="atribuicoes" className="space-y-6">
        <TabsList className="bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto flex flex-wrap">
          <TabsTrigger value="atribuicoes" className="text-xs flex items-center gap-1.5 rounded-lg font-medium">
            <KeyRound className="w-3.5 h-3.5 text-[#B89047]" /> Atribuições & Códigos DPQ ({atribuicoes.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs flex items-center gap-1.5 rounded-lg font-medium">
            <Users className="w-3.5 h-3.5" /> Gestão de Utilizadores & Papéis ({users.length})
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs flex items-center gap-1.5 rounded-lg font-medium">
            <Clock className="w-3.5 h-3.5" /> Logs de Auditoria Geral ({logs.length})
          </TabsTrigger>
          <TabsTrigger value="params" className="text-xs flex items-center gap-1.5 rounded-lg font-medium">
            <Sliders className="w-3.5 h-3.5" /> Parâmetros Regimentais
          </TabsTrigger>
          <TabsTrigger value="infra" className="text-xs flex items-center gap-1.5 rounded-lg font-medium">
            <Database className="w-3.5 h-3.5" /> Estado da Infraestrutura Firebase
          </TabsTrigger>
        </TabsList>

        {/* TAB 0: ATRIBUIÇÕES & CÓDIGOS DE ACESSO (DPQ / RH) */}
        <TabsContent value="atribuicoes" className="space-y-4">
          <div className="executive-card rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Controlo de Atribuição de Avaliadores & Emissão de Códigos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cada avaliador acede exclusivamente aos avaliados que lhe forem atribuídos mediante código individual intransmissível.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchAtribuicao}
                    onChange={(e) => setSearchAtribuicao(e.target.value)}
                    placeholder="Buscar por NIP, Nome ou Código..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl font-mono text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  onClick={() => setShowNovaAtribuicaoModal(true)}
                  size="sm"
                  className="text-xs flex items-center gap-1.5 bg-[#0F3323] hover:bg-[#184A34] text-white whitespace-nowrap shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Nova Atribuição
                </Button>
              </div>
            </div>

            {/* Modal de Criação de Atribuição */}
            {showNovaAtribuicaoModal && (
              <div className="p-5 bg-slate-50 border border-slate-300/80 rounded-2xl space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#B89047]" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase">
                      Criar Atribuição de Avaliadores & Gerar Códigos Individuais
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowNovaAtribuicaoModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕ Cancelar
                  </button>
                </div>

                <form onSubmit={handleCriarAtribuicao} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Militar Avaliado */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Militar Avaliado *</label>
                      <select
                        required
                        value={selMilitarNip}
                        onChange={(e) => setSelMilitarNip(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Selecione o Militar...</option>
                        {militaresList.map((m) => (
                          <option key={m.nip} value={m.nip}>
                            {m.posto} {m.nomeCompleto} (NIP {m.nip})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Número de Avaliadores */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Processo Regimental *</label>
                      <select
                        value={numAvaliadoresForm}
                        onChange={(e) => setNumAvaliadoresForm(Number(e.target.value) as 2 | 3)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold focus:ring-2 focus:ring-primary/20"
                      >
                        <option value={2}>2 Avaliadores (2º Avaliador determina a Média)</option>
                        <option value={3}>3 Avaliadores (Comandante determina a Média)</option>
                      </select>
                    </div>

                    {/* 1º Avaliador */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">1º Avaliador (Atribui Notas F1-F16) *</label>
                      <select
                        required
                        value={aval1Nip}
                        onChange={(e) => setAval1Nip(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Selecione o 1º Avaliador...</option>
                        {militaresList.map((m) => (
                          <option key={m.nip} value={m.nip}>
                            {m.posto} {m.nomeCompleto} (NIP {m.nip})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2º Avaliador */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        2º Avaliador {numAvaliadoresForm === 2 ? '(Fecha a Média Final)' : '(Revisão Regimental)'} *
                      </label>
                      <select
                        required
                        value={aval2Nip}
                        onChange={(e) => setAval2Nip(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Selecione o 2º Avaliador...</option>
                        {militaresList.map((m) => (
                          <option key={m.nip} value={m.nip}>
                            {m.posto} {m.nomeCompleto} (NIP {m.nip})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Comandante (apenas se 3 avaliadores) */}
                    {numAvaliadoresForm === 3 && (
                      <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                        <label className="text-[11px] font-bold text-slate-700">
                          Comandante / Chefe U/E/O (Último Avaliador • Homologa e Fixa a Média Definitiva) *
                        </label>
                        <select
                          required
                          value={cmdteNip}
                          onChange={(e) => setCmdteNip(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Selecione o Comandante...</option>
                          {militaresList.map((m) => (
                            <option key={m.nip} value={m.nip}>
                              {m.posto} {m.nomeCompleto} (NIP {m.nip})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNovaAtribuicaoModal(false)}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={criandoAtribuicao}
                      className="text-xs bg-[#B89047] hover:bg-[#A37E3A] text-white shadow-xs"
                    >
                      {criandoAtribuicao ? 'A gerar códigos...' : 'Emitir Atribuição e Gerar Códigos'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabela de Atribuições */}
            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">Militar Avaliado</th>
                    <th className="p-3 text-center">Processo</th>
                    <th className="p-3">1º Avaliador (Código)</th>
                    <th className="p-3">2º Avaliador (Código)</th>
                    <th className="p-3">Comandante (Código)</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAtribuicoes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-mono text-xs">
                        Nenhuma atribuição de avaliação registada para este ano. Clique em "Nova Atribuição" para emitir os primeiros códigos individuais.
                      </td>
                    </tr>
                  ) : (
                    filteredAtribuicoes.map((atr) => (
                      <tr key={atr.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{atr.militarAvaliadoNome}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            NIP {atr.militarAvaliadoNip} • {atr.militarAvaliadoPosto} • {atr.militarAvaliadoUnidade}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {atr.numeroAvaliadores} Avaliadores
                          </Badge>
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            Fecha: {atr.numeroAvaliadores === 2 ? '2º Aval.' : 'Cmdte'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-800 font-medium">{atr.avaliador1Nome}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {atr.codigoAcessoAvaliador1}
                            </span>
                            <button
                              title="Copiar Código"
                              onClick={() => {
                                navigator.clipboard.writeText(atr.codigoAcessoAvaliador1);
                                setStatusMessage(`Código ${atr.codigoAcessoAvaliador1} copiado!`);
                                setTimeout(() => setStatusMessage(''), 2000);
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-500"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          {atr.avaliador2Nome ? (
                            <div>
                              <div className="text-slate-800 font-medium">{atr.avaliador2Nome}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                                  {atr.codigoAcessoAvaliador2}
                                </span>
                                <button
                                  title="Copiar Código"
                                  onClick={() => {
                                    if (atr.codigoAcessoAvaliador2) {
                                      navigator.clipboard.writeText(atr.codigoAcessoAvaliador2);
                                      setStatusMessage(`Código ${atr.codigoAcessoAvaliador2} copiado!`);
                                      setTimeout(() => setStatusMessage(''), 2000);
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          {atr.cmdteNome && atr.codigoAcessoCmdte ? (
                            <div>
                              <div className="text-slate-800 font-medium">{atr.cmdteNome}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-xs font-bold text-[#B89047] bg-[#B89047]/10 px-2 py-0.5 rounded border border-[#B89047]/20">
                                  {atr.codigoAcessoCmdte}
                                </span>
                                <button
                                  title="Copiar Código"
                                  onClick={() => {
                                    if (atr.codigoAcessoCmdte) {
                                      navigator.clipboard.writeText(atr.codigoAcessoCmdte);
                                      setStatusMessage(`Código ${atr.codigoAcessoCmdte} copiado!`);
                                      setTimeout(() => setStatusMessage(''), 2000);
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px] italic">Disp. (2 Avaliadores)</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {atr.faiId ? (
                            <Link href={`/fai/${atr.faiId}`}>
                              <Button size="sm" variant="outline" className="text-[11px] h-7 px-2">
                                Abrir FAI
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/fai/nova?atribuicaoId=${atr.id}&nip=${atr.militarAvaliadoNip}`}>
                              <Button size="sm" variant="gold" className="text-[11px] h-7 px-2">
                                Iniciar FAI
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 1: GESTÃO DE UTILIZADORES */}
        <TabsContent value="users" className="space-y-4">
          <div className="executive-card rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Efetivo Cadastrado no Sistema</h3>
                <p className="text-xs text-slate-500">
                  Defina o cargo de acesso regimental (Avaliador, Comandante, DPQ, Militar Avaliado ou Administrador).
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Filtrar por NIP, Nome ou Posto..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl font-mono text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3 font-mono">NIP Militar</th>
                    <th className="p-3">Militar & Posto</th>
                    <th className="p-3">Unidade / Estabelecimento</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Papel Regimental Atribuído</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{u.nip}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{u.nomeCompleto}</div>
                        <div className="text-[11px] text-slate-500">{u.posto} • {u.email}</div>
                      </td>
                      <td className="p-3 text-slate-600 truncate max-w-xs">{u.unidade}</td>
                      <td className="p-3 font-mono text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold">
                          {u.categoria}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as any)}
                          className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-2xs"
                        >
                          <option value="MILITAR_AVALIADO">Militar Avaliado (Sem poderes de avaliação)</option>
                          <option value="AVALIADOR_1">1º Avaliador (Lança F1-F16 e Bloco 05)</option>
                          <option value="AVALIADOR_2">2º Avaliador (Ratifica Bloco 06)</option>
                          <option value="CMDTE">Comandante de Unidade (Despacho Bloco 07)</option>
                          <option value="DPQ">Órgão de Pessoal DPQ (Homologação Bloco 11)</option>
                          <option value="ADMIN">Administrador Geral do Sistema</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LOGS DE AUDITORIA */}
        <TabsContent value="audit" className="space-y-4">
          <div className="executive-card rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registo Imutável de Auditoria (RLS)</h3>
                <p className="text-xs text-slate-500">
                  Rastreabilidade completa de todas as alterações de notas, despachos e acessos regimentais.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchLog}
                  onChange={(e) => setSearchLog(e.target.value)}
                  placeholder="Pesquisar em logs..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl font-mono text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3 font-mono">Data / Hora</th>
                    <th className="p-3">Ação Regimental</th>
                    <th className="p-3">Responsável</th>
                    <th className="p-3">Militar Alvo / NIP</th>
                    <th className="p-3">Etapa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('pt-AO')}
                      </td>
                      <td className="p-3 font-medium text-slate-900">{log.acao}</td>
                      <td className="p-3 font-semibold text-slate-800">{log.responsavel}</td>
                      <td className="p-3 font-mono text-slate-700">
                        {log.militarNip ? `NIP ${log.militarNip}` : '-'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {log.etapaPara}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: PARÂMETROS REGIMENTAIS */}
        <TabsContent value="params" className="space-y-4">
          <div className="executive-card rounded-2xl p-6 shadow-card space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configuração de Parâmetros e Prazos</h3>
              <p className="text-xs text-slate-500">
                Ajuste das diretrizes temporais regimentais do ciclo anual de avaliação.
              </p>
            </div>

            <form onSubmit={handleSaveParams} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Ano de Instrução Militar Ativo</label>
                <input
                  type="text"
                  value={anoInstrucao}
                  onChange={(e) => setAnoInstrucao(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Prazo de Tramitação da FAI (Dias)</label>
                  <input
                    type="number"
                    value={prazoFai}
                    onChange={(e) => setPrazoFai(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                  <p className="text-[10px] text-slate-400">Regra Oficial: 30 dias</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Prazo Legal de Impugnação (Dias)</label>
                  <input
                    type="number"
                    value={prazoImpugnacao}
                    onChange={(e) => setPrazoImpugnacao(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                  <p className="text-[10px] text-slate-400">Regra Oficial: 15 dias</p>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={travarSubmissoes}
                    onChange={(e) => setTravarSubmissoes(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Travar submissão de novas FAIs (Fecho do Ciclo Anual)
                  </span>
                </label>
              </div>

              <Button type="submit" className="text-xs flex items-center gap-1.5 shadow-xs">
                <Save className="w-3.5 h-3.5" /> Guardar Parâmetros
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* TAB 4: INFRAESTRUTURA FIREBASE */}
        <TabsContent value="infra" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="executive-card rounded-2xl p-6 shadow-card space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Google Cloud Firestore</h3>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Projeto ID:</span>
                  <strong className="font-mono text-slate-800">faa-avaliacao-militar</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Região Cloud:</span>
                  <strong className="font-mono text-slate-800">africa-south1 (África)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Modo de Operação:</span>
                  <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px]">
                    Nuvem em Tempo Real (Ativo)
                  </Badge>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Regras de Segurança (RLS):</span>
                  <strong className="text-emerald-700 font-semibold">Publicadas e Ativas</strong>
                </div>
              </div>
            </div>

            <div className="executive-card rounded-2xl p-6 shadow-card space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#B89047]" />
                <h3 className="text-sm font-bold text-slate-900">Firebase Authentication</h3>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Provedor Principal:</span>
                  <strong className="text-slate-800">Email & Senha / NIP Militar</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Controlo de Sessão:</span>
                  <strong className="text-slate-800">Token JWT & Role-Based Access</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total de Utilizadores Ativos:</span>
                  <strong className="font-mono text-primary text-sm">{users.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
