'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, ArrowRight, CheckCircle2, UserCheck, ShieldAlert, FileText, KeyRound } from 'lucide-react';
import { fetchMilitares, saveFaiDocument, fetchMilitarByNip, registrarAuditLog, fetchAtribuicaoById, vincularFaiAtribuicao } from '@/services/firebase/firestore';
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
import { Bloco11Homologacao } from '@/components/fai/bloco-11-homologacao';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export default function NovaFaiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [selectedMilitar, setSelectedMilitar] = useState<Partial<Militar>>({
    nip: '',
    nomeCompleto: '',
    nomeGuerra: '',
    posto: 'Tenente',
    categoria: 'OFICIAL',
    unidade: '',
    funcaoDesempenhada: '',
    asc: '',
    qe: 'QP',
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

  // Initial Grelha
  const [grelha, setGrelha] = useState<FaiBloco03Grelha>(() => {
    const initial: FaiBloco03Grelha = {};
    for (let i = 1; i <= 16; i++) {
      initial[`F${i}`] = { avaliador1: 15 };
    }
    return initial;
  });

  const [simularPraça, setSimularPraça] = useState(false);
  const [preferencias, setPreferencias] = useState<FaiDocument['preferenciasEmprego']>({
    comando: { op1: true },
    estado_maior: { op2: true },
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
      const data = await fetchMilitares();
      setMilitares(data);
      
      const atrIdParam = searchParams?.get('atribuicaoId');
      const nipParam = searchParams?.get('nip');

      if (atrIdParam) {
        setAtribuicaoId(atrIdParam);
        const atr = await fetchAtribuicaoById(atrIdParam);
        if (atr) {
          setNumeroAvaliadores(atr.numeroAvaliadores);
          const mil = data.find((m) => m.nip === atr.militarAvaliadoNip);
          if (mil) {
            setSelectedMilitar(mil);
            setSimularPraça(mil.categoria === 'PRACA');
            return;
          }
        }
      }

      if (nipParam) {
        const mil = data.find((m) => m.nip === nipParam);
        if (mil) {
          setSelectedMilitar(mil);
          setSimularPraça(mil.categoria === 'PRACA');
          return;
        }
      }

      if (data.length > 0) {
        setSelectedMilitar(data[0]);
        setSimularPraça(data[0].categoria === 'PRACA');
      }
    }
    load();
  }, [searchParams]);

  const handleSearchNip = async (nip: string) => {
    const found = await fetchMilitarByNip(nip);
    if (found) {
      setSelectedMilitar(found);
      setSimularPraça(found.categoria === 'PRACA');
    }
  };

  // Recalculate
  const categoriaEfetiva = simularPraça ? 'PRACA' : selectedMilitar.categoria || 'OFICIAL';
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

    const ano = anoInstrucao.split('/')[0] || '2025';
    const newId = `FAI-${ano}-${Date.now().toString().slice(-4)}`;
    const newDoc: FaiDocument = {
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
      pareceres: {
        ...pareceres,
        avaliador1: {
          texto: pareceres?.avaliador1?.texto || 'Militar avaliado em conformidade regimental.',
          nip: profile?.nip || '',
          nome: profile ? `${profile.posto} ${profile.nomeGuerra || profile.nomeCompleto}` : '',
          posto: profile?.posto || '',
          data: new Date().toISOString().split('T')[0],
          assinado: true,
        },
      },
      preferenciasEmprego: preferencias,
      workflow: {
        etapaAtual: 'AVALIADOR_1',
        diasNaEtapa: 1,
        prazoLimiteEtapa: 10,
        atrasado: false,
        dataEntradaEtapa: new Date().toISOString().split('T')[0],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveFaiDocument(newDoc);
    if (atribuicaoId) {
      await vincularFaiAtribuicao(atribuicaoId, newId);
    }

    await registrarAuditLog({
      operadorNip: profile?.nip || 'SISTEMA',
      operadorNome: profile ? `${profile.posto} ${profile.nomeGuerra || profile.nomeCompleto}` : 'Sistema FAA',
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

  return (
    <div className="space-y-6 pb-28">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Criar Nova FAI Digital</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Abertura oficial do processo de avaliação individual (Manual VII FAA • 12 Blocos Regimentais)
            </p>
          </div>
        </div>

        {/* Quick Militar Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 uppercase hidden sm:block">
            Preencher Militar:
          </label>
          <select
            onChange={(e) => {
              const m = militares.find((mil) => mil.nip === e.target.value);
              if (m) {
                setSelectedMilitar(m);
                setSimularPraça(m.categoria === 'PRACA');
              }
            }}
            className="py-1.5 px-3 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs cursor-pointer font-medium"
          >
            <option value="">Selecione um Militar cadastrado...</option>
            {militares.map((mil) => (
              <option key={mil.nip} value={mil.nip}>
                {mil.posto} {mil.nomeCompleto} (NIP {mil.nip} - {mil.categoria})
              </option>
            ))}
          </select>
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

        {/* Step 2: Grelha & Classificação */}
        {activeStep === 2 && (
          <div>
            <Bloco03Grelha
              categoria={categoriaEfetiva}
              grelha={grelha}
              onGrelhaChange={setGrelha}
              perfilPraçaSimulado={simularPraça}
              onTogglePraçaSimulada={setSimularPraça}
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

        {/* Step 5: Homologação */}
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

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 right-0 left-64 bg-[#0B1612]/95 backdrop-blur-md border-t border-[#1B2F26] p-3.5 px-8 z-40 flex justify-between items-center no-print shadow-floating text-white">
        <div className="flex items-center gap-4 text-xs font-mono">
          <span>Média Ponderada: <strong className="text-[#D4AF37] text-base font-bold ml-1">{resultadoCalculo.MP.toFixed(2)}</strong> (Divisor {resultadoCalculo.divisor})</span>
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

