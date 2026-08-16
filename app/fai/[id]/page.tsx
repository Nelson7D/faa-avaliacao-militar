'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Save,
  Printer,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  ChevronLeft,
  FileText,
} from 'lucide-react';
import { fetchFaiById, saveFaiDocument, avancarWorkflowFai } from '@/services/firebase/firestore';
import { FaiDocument } from '@/types/fai';
import { calcularMediaRegimental } from '@/lib/calculo-fai';
import { FaiHeaderStepper } from '@/components/fai/fai-header-stepper';
import { Bloco01Identificacao } from '@/components/fai/bloco-01-identificacao';
import { Bloco02Periodo } from '@/components/fai/bloco-02-periodo';
import { Bloco03Grelha } from '@/components/fai/bloco-03-grelha';
import { Bloco04Classificacao } from '@/components/fai/bloco-04-classificacao';
import { Blocos05a09Pareceres } from '@/components/fai/blocos-05-09-pareceres';
import { Bloco10Preferencias } from '@/components/fai/bloco-10-preferencias';
import { Bloco11Homologacao } from '@/components/fai/bloco-11-homologacao';
import { FaiPdfView } from '@/components/fai/fai-pdf-view';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FaiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const faiId = resolvedParams.id;

  const [fai, setFai] = useState<FaiDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [simularPraça, setSimularPraça] = useState(false);
  const [showPdfView, setShowPdfView] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  useEffect(() => {
    async function loadFai() {
      try {
        const doc = await fetchFaiById(faiId);
        if (doc) {
          setFai(doc);
          setSimularPraça(doc.militar?.categoria === 'PRACA');
        }
      } catch (err) {
        console.error('Erro ao carregar FAI:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFai();
  }, [faiId]);

  if (loading) {
    return (
      <div className="p-16 text-center text-xs font-mono text-slate-400 animate-pulse">
        Carregando Ficha de Avaliação Individual (FAI {faiId})...
      </div>
    );
  }

  if (!fai) {
    return (
      <div className="p-16 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-600">FAI {faiId} não encontrada no sistema.</p>
        <Link href="/dashboard" className="text-xs text-primary font-medium hover:underline">
          &larr; Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  // Recalculate Live Regimental Math
  const categoriaEfetiva = simularPraça ? 'PRACA' : fai.militar?.categoria || 'OFICIAL';
  const resultadoCalculo = calcularMediaRegimental(
    categoriaEfetiva,
    fai.grelha || {},
    'efetivo',
    Boolean(fai.militar?.feridoEmServico)
  );

  const handleSaveDraft = async () => {
    const updated: FaiDocument = {
      ...fai,
      mediaPonderada: resultadoCalculo.MP,
      divisor: resultadoCalculo.divisor,
      classificacao: resultadoCalculo.classificacao,
      updatedAt: new Date().toISOString(),
    };
    await saveFaiDocument(updated);
    setFai(updated);
    setSaveSuccessMessage('Rascunho da FAI guardado com sucesso!');
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  const handleAdvanceWorkflow = async () => {
    let proxima = 'AVALIADOR_2';
    if (fai.workflow.etapaAtual === 'AVALIADOR_1') proxima = 'AVALIADOR_2';
    else if (fai.workflow.etapaAtual === 'AVALIADOR_2') proxima = 'CMDTE';
    else if (fai.workflow.etapaAtual === 'CMDTE') proxima = 'CONSELHO_ASC';
    else if (fai.workflow.etapaAtual === 'CONSELHO_ASC') proxima = 'DPQ';
    else if (fai.workflow.etapaAtual === 'DPQ') proxima = 'HOMOLOGADO';

    const updated = await avancarWorkflowFai(fai.id, proxima as any, {
      nip: '10048291',
      nome: 'Ten-Cel. M. Pascoal',
      posto: 'Tenente-Coronel',
      despacho: 'Avanço de etapa regimental e validação de notas.',
    });
    setFai(updated);
    setSaveSuccessMessage(`Etapa avançada para ${proxima}!`);
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  const handlePrintPdf = () => {
    setShowPdfView(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-mono tracking-tight">{fai.id}</h2>
              <Badge variant="fav" className="text-[10px] px-2.5">
                {fai.workflow.etapaAtual}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {fai.militar ? `${fai.militar.posto} ${fai.militar.nomeCompleto}` : fai.militarNip} • Ano {fai.anoInstrucao}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPdfView(!showPdfView)}
            className="text-xs"
          >
            {showPdfView ? 'Ocultar PDF' : 'Ver Modo PDF'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handlePrintPdf}
            className="text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Exportar FAI em PDF
          </Button>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-semibold flex items-center gap-2 animate-in fade-in no-print shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Conditional: Show Printable PDF View or Form Canvas */}
      {showPdfView ? (
        <div>
          <div className="no-print bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 mb-4 flex justify-between items-center">
            <span>Visualização da Ficha de Avaliação Individual em formato A4 Oficial com marca d'água regimental.</span>
            <Button size="sm" variant="outline" onClick={() => setShowPdfView(false)}>
              Voltar ao Formulário
            </Button>
          </div>
          <FaiPdfView fai={{ ...fai, mediaPonderada: resultadoCalculo.MP, classificacao: resultadoCalculo.classificacao }} />
        </div>
      ) : (
        <div className="executive-card rounded-2xl overflow-hidden shadow-card">
          {/* Stepper Header */}
          <FaiHeaderStepper activeStep={activeStep} onStepClick={setActiveStep} />

          {/* Form Content per Step */}
          {activeStep === 1 && (
            <div>
              <Bloco01Identificacao
                militar={fai.militar || { nip: fai.militarNip }}
                onMilitarChange={(m) => setFai({ ...fai, militar: { ...(fai.militar as any), ...m } })}
              />
              <Bloco02Periodo
                anoInstrucao={fai.anoInstrucao}
                onAnoInstrucaoChange={(ano) => setFai({ ...fai, anoInstrucao: ano })}
                periodoInicio={fai.periodoInicio}
                onPeriodoInicioChange={(ini) => setFai({ ...fai, periodoInicio: ini })}
                periodoFim={fai.periodoFim}
                onPeriodoFimChange={(fim) => setFai({ ...fai, periodoFim: fim })}
                tipo={fai.tipo}
                onTipoChange={(t) => setFai({ ...fai, tipo: t })}
                observacoes={fai.observacoesBloco02}
                onObservacoesChange={(obs) => setFai({ ...fai, observacoesBloco02: obs })}
              />
            </div>
          )}

          {activeStep === 2 && (
            <div>
              <Bloco03Grelha
                categoria={categoriaEfetiva}
                grelha={fai.grelha || {}}
                onGrelhaChange={(novaGrelha) => setFai({ ...fai, grelha: novaGrelha })}
                perfilPraçaSimulado={simularPraça}
                onTogglePraçaSimulada={(val) => setSimularPraça(val)}
                avaliadorInterveniente="avaliador1"
              />
              <Bloco04Classificacao resultado={resultadoCalculo} />
            </div>
          )}

          {activeStep === 3 && (
            <Blocos05a09Pareceres
              fai={fai}
              onPareceresChange={(par) => setFai({ ...fai, pareceres: par })}
            />
          )}

          {activeStep === 4 && (
            <Bloco10Preferencias
              preferencias={fai.preferenciasEmprego || {}}
              onPreferenciasChange={(prefs) => setFai({ ...fai, preferenciasEmprego: prefs })}
            />
          )}

          {activeStep === 5 && (
            <Bloco11Homologacao
              fai={fai}
              onOrgaoPessoalChange={(op) =>
                setFai({
                  ...fai,
                  pareceres: {
                    ...fai.pareceres,
                    orgaoPessoal: op,
                  },
                })
              }
            />
          )}
        </div>
      )}

      {/* Floating Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 right-0 left-64 bg-[#0B1612]/95 backdrop-blur-md border-t border-[#1B2F26] p-3.5 px-8 z-40 flex justify-between items-center no-print shadow-floating text-white">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400 font-mono">
            Média Atual: <strong className="text-[#D4AF37] text-base font-bold ml-1">{resultadoCalculo.MP.toFixed(2)}</strong> (Divisor {resultadoCalculo.divisor})
          </span>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-white/10 text-slate-200 border border-white/10 uppercase">
            {resultadoCalculo.classificacao}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="text-xs bg-transparent border-slate-700 text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <Save className="w-3.5 h-3.5 mr-1" /> Salvar Rascunho
          </Button>

          {activeStep < 5 ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
              className="text-xs flex items-center gap-1.5 bg-[#B89047] hover:bg-[#A37E3A] text-white"
            >
              Próximo Bloco <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleAdvanceWorkflow}
              className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Assinar e Avançar Etapa
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
