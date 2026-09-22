'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Save,
  Printer,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  ChevronLeft,
  AlertTriangle,
  Send,
  GitBranch,
  KeyRound,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { fetchFaiById, saveFaiDocument, validarCodigoAcessoAvaliacao } from '@/services/firebase/firestore';
import { FaiDocument } from '@/types/fai';
import { PapelAvaliador } from '@/types/avaliacao';
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
import { TramitarModal } from '@/components/workflow/tramitar-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { canAcessarFai } from '@/lib/hierarchy';

export default function FaiDetailClient({ faiId }: { faiId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const [fai, setFai] = useState<FaiDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [simularPraça, setSimularPraça] = useState(false);
  const [showPdfView, setShowPdfView] = useState(false);
  const [showTramitarModal, setShowTramitarModal] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Individual Access Code state (DPQ code system)
  const [codigoAcessoInput, setCodigoAcessoInput] = useState('');
  const [papelDesbloqueado, setPapelDesbloqueado] = useState<PapelAvaliador | undefined>();
  const [codigoMensagem, setCodigoMensagem] = useState('');
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  useEffect(() => {
    async function loadFai() {
      try {
        const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
        const candidateId = pathParts[1];
        const targetId = (faiId === 'detalhes' && candidateId && candidateId !== 'detalhes') ? candidateId : faiId;

        const doc = await fetchFaiById(targetId);
        if (doc) {
          setFai(doc);
          setSimularPraça(doc.militar?.categoria === 'PRACA');

          // Check if code was passed in URL query param
          const codeParam = searchParams?.get('codigo');
          if (codeParam) {
            setCodigoAcessoInput(codeParam);
            validarCodigo(codeParam, doc);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar FAI:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFai();
  }, [faiId, searchParams]);

  const validarCodigo = async (codigoParaValidar?: string, faiAlvo?: FaiDocument) => {
    const cod = (codigoParaValidar || codigoAcessoInput).trim();
    if (!cod) {
      setCodigoMensagem('Por favor digite o código de acesso fornecido pela DPQ.');
      return;
    }
    setValidandoCodigo(true);
    setCodigoMensagem('');
    try {
      const res = await validarCodigoAcessoAvaliacao(cod);
      const curFai = faiAlvo || fai;
      if (res.valido && res.atribuicao) {
        if (curFai && res.atribuicao.militarAvaliadoNip !== curFai.militarNip) {
          setCodigoMensagem(
            `Código válido para o militar ${res.atribuicao.militarAvaliadoNome} (NIP ${res.atribuicao.militarAvaliadoNip}), mas este processo refere-se ao NIP ${curFai.militarNip}.`
          );
          setPapelDesbloqueado(undefined);
        } else {
          setPapelDesbloqueado(res.papel);
          const papelLabel =
            res.papel === 'avaliador1'
              ? '1º Avaliador'
              : res.papel === 'avaliador2'
              ? '2º Avaliador'
              : 'Comandante';
          setCodigoMensagem(`Código validado com sucesso! Acesso concedido como ${papelLabel}.`);
        }
      } else {
        setCodigoMensagem(res.mensagem || 'Código inválido.');
        setPapelDesbloqueado(undefined);
      }
    } catch (err: any) {
      setCodigoMensagem('Erro ao validar código. Verifique a ligação ao sistema.');
    } finally {
      setValidandoCodigo(false);
    }
  };

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

  // Princípio da Hierarquia Militar FAA (Ponto 2 e Ponto 4):
  if (!canAcessarFai(profile, fai)) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl shadow-card text-center space-y-4 animate-in fade-in">
        <div className="inline-flex p-3 bg-rose-50 rounded-full text-rose-700 border border-rose-200">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
          Acesso Negado • Violação da Hierarquia Militar
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Em observância rigorosa ao <strong>Princípio da Hierarquia Militar das FAA</strong>, o militar não possui autorização para consultar os dados ou a Ficha de Avaliação Individual de um superior hierárquico ou de processos fora da sua responsabilidade.
        </p>
        <div className="pt-2">
          <Link href={profile?.role === 'MILITAR_AVALIADO' ? '/minha-fai' : '/militares'}>
            <Button size="sm" className="text-xs bg-[#0F3323] hover:bg-[#184A34] text-white">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Recalculate Live Regimental Math strictly for Praças (Divisor 31) considering 2 or 3 evaluators
  const categoriaEfetiva = 'PRACA';
  const numAvaliadoresEfetivo = fai.numeroAvaliadores || 3;
  const resultadoCalculo = calcularMediaRegimental(
    categoriaEfetiva,
    fai.grelha || {},
    {
      avaliadorAtivo: papelDesbloqueado || 'efetivo',
      feridoEmCombate: Boolean(fai.militar?.feridoEmServico),
      numeroAvaliadores: numAvaliadoresEfetivo,
    }
  );

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setSaveErrorMessage('');
    setSaveSuccessMessage('');

    const updated: FaiDocument = {
      ...fai,
      numeroAvaliadores: numAvaliadoresEfetivo,
      ultimoAvaliador: numAvaliadoresEfetivo === 2 ? 'avaliador2' : 'cmdte',
      mediaCalculadaPor: numAvaliadoresEfetivo === 2 ? 'avaliador2' : 'cmdte',
      mediaPonderada: resultadoCalculo.MP,
      divisor: resultadoCalculo.divisor,
      classificacao: resultadoCalculo.classificacao,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveFaiDocument(updated);
      setFai(updated);
      setSaveSuccessMessage('Rascunho da FAI guardado com sucesso no sistema central.');
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } catch (err: any) {
      setSaveErrorMessage('Falha na ligação com a base de dados central. Clique para tentar novamente.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePrintPdf = () => {
    setShowPdfView(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const isMilitarAvaliado = profile?.role === 'MILITAR_AVALIADO';

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
                Etapa: {fai.workflow.etapaAtual}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {fai.militar ? `${fai.militar.posto} ${fai.militar.nomeCompleto}` : fai.militarNip} • Ano {fai.anoInstrucao}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isMilitarAvaliado && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => setShowTramitarModal(true)}
              className="text-xs flex items-center gap-1.5 shadow-xs"
            >
              <GitBranch className="w-3.5 h-3.5" /> Tramitar / Avançar
            </Button>
          )}
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
            Exportar em PDF
          </Button>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-semibold flex items-center gap-2 animate-in fade-in no-print shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {saveErrorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 font-semibold flex items-center justify-between gap-2 animate-in fade-in no-print shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveErrorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Regimental Inconsistency Alert Banner */}
      {resultadoCalculo.incoerenciasDetectadas && resultadoCalculo.incoerenciasDetectadas.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1 shadow-2xs no-print">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Alerta do Motor de Coerência Regimental (Manual VII FAA):</span>
          </div>
          {resultadoCalculo.incoerenciasDetectadas.map((inc, i) => (
            <p key={i} className="pl-6 text-[11.5px] text-amber-800">• {inc}</p>
          ))}
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

          {/* Individual Access Code (DPQ) Prompt / Status Banner */}
          {!isMilitarAvaliado && (
            <div className="bg-slate-50 border-b border-slate-200/80 p-4 px-6 no-print">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border ${papelDesbloqueado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                    {papelDesbloqueado ? <ShieldCheck className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 uppercase font-mono">
                        {papelDesbloqueado
                          ? `Acesso Regimental Liberado: ${papelDesbloqueado === 'avaliador1' ? '1º Avaliador' : papelDesbloqueado === 'avaliador2' ? '2º Avaliador' : 'Comandante'}`
                          : 'Acesso por Código Individual (DPQ)'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-200 text-slate-700">
                        {numAvaliadoresEfetivo} Avaliadores • Último: {numAvaliadoresEfetivo === 2 ? '2º Avaliador' : 'Comandante'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {papelDesbloqueado
                        ? 'Você tem permissão ativa para preencher e validar os campos sob sua estrita responsabilidade regimental.'
                        : 'Insira o código individual emitido pelo Chefe da DPQ para desbloquear os campos atribuídos a si nesta FAI.'}
                    </p>
                  </div>
                </div>

                {!papelDesbloqueado ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      validarCodigo();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Ex: FAA-AV1-XXXX"
                      value={codigoAcessoInput}
                      onChange={(e) => setCodigoAcessoInput(e.target.value.toUpperCase())}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary w-40"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={validandoCodigo}
                      className="text-xs bg-[#0F3323] hover:bg-[#184A34] text-white"
                    >
                      {validandoCodigo ? 'A validar...' : 'Desbloquear'}
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-800 font-semibold bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      Ativo ({codigoAcessoInput || 'Validado'})
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPapelDesbloqueado(undefined);
                        setCodigoAcessoInput('');
                        setCodigoMensagem('');
                      }}
                      className="text-[11px] h-7 px-2"
                    >
                      Trocar Código
                    </Button>
                  </div>
                )}
              </div>

              {codigoMensagem && (
                <div
                  className={`mt-2.5 p-2 rounded-lg text-xs font-mono ${
                    papelDesbloqueado
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {codigoMensagem}
                </div>
              )}
            </div>
          )}

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
                categoria="PRACA"
                grelha={fai.grelha || {}}
                onGrelhaChange={(novaGrelha) => setFai({ ...fai, grelha: novaGrelha })}
                numeroAvaliadores={numAvaliadoresEfetivo}
                papelDesbloqueado={papelDesbloqueado}
                avaliadorInterveniente={
                  papelDesbloqueado ||
                  (profile?.role === 'CMDTE'
                    ? 'cmdte'
                    : profile?.role === 'AVALIADOR_2'
                    ? 'avaliador2'
                    : 'avaliador1')
                }
              />
              <Bloco04Classificacao resultado={resultadoCalculo} />
            </div>
          )}

          {activeStep === 3 && (
            <Blocos05a09Pareceres
              fai={fai}
              numeroAvaliadores={numAvaliadoresEfetivo}
              papelDesbloqueado={papelDesbloqueado}
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
          {!isMilitarAvaliado && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="text-xs bg-transparent border-slate-700 text-slate-200 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Salvar Rascunho
            </Button>
          )}

          {activeStep < 5 ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
              className="text-xs flex items-center gap-1.5 bg-[#B89047] hover:bg-[#A37E3A] text-white cursor-pointer"
            >
              Próximo Bloco <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : !isMilitarAvaliado ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowTramitarModal(true)}
              className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Assinar e Avançar Etapa
            </Button>
          ) : null}
        </div>
      </div>

      {/* Tramitar Modal with PIN and Official Transition */}
      {showTramitarModal && (
        <TramitarModal
          fai={fai}
          onClose={() => setShowTramitarModal(false)}
          onSuccess={(updatedFai) => {
            setFai(updatedFai);
            setSaveSuccessMessage(`Processo tramitado com sucesso para a etapa ${updatedFai.workflow.etapaAtual}!`);
            setTimeout(() => setSaveSuccessMessage(''), 4000);
          }}
        />
      )}
    </div>
  );
}

