'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import { fetchMilitares, saveFaiDocument, fetchMilitarByNip } from '@/services/firebase/firestore';
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

export default function NovaFaiPage() {
  const router = useRouter();
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [selectedMilitar, setSelectedMilitar] = useState<Partial<Militar>>({
    nip: '40020792',
    nomeCompleto: 'António Mariano Pascoal',
    posto: 'Major',
    categoria: 'OFICIAL',
    unidade: 'Quartel-General do Exército',
    funcaoDesempenhada: 'Chefe de Secção de Planeamento',
    asc: 'Transmissões e Informática',
    qe: 'QP',
    feridoEmServico: false,
  });

  const [activeStep, setActiveStep] = useState(1);
  const [anoInstrucao, setAnoInstrucao] = useState('2025/2026');
  const [periodoInicio, setPeriodoInicio] = useState('2025-01-01');
  const [periodoFim, setPeriodoFim] = useState('2025-12-31');
  const [tipo, setTipo] = useState<'PERIODICA' | 'EXTRAORDINARIA'>('PERIODICA');
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
    comando: { op1: true, sugestaoIa: true },
    estado_maior: { op2: true },
  });

  const [pareceres, setPareceres] = useState<FaiDocument['pareceres']>({
    avaliador1: {
      texto: 'Militar com excelente preparação técnica e elevado sentido do dever.',
      nip: '10048291',
      nome: 'Ten-Cel. M. Pascoal',
      posto: 'Tenente-Coronel',
      data: new Date().toISOString().split('T')[0],
      assinado: true,
    },
  });

  useEffect(() => {
    async function load() {
      const data = await fetchMilitares();
      setMilitares(data);
    }
    load();
  }, []);

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
    'efetivo',
    Boolean(selectedMilitar.feridoEmServico)
  );

  const handleCreateFai = async () => {
    const newId = `FAI-${Date.now().toString().slice(-4)}`;
    const newDoc: FaiDocument = {
      id: newId,
      militarNip: selectedMilitar.nip || '00000000',
      militar: selectedMilitar as Militar,
      anoInstrucao,
      periodoInicio,
      periodoFim,
      tipo,
      observacoesBloco02: observacoes,
      grelha,
      mediaPonderada: resultadoCalculo.MP,
      divisor: resultadoCalculo.divisor,
      classificacao: resultadoCalculo.classificacao,
      pareceres,
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
    router.push(`/fai/${newId}`);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Banner */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 border border-border rounded bg-white hover:bg-muted text-muted-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-primary uppercase">Criar Nova FAI Digital</h2>
            <p className="text-xs text-muted-foreground">
              Abertura oficial do processo de avaliação individual (12 Blocos regimentais - Manual VII FAA)
            </p>
          </div>
        </div>

        {/* Quick Militar Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase hidden sm:block">
            Preencher a partir de:
          </label>
          <select
            onChange={(e) => {
              const m = militares.find((mil) => mil.nip === e.target.value);
              if (m) {
                setSelectedMilitar(m);
                setSimularPraça(m.categoria === 'PRACA');
              }
            }}
            className="py-1.5 px-3 text-xs border border-border rounded bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Selecione um Militar cadastrado...</option>
            {militares.map((mil) => (
              <option key={mil.nip} value={mil.nip}>
                {mil.posto} {mil.nomeCompleto} (NIP {mil.nip})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-border rounded shadow-xs overflow-hidden">
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
            />
            <Bloco04Classificacao resultado={resultadoCalculo} />
          </div>
        )}

        {/* Step 3: Pareceres */}
        {activeStep === 3 && (
          <Blocos05a09Pareceres
            fai={{ grelha, militarNip: selectedMilitar.nip || '', pareceres } as any}
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
            <h3 className="text-sm font-bold text-primary uppercase">
              Revisão e Criação da FAI
            </h3>
            <p className="text-xs text-muted-foreground">
              A Ficha será criada e inserida no workflow na etapa do <strong>1º Avaliador</strong> (Prazo: 10 dias).
            </p>
            <Bloco04Classificacao resultado={resultadoCalculo} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 right-0 left-sidebar-width bg-white/95 backdrop-blur-md border-t border-border p-3 px-6 z-40 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4 text-xs font-mono">
          <span>Média Ponderada: <strong className="text-primary text-sm">{resultadoCalculo.MP.toFixed(2)}</strong></span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted border border-border">
            {resultadoCalculo.classificacao}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {activeStep < 5 ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
              className="text-xs flex items-center gap-1.5"
            >
              Próximo Bloco <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="gold"
              size="sm"
              onClick={handleCreateFai}
              className="text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluir e Iniciar Workflow
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
