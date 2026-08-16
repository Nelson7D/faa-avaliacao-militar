'use client';

import React, { useState, useEffect } from 'react';
import { fetchImpugnacoes, saveImpugnacaoDocument, registrarAuditLog } from '@/services/firebase/firestore';
import { ImpugnacaoDocument } from '@/types/impugnacao';
import { formatNip, formatDataPt } from '@/lib/utils';
import {
  Scale,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  FileText,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function ImpugnacoesPage() {
  const [impugnacoes, setImpugnacoes] = useState<ImpugnacaoDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODAS' | 'RECLAMACAO' | 'RECURSO_HIERARQUICO'>('TODAS');

  // Commander Dispatch Form State
  const [decisaoCmdte, setDecisaoCmdte] = useState<'DEFERIDO_TOTAL' | 'DEFERIDO_PARCIAL' | 'INDEFERIDO'>('DEFERIDO_TOTAL');
  const [fundamentacaoCmdte, setFundamentacaoCmdte] = useState('');
  const [cmdteNome, setCmdteNome] = useState('General de Divisão J. Santos');
  const [cmdteNip, setCmdteNip] = useState('00192837');
  const [despachoSuccess, setDespachoSuccess] = useState('');

  const loadData = async () => {
    try {
      const data = await fetchImpugnacoes();
      setImpugnacoes(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar impugnações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCase = impugnacoes.find((i) => i.id === selectedId) || impugnacoes[0];

  const total = impugnacoes.length;
  const emPrazo = impugnacoes.filter((i) => i.status === 'EM_ANALISE' || i.status === 'AGUARDANDO_PARECER').length;
  const deferidas = impugnacoes.filter((i) => i.status === 'DEFERIDA' || i.status === 'RETIFICADA').length;
  const indeferidas = impugnacoes.filter((i) => i.status === 'INDEFERIDA').length;

  const filteredCases = impugnacoes.filter((i) => {
    const matchesSearch =
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.militarNip.includes(searchTerm) ||
      i.militar?.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filtroTipo === 'TODAS' || i.tipo === filtroTipo;
    return matchesSearch && matchesTipo;
  });

  const handleSubmeterDespacho = async () => {
    if (!selectedCase) return;

    let novoStatus: ImpugnacaoDocument['status'] = 'DEFERIDA';
    if (decisaoCmdte === 'INDEFERIDO') novoStatus = 'INDEFERIDA';
    else if (decisaoCmdte === 'DEFERIDO_PARCIAL') novoStatus = 'RETIFICADA';

    const updated: ImpugnacaoDocument = {
      ...selectedCase,
      status: novoStatus,
      despachoCmdte: {
        decisao: decisaoCmdte,
        fundamentacao: fundamentacaoCmdte || 'Despacho fundamentado emitido pelo Comando da U/E/O.',
        cmdteNip,
        cmdteNome,
        data: new Date().toISOString().split('T')[0],
        alterouNotas: decisaoCmdte !== 'INDEFERIDO',
      },
      updatedAt: new Date().toISOString(),
    };

    await saveImpugnacaoDocument(updated);

    await registrarAuditLog({
      operadorNip: cmdteNip,
      operadorNome: cmdteNome,
      operadorPosto: 'General de Divisão',
      acao: `DESPACHO_IMPUGNACAO_${decisaoCmdte}`,
      entidade: 'IMPUGNACAO',
      entidadeId: selectedCase.id,
      detalhes: {
        faiId: selectedCase.faiId,
        militarNip: selectedCase.militarNip,
        decisao: decisaoCmdte,
      },
    });

    setDespachoSuccess('Despacho militar assinado e registrado com sucesso!');
    setTimeout(() => setDespachoSuccess(''), 3000);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Módulo de Impugnações & Recursos Hierárquicos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão regimental de contestações de notas, fundamentações e despachos de comando (Prazo Legal de 15 Dias)
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="executive-card rounded-2xl p-5 flex flex-col justify-between h-28 shadow-card">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total de Processos</span>
            <Scale className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-data-mono text-3xl font-bold text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-400 font-mono">100% dos registos</div>
        </div>

        <div className="executive-card rounded-2xl p-5 flex flex-col justify-between h-28 shadow-card border-l-4 border-l-[#B89047]">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Em Prazo (15 Dias)</span>
            <Clock className="w-4 h-4 text-[#B89047]" />
          </div>
          <div className="font-data-mono text-3xl font-bold text-[#B89047]">{emPrazo}</div>
          <div className="text-[11px] text-amber-800 font-medium font-mono">Em análise regimental</div>
        </div>

        <div className="executive-card rounded-2xl p-5 flex flex-col justify-between h-28 shadow-card border-l-4 border-l-emerald-600">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Deferidas / Retificadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-data-mono text-3xl font-bold text-emerald-700">{deferidas}</div>
          <div className="text-[11px] text-emerald-700 font-mono font-medium">Notas ajustadas</div>
        </div>

        <div className="executive-card rounded-2xl p-5 flex flex-col justify-between h-28 shadow-card border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Indeferidas</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-data-mono text-3xl font-bold text-rose-600">{indeferidas}</div>
          <div className="text-[11px] text-rose-600 font-mono font-medium">Mantida a nota original</div>
        </div>
      </div>

      {despachoSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-semibold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{despachoSuccess}</span>
        </div>
      )}

      {/* Split View Container */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* Left Panel: Case List */}
        <div className="w-full lg:w-1/3 executive-card rounded-2xl flex flex-col overflow-hidden shadow-card">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por NIP, ID ou Nome..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-data-mono bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-[11px]">
              <button
                onClick={() => setFiltroTipo('TODAS')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  filtroTipo === 'TODAS' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroTipo('RECLAMACAO')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  filtroTipo === 'RECLAMACAO' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Reclamações
              </button>
              <button
                onClick={() => setFiltroTipo('RECURSO_HIERARQUICO')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  filtroTipo === 'RECURSO_HIERARQUICO' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Recursos
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[520px]">
            {filteredCases.map((item) => {
              const isSelected = item.id === selectedCase?.id;
              const isAtivo = item.status === 'EM_ANALISE' || item.status === 'AGUARDANDO_PARECER';

              let badgeVariant: any = 'fav';
              if (item.status === 'DEFERIDA') badgeVariant = 'sigFav';
              else if (item.status === 'INDEFERIDA') badgeVariant = 'desfav';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-data-mono text-xs font-bold text-slate-900">{item.id}</span>
                    <Badge variant={badgeVariant} className="text-[9.5px]">
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {item.militar ? `${item.militar.posto} ${item.militar.nomeCompleto}` : item.militarNip}
                  </div>
                  <div className="font-data-mono text-[11px] text-slate-500 font-medium mt-0.5">
                    NIP {formatNip(item.militarNip)}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {item.motivoGeral}
                  </p>

                  {isAtivo && (
                    <div className="mt-2 flex items-center text-[10.5px] text-amber-900 font-medium bg-amber-50 px-2.5 py-0.5 rounded-full w-fit border border-amber-200 font-mono">
                      <Clock className="w-3 h-3 mr-1 text-[#B89047]" />
                      Faltam {item.diasRestantes} dias de prazo
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Selected Case Detail & Comparison */}
        {selectedCase ? (
          <div className="w-full lg:w-2/3 executive-card rounded-2xl flex flex-col overflow-hidden shadow-card">
            {/* Header of Active Case */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-mono">{selectedCase.id}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {selectedCase.tipo === 'RECLAMACAO' ? 'Reclamação ao Comandante' : 'Recurso Hierárquico'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Militar: <strong className="text-slate-900 font-semibold">{selectedCase.militar?.posto} {selectedCase.militar?.nomeCompleto}</strong> (NIP {formatNip(selectedCase.militarNip)})
                </p>
              </div>

              <div className="text-right text-xs font-mono text-slate-500">
                <span>Submetido em: {formatDataPt(selectedCase.dataSubmissao)}</span>
                <div className="text-primary font-semibold mt-0.5">FAI: {selectedCase.faiId}</div>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Motivo Geral */}
              <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-slate-700 uppercase text-[10.5px] block">Fundamentação do Requerente:</span>
                <p className="text-slate-800 leading-relaxed italic">{selectedCase.motivoGeral}</p>
              </div>

              {/* Side-by-Side Comparison Grid: Original vs Requerida */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#B89047]" />
                  Painel Comparativo de Notas (Original vs Contestada)
                </h4>

                <div className="rounded-xl border border-slate-200/80 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-mono w-20">ID Fator</TableHead>
                        <TableHead>Fator Regimental</TableHead>
                        <TableHead className="font-mono text-center w-28">Nota Original</TableHead>
                        <TableHead className="font-mono text-center w-28">Nota Requerida</TableHead>
                        <TableHead>Justificação Detalhada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCase.fatoresContestados.map((fc) => (
                        <TableRow key={fc.fatorId}>
                          <TableCell className="font-data-mono font-bold text-slate-900">{fc.fatorId}</TableCell>
                          <TableCell className="font-semibold text-slate-800">{fc.fatorNome}</TableCell>
                          <TableCell className="text-center font-data-mono font-bold text-rose-700 bg-rose-50/30">
                            {fc.notaOriginal} pts
                          </TableCell>
                          <TableCell className="text-center font-data-mono font-bold text-emerald-800 bg-emerald-50/30">
                            {fc.notaRequerida} pts
                          </TableCell>
                          <TableCell className="text-slate-600 text-[11px] leading-snug">
                            {fc.fundamentacaoRequerente}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Commander Dispatch Form */}
              <div className="rounded-2xl border border-slate-200/80 p-5 bg-slate-50/50 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
                  <ShieldCheck className="w-4 h-4 text-[#B89047]" />
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-tight">
                    Despacho e Decisão do Comandante da U/E/O
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    <input
                      type="radio"
                      name="decisao_cmdte"
                      checked={decisaoCmdte === 'DEFERIDO_TOTAL'}
                      onChange={() => setDecisaoCmdte('DEFERIDO_TOTAL')}
                      className="accent-emerald-700"
                    />
                    <span className="text-emerald-900 font-semibold">Deferir Totalmente</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    <input
                      type="radio"
                      name="decisao_cmdte"
                      checked={decisaoCmdte === 'DEFERIDO_PARCIAL'}
                      onChange={() => setDecisaoCmdte('DEFERIDO_PARCIAL')}
                      className="accent-[#B89047]"
                    />
                    <span className="text-amber-900 font-semibold">Deferir Parcialmente</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    <input
                      type="radio"
                      name="decisao_cmdte"
                      checked={decisaoCmdte === 'INDEFERIDO'}
                      onChange={() => setDecisaoCmdte('INDEFERIDO')}
                      className="accent-rose-600"
                    />
                    <span className="text-rose-900 font-semibold">Indeferir</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Fundamentação do Despacho de Comando
                  </label>
                  <Textarea
                    value={fundamentacaoCmdte}
                    onChange={(e) => setFundamentacaoCmdte(e.target.value)}
                    placeholder="Insira os fundamentos regimentais da decisão..."
                    className="text-xs bg-white border-slate-200 rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Comandante Responsável
                    </label>
                    <Input
                      value={cmdteNome}
                      onChange={(e) => setCmdteNome(e.target.value)}
                      className="text-xs bg-white border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      NIP do Comandante
                    </label>
                    <Input
                      value={cmdteNip}
                      onChange={(e) => setCmdteNip(e.target.value)}
                      mono
                      className="text-xs bg-white border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSubmeterDespacho}
                    className="text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Assinar e Emitir Despacho Oficial
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
