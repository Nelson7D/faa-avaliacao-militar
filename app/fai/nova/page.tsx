'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  ShieldAlert,
  Search,
  Users,
  Award,
  Clock,
  Sparkles,
  ArrowLeft,
  Building,
} from 'lucide-react';
import {
  fetchMilitares,
  saveFaiDocument,
  fetchMilitarByNip,
  registrarAuditLog,
  fetchAtribuicaoById,
  vincularFaiAtribuicao,
  fetchFais,
} from '@/services/firebase/firestore';
import { Militar } from '@/types/militar';
import { FaiDocument, FaiBloco03Grelha } from '@/types/fai';
import { calcularMediaRegimental } from '@/lib/calculo-fai';
import { FaiHeaderStepper } from '@/components/fai/fai-header-stepper';
import { Bloco01Identificacao } from '@/components/fai/bloco-01-identificacao';
import { Bloco02Periodo } from '@/components/fai/bloco-02-periodo';
import { Bloco03Grelha } from '@/components/fai/bloco-03-grelha';
import { Bloco04Classificacao } from '@/components/fai/bloco-04-classificacao';
import { Blocos05a09Pareceres } from '@/components/fai/blocos-05-09-pareceres';
import { Bloco10Preferencias } from '@/components/fai/bloco-10-preferencias';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { canAvaliarMilitar } from '@/lib/hierarchy';
import { cn, formatNip } from '@/lib/utils';

