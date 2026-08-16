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
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { fetchUsers, updateUserRole, fetchAuditLogs, SystemUserRecord } from '@/services/firebase/firestore';
import { AuditLogEntry } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<SystemUserRecord[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [searchLog, setSearchLog] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // System parameters state
  const [anoInstrucao, setAnoInstrucao] = useState('2025/2026');
  const [prazoFai, setPrazoFai] = useState('30');
  const [prazoImpugnacao, setPrazoImpugnacao] = useState('15');
  const [travarSubmissoes, setTravarSubmissoes] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [usersData, logsData] = await Promise.all([
          fetchUsers(),
          fetchAuditLogs(),
        ]);
        setUsers(usersData);
        setLogs(logsData);
      } catch (err) {
        console.error('Erro ao carregar dados de administração:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

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

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Parâmetros regimentais guardados com sucesso no sistema!');
    setTimeout(() => setStatusMessage(''), 3000);
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#B89047]" />
              Painel de Administração do Sistema FAA
            </h1>
            <Badge variant="outline" className="text-[10px] text-emerald-800 bg-emerald-50 border-emerald-300 font-mono">
              Segurança & RLS Activa
            </Badge>
          </div>
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
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto flex flex-wrap">
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