export default function NovaFaiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const [militaresElegiveis, setMilitaresElegiveis] = useState<Militar[]>([]);
  const [faisExistentes, setFaisExistentes] = useState<FaiDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros da tela de acolhimento de subordinados
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<'TODAS' | 'OFICIAL' | 'SARGENTO' | 'PRACA'>('TODAS');

  // Militar Selecionado para Avaliação
  const [subordinadoSelecionado, setSubordinadoSelecionado] = useState<Militar | null>(null);
  const [selectedMilitar, setSelectedMilitar] = useState<Partial<Militar>>({
    nip: '',
    nomeCompleto: '',
    nomeGuerra: '',
    posto: 'Tenente',
    categoria: 'OFICIAL',
    unidade: '',
    funcaoDesempenhada: '',
    asc: 'Infantaria',
    qe: 'QP',
    tempoServicoAnos: 5,
    feridoEmServico: false,
  });

  const [activeStep, setActiveStep] = useState(1);
  const [anoInstrucao, setAnoInstrucao] = useState('2025/2026');
  const [periodoInicio, setPeriodoInicio] = useState('2025-01-01');
  const [periodoFim, setPeriodoFim] = useState('2025-12-31');
  const [tipo, setTipo] = useState<'PERIODICA' | 'EXTRAORDINARIA'>('PERIODICA');
  const [numeroAvaliadores, setNumeroAvaliadores] = useState<2 | 3>(3);
  const [atribuicaoId, setAtribuicaoId] = useState<string | undefined>();
  const [observacoes, setObservacoes] = useState('');

  // Grelha Inicial
  const [grelha, setGrelha] = useState<FaiBloco03Grelha>(() => {
    const initial: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      initial[`F${i}`] = { avaliador1: 15 };
    }
    return initial;
  });

  const [preferencias, setPreferencias] = useState<FaiDocument['preferenciasEmprego']>({
    comando: { op1: true },
    estado_maior: { op2: true },
    ensino: { op3: true },
  });

  const [pareceres, setPareceres] = useState<FaiDocument['pareceres']>({
    avaliador1: {
      texto: 'Militar cumpre com zelo e disciplina as missões e diretrizes atribuídas.',
      nip: profile?.nip || '',
      nome: profile ? `${profile.posto} ${profile.nomeGuerra || profile.nomeCompleto}` : '',
      posto: profile?.posto || '',
      data: new Date().toISOString().split('T')[0],
      assinado: true,
    },
  });

  useEffect(() => {
    async function load() {
      try {
        const [dataMilitares, dataFais] = await Promise.all([fetchMilitares(), fetchFais()]);
        setFaisExistentes(dataFais);

        // Princípio da Hierarquia: Apenas militares subordinados elegíveis para este avaliador (Oficiais, Sargentos e Praças)
        const elegiveis = dataMilitares.filter((m) => canAvaliarMilitar(profile, m));
        setMilitaresElegiveis(elegiveis);

        const atrIdParam = searchParams?.get('atribuicaoId');
        const nipParam = searchParams?.get('nip');

        if (atrIdParam) {
          setAtribuicaoId(atrIdParam);
          const atr = await fetchAtribuicaoById(atrIdParam);
          if (atr) {
            setNumeroAvaliadores(atr.numeroAvaliadores);
            const mil = dataMilitares.find((m) => m.nip === atr.militarAvaliadoNip);
            if (mil) {
              if (!canAvaliarMilitar(profile, mil)) {
                alert(`Regulamento Militar FAA: Não possui autorização hierárquica/regimental para avaliar ${mil.nomeCompleto}.`);
              } else {
                selecionarMilitarParaAvaliar(mil);
                return;
              }
            }
          }
        }

        if (nipParam) {
          const mil = dataMilitares.find((m) => m.nip === nipParam);
          if (mil) {
            if (!canAvaliarMilitar(profile, mil)) {
              alert(`Regulamento Militar FAA: Não possui autorização hierárquica/regimental para avaliar ${mil.nomeCompleto}.`);
            } else {
              selecionarMilitarParaAvaliar(mil);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar militares elegíveis:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams, profile]);

  const selecionarMilitarParaAvaliar = (m: Militar) => {
    setSubordinadoSelecionado(m);
    setSelectedMilitar(m);
    setActiveStep(1);
  };

  const voltarParaListaSubordinados = () => {
    setSubordinadoSelecionado(null);
  };

  const handleSearchNip = async (nip: string) => {
    const found = await fetchMilitarByNip(nip);
    if (found) {
      if (!canAvaliarMilitar(profile, found)) {
        alert(`Regulamento Militar FAA: Não possui autorização hierárquica ou regimental para avaliar ${found.nomeCompleto}.`);
        return;
      }
      selecionarMilitarParaAvaliar(found);
    } else {
      alert(`Militar com NIP ${nip} não encontrado.`);
    }
  };

  // Categoria dinâmica baseada no militar selecionado
  const categoriaEfetiva = selectedMilitar.categoria || 'OFICIAL';
  const resultadoCalculo = calcularMediaRegimental(
    categoriaEfetiva,
    grelha,
    {
      avaliadorAtivo: 'efetivo',
      feridoEmCombate: Boolean(selectedMilitar.feridoEmServico),
      numeroAvaliadores,
    }
  );

  const handleCreateFai = async () => {
    if (!selectedMilitar.nip) {
      alert('Selecione um militar cadastrado antes de submeter a FAI.');
      return;
    }

    const newId = `FAI-${anoInstrucao.split('/')[0]}-${selectedMilitar.nip}`;
    const newFai: FaiDocument = {
      id: newId,
      militarNip: selectedMilitar.nip,
      militar: selectedMilitar as Militar,
      anoInstrucao,
      periodoInicio,
      periodoFim,
      tipo,
      numeroAvaliadores,
      ultimoAvaliador: numeroAvaliadores === 2 ? 'avaliador2' : 'cmdte',
      mediaCalculadaPor: numeroAvaliadores === 2 ? 'avaliador2' : 'cmdte',
      atribuicaoId,
      observacoesBloco02: observacoes,
      grelha,
      mediaPonderada: resultadoCalculo.MP,
      divisor: resultadoCalculo.divisor,
      classificacao: resultadoCalculo.classificacao,
      pareceres,
      preferenciasEmprego: preferencias,
      workflow: {
        etapaAtual: 'AVALIADOR_1',
        diasNaEtapa: 0,
        prazoLimiteEtapa: 10,
        atrasado: false,
        dataEntradaEtapa: new Date().toISOString().split('T')[0],
        historico: [
          {
            etapa: 'AVALIADOR_1',
            dataTransicao: new Date().toISOString(),
            responsavelNip: profile?.nip || 'SISTEMA',
            responsavelNome: profile ? `${profile.posto} ${profile.nomeGuerra || profile.nomeCompleto}` : '1º Avaliador',
            despacho: 'Abertura da FAI Digital e Atribuição de Notas Iniciais',
          },
        ],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveFaiDocument(newFai);
    if (atribuicaoId) {
      await vincularFaiAtribuicao(atribuicaoId, newId);
    }

    await registrarAuditLog({
      operadorNip: profile?.nip || 'SISTEMA',
      operadorNome: profile ? `${profile.posto} ${profile.nomeGuerra || profile.nomeCompleto}` : 'Sistema FAI',
      operadorPosto: profile?.posto || 'Oficial',
      acao: 'CRIACAO_FAI',
      entidade: 'FAI',
      entidadeId: newId,
      detalhes: {
        militarNip: selectedMilitar.nip,
        categoria: categoriaEfetiva,
        mediaInicial: resultadoCalculo.MP,
        classificacaoInicial: resultadoCalculo.classificacao,
      },
    });

    router.push(`/fai/${newId}`);
  };

  // Filtragem dos subordinados na tela de acolhimento
  const subordinadosFiltrados = militaresElegiveis.filter((m) => {
    const term = termoBusca.toLowerCase().trim();
    const matchTerm =
      !term ||
      m.nomeCompleto.toLowerCase().includes(term) ||
      m.nip.toLowerCase().includes(term) ||
      m.posto.toLowerCase().includes(term) ||
      (m.asc && m.asc.toLowerCase().includes(term));

    const matchCat = categoriaFiltro === 'TODAS' || m.categoria === categoriaFiltro;
    return matchTerm && matchCat;
  });

  // =========================================================================
  // ETAPA 0: ECRÃ DE ACOLHIMENTO E SELEÇÃO DE SUBORDINADOS PARA AVALIAÇÃO
  // =========================================================================
  if (!subordinadoSelecionado) {
    return (
      <div className="space-y-6 pb-20">
        {/* Banner do Comando */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#758652]/20">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 border border-[#758652]/40 rounded-xl bg-[rgba(18,25,16,0.85)] hover:bg-[rgba(24,34,21,0.95)] text-[#D4AF37] transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 uppercase tracking-tight">
                  Subordinados Autorizados para Avaliação
                </h1>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#0F3323] text-[#D4AF37] border border-[#D4AF37]/30">
                  {subordinadosFiltrados.length} Elegíveis
                </span>
              </div>
              <p className="text-xs text-[#9EAF94] mt-0.5">
                Relação dos militares atribuídos sob sua cadeia hierárquica • Selecione o subordinado para abrir ou iniciar a ficha FAI
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca Tática */}
        <div className="bg-[rgba(24,34,21,0.72)] backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA39A]" />
            <input
              type="text"
              placeholder="Buscar por nome, NIP, posto ou especialidade..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-[#758652]/40 rounded-xl bg-[rgba(12,18,11,0.85)] text-slate-100 placeholder:text-[#6C7D63] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['TODAS', 'OFICIAL', 'SARGENTO', 'PRACA'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaFiltro(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer',
                  categoriaFiltro === cat
                    ? 'bg-[#13281B] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
                    : 'bg-[rgba(16,24,15,0.7)] text-[#9EAF94] border border-[#758652]/30 hover:text-white'
                )}
              >
                {cat === 'TODAS'
                  ? 'Todos'
                  : cat === 'OFICIAL'
                  ? 'Oficiais'
                  : cat === 'SARGENTO'
                  ? 'Sargentos'
                  : 'Praças'}
              </button>
            ))}
          </div>
        </div>

        {/* Alerta Institucional da DPQ */}
        {profile?.role === 'DPQ' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-2 text-amber-900">
              <ShieldAlert className="w-4 h-4 text-[#B89047]" />
              <span>Gestão Central: Chefe do Pessoal e Quadro (PQ)</span>
            </div>
            <p className="leading-relaxed">
              O Chefe do Pessoal e Quadro é responsável pela gestão e cadastro geral do efetivo. A avaliação individual destina-se apenas a militares da sua própria secção sob sua subordinação direta.
            </p>
          </div>
        )}

        {/* Grelha / Lista de Subordinados Disponíveis */}
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-slate-400 animate-pulse">
            Carregando relação de subordinados autorizados...
          </div>
        ) : subordinadosFiltrados.length === 0 ? (
          <div className="bg-[rgba(24,34,21,0.5)] border border-white/[0.08] rounded-2xl p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-[#758652] mx-auto" />
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono">
              Nenhum subordinado encontrado
            </h3>
            <p className="text-xs text-[#9EAF94] max-w-md mx-auto">
              Não foram encontrados militares sob sua responsabilidade funcional para este filtro. Verifique com a Repartição de Pessoal e Quadros (DPQ).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subordinadosFiltrados.map((militar) => {
              const faiExistente = faisExistentes.find((f) => f.militarNip === militar.nip);
              const isOficial = militar.categoria === 'OFICIAL';
              const isSargento = militar.categoria === 'SARGENTO';

              return (
                <div
                  key={militar.nip}
                  className="bg-[rgba(24,34,21,0.75)] backdrop-blur-xl border border-white/[0.08] hover:border-[#D4AF37]/50 rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0F3323] to-[#1E523A] text-[#D4AF37] flex items-center justify-center font-bold font-mono text-sm border border-[#D4AF37]/30 shadow-xs">
                          {militar.posto.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={cn(
                                'text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border uppercase',
                                isOficial
                                  ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                                  : isSargento
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              )}
                            >
                              {militar.categoria}
                            </span>
                            <span className="text-xs font-mono text-[#D4AF37] font-bold">
                              {militar.posto}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-slate-100 mt-1 group-hover:text-[#D4AF37] transition-colors leading-tight">
                            {militar.nomeCompleto}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Metadados Cadastrais Inseridos pelo Chefe do PQ */}
                    <div className="p-3 bg-[rgba(12,18,11,0.85)] border border-[#758652]/30 rounded-xl space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-[#8FA39A]">NIP:</span>
                        <span className="font-bold text-slate-100">{formatNip(militar.nip)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-[#8FA39A]">Especialidade:</span>
                        <span className="font-bold text-[#D4AF37] truncate max-w-[170px] text-right">
                          {militar.asc || 'Infantaria'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-[#8FA39A]">Tipo de Quadro:</span>
                        <span className="font-bold text-slate-100">
                          {militar.qe === 'QC' ? 'Quadro por Contrato (QC)' : 'Quadro Permanente (QP)'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-[#8FA39A]">Tempo de Serviço:</span>
                        <span className="font-bold text-slate-100">
                          {militar.tempoServicoAnos || 0} anos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ação de Abertura da FAI */}
                  <div className="pt-2 border-t border-white/[0.08] flex justify-between items-center">
                    <div>
                      {faiExistente ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                          FAI em Curso ({faiExistente.workflow?.etapaAtual})
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          Sem FAI aberta no ano
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => selecionarMilitarParaAvaliar(militar)}
                      className="bg-[#13281B] hover:bg-[#1A3826] border border-[#758652]/80 text-[#D4AF37] hover:text-[#FDE68A] font-bold text-xs h-8 px-3 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{faiExistente ? 'Continuar' : 'Avaliar'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // ETAPA 1+: FICHA DE AVALIAÇÃO INDIVIDUAL DO MILITAR SELECIONADO
  // =========================================================================
  return (
    <div className="space-y-6 pb-28">
      {/* Barra de Ação Superior & Botão de Retorno */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#758652]/20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={voltarParaListaSubordinados}
            className="p-2 border border-[#758652]/40 rounded-xl bg-[rgba(18,25,16,0.85)] hover:bg-[rgba(24,34,21,0.95)] text-[#D4AF37] transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Voltar à Lista de Subordinados Disponíveis"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trocar Subordinado</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tight">
                Avaliação Individual: {selectedMilitar.posto} {selectedMilitar.nomeCompleto}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#0F3323] text-[#D4AF37] border border-[#D4AF37]/40">
                Divisor {resultadoCalculo.divisor}
              </span>
            </div>
            <p className="text-xs text-[#9EAF94] mt-0.5 font-medium">
              Dados cadastrais fornecidos pela DPQ • Especialidade: {selectedMilitar.asc} • Quadro: {selectedMilitar.qe || 'QP'}
            </p>
          </div>
        </div>

        {/* Resumo Rápido da Média */}
        <div className="bg-[rgba(12,18,11,0.85)] border border-[#758652]/40 px-3.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2.5 shadow-2xs">
          <span className="text-[#8FA39A]">Média:</span>
          <strong className="text-[#D4AF37] text-sm">{resultadoCalculo.MP.toFixed(2)}</strong>
          <span className="text-[10px] text-slate-300 font-bold uppercase bg-white/10 px-2 py-0.5 rounded">
            {resultadoCalculo.classificacao}
          </span>
        </div>
      </div>

      <div className="executive-card rounded-2xl shadow-card overflow-hidden">
        {/* Stepper Header */}
        <FaiHeaderStepper activeStep={activeStep} onStepClick={setActiveStep} />

        {/* Step 1: Identificação & Período */}
        {activeStep === 1 && (
          <div>
            <Bloco01Identificacao
              militar={selectedMilitar}
              onMilitarChange={setSelectedMilitar}
              onSearchNip={handleSearchNip}
            />
            <Bloco02Periodo
              anoInstrucao={anoInstrucao}
              onAnoInstrucaoChange={setAnoInstrucao}
              periodoInicio={periodoInicio}
              onPeriodoInicioChange={setPeriodoInicio}
              periodoFim={periodoFim}
              onPeriodoFimChange={setPeriodoFim}
              tipo={tipo}
              onTipoChange={setTipo}
              observacoes={observacoes}
              onObservacoesChange={setObservacoes}
            />
          </div>
        )}

        {/* Step 2: Grelha com Bloco de Integridade & Classificação */}
        {activeStep === 2 && (
          <div>
            <Bloco03Grelha
              categoria={categoriaEfetiva}
              grelha={grelha}
              onGrelhaChange={setGrelha}
              numeroAvaliadores={numeroAvaliadores}
            />
            <Bloco04Classificacao resultado={resultadoCalculo} />
          </div>
        )}

        {/* Step 3: Pareceres */}
        {activeStep === 3 && (
          <Blocos05a09Pareceres
            fai={{ grelha, militarNip: selectedMilitar.nip || '', pareceres, numeroAvaliadores } as any}
            numeroAvaliadores={numeroAvaliadores}
            onPareceresChange={setPareceres}
          />
        )}

        {/* Step 4: Preferências */}
        {activeStep === 4 && (
          <Bloco10Preferencias
            preferencias={preferencias}
            onPreferenciasChange={setPreferencias}
          />
        )}

        {/* Step 5: Homologação e Revisão Final */}
        {activeStep === 5 && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Revisão e Abertura Oficial da FAI
            </h3>
            <p className="text-xs text-slate-500">
              A Ficha de Avaliação Individual será criada com status inicial no <strong>1º Avaliador</strong> (Prazo Regimental: 10 dias).
            </p>
            <Bloco04Classificacao resultado={resultadoCalculo} />
          </div>
        )}
      </div>

      {/* Barra Flutuante Inferior de Ação */}
      <div className="fixed bottom-0 right-0 left-64 bg-[#0B1612]/95 backdrop-blur-md border-t border-[#1B2F26] p-3.5 px-8 z-40 flex justify-between items-center no-print shadow-floating text-white">
        <div className="flex items-center gap-4 text-xs font-mono">
          <span>
            Média Ponderada: <strong className="text-[#D4AF37] text-base font-bold ml-1">{resultadoCalculo.MP.toFixed(2)}</strong> (Divisor {resultadoCalculo.divisor})
          </span>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-white/10 text-slate-200 border border-white/10 uppercase">
            {resultadoCalculo.classificacao}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {activeStep < 5 ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
              className="text-xs flex items-center gap-1.5 bg-[#B89047] hover:bg-[#A37E3A] text-white cursor-pointer"
            >
              Próximo Bloco <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="gold"
              size="sm"
              onClick={handleCreateFai}
              className="text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluir e Iniciar Workflow
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
