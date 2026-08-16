'use client';

import React from 'react';
import { FaiDocument } from '@/types/fai';
import { FATORES_AVALIACAO, FATORES_EXCLUIDOS_PRACAS, AREAS_EMPREGO_PREFERENCIA } from '@/lib/constants';
import { formatNip, formatDataPt } from '@/lib/utils';

export function FaiPdfView({ fai }: { fai: FaiDocument }) {
  const isPraca = fai.militar?.categoria === 'PRACA';
  const m = fai.militar;
  const p = fai.pareceres || {};
  const grelha = fai.grelha || {};

  return (
    <div id="fai-pdf-document" className="bg-white text-black p-8 max-w-4xl mx-auto font-sans relative border border-gray-300 shadow-md my-6 print:m-0 print:border-none print:shadow-none">
      {/* Background Watermark Shield */}
      <div
        className="absolute inset-0 pointer-events-none bg-center bg-no-repeat bg-contain opacity-5 z-0"
        style={{ backgroundImage: "url('/assets/watermark-shield.svg')" }}
      />

      <div className="relative z-10 space-y-4">
        {/* Official Header */}
        <div className="text-center border-b-2 border-black pb-3">
          <h1 className="text-sm font-black tracking-widest uppercase">REPÚBLICA DE ANGOLA</h1>
          <h2 className="text-xs font-bold tracking-wider uppercase text-gray-800">FORÇAS ARMADAS ANGOLANAS - ESTADO-MAIOR GENERAL</h2>
          <h3 className="text-sm font-black uppercase text-[#163826] mt-1">
            FICHA DE AVALIAÇÃO INDIVIDUAL DO MILITAR (FAI)
          </h3>
          <div className="flex justify-between items-center text-[10px] font-mono mt-1 pt-1 border-t border-gray-300">
            <span>MOD. FAA-RH-042/23 • MANUAL REGIMENTAL VII</span>
            <span>ANO DE INSTRUÇÃO: {fai.anoInstrucao}</span>
            <span>REGISTO: {fai.id}</span>
          </div>
        </div>

        {/* BLOCO 01: Identificação do Avaliado */}
        <div className="border border-black text-[11px]">
          <div className="bg-gray-100 p-1 border-b border-black font-bold text-[10px] uppercase">
            BLOCO 01 - IDENTIFICAÇÃO DO AVALIADO
          </div>
          <div className="grid grid-cols-4 divide-x divide-y divide-black">
            <div className="p-1.5 col-span-2">
              <span className="text-[9px] text-gray-600 block uppercase font-bold">Unidade / Órgão:</span>
              <span className="font-bold uppercase">{m?.unidade || '-'}</span>
            </div>
            <div className="p-1.5">
              <span className="text-[9px] text-gray-600 block uppercase font-bold">NIP Militar:</span>
              <span className="font-mono font-bold">{formatNip(fai.militarNip)}</span>
            </div>
            <div className="p-1.5">
              <span className="text-[9px] text-gray-600 block uppercase font-bold">Posto / Graduação:</span>
              <span className="font-bold uppercase">{m?.posto || '-'}</span>
            </div>
            <div className="p-1.5 col-span-2">
              <span className="text-[9px] text-gray-600 block uppercase font-bold">Nome Completo:</span>
              <span className="font-bold uppercase">{m?.nomeCompleto || '-'}</span>
            </div>
            <div className="p-1.5">
              <span className="text-[9px] text-gray-600 block uppercase font-bold">Arma / Serviço:</span>
              <span>{m?.asc || '-'}</span>
            </div>
            <div className="p-1.5">
              <span className="text-[9px] text-gray-600 block uppercase font-bold">Quadro Orgânico:</span>
              <span className="font-bold">{m?.qe || 'QP'}</span>
            </div>
            <div className="p-1.5 col-span-4">
              <span className="text-[9px] text-gray-600 block uppercase font-bold">Função Desempenhada:</span>
              <span>{m?.funcaoDesempenhada || '-'}</span>
            </div>
          </div>
        </div>

        {/* BLOCO 02 & BLOCO 03 */}
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="border border-black p-2">
            <span className="font-bold uppercase text-[9px] block bg-gray-100 p-1 mb-1 border-b border-black">
              BLOCO 02 - DATA E FORMA DE AVALIAÇÃO
            </span>
            <div className="space-y-1">
              <div><strong>Modalidade:</strong> {fai.tipo === 'PERIODICA' ? 'Periódica Anual' : 'Extraordinária'}</div>
              <div><strong>Período:</strong> {formatDataPt(fai.periodoInicio)} a {formatDataPt(fai.periodoFim)}</div>
              <div><strong>Ano de Instrução:</strong> {fai.anoInstrucao}</div>
            </div>
          </div>

          <div className="border border-black p-2">
            <span className="font-bold uppercase text-[9px] block bg-gray-100 p-1 mb-1 border-b border-black">
              BLOCO 03 - IDENTIFICAÇÃO DOS AVALIADORES
            </span>
            <div className="space-y-1 text-[9px]">
              <div><strong>1º Avaliador:</strong> {p.avaliador1?.nome || 'Oficial Superior Direto'}</div>
              <div><strong>2º Avaliador:</strong> {p.avaliador2?.nome || 'Segundo Oficial Interveniente'}</div>
              <div><strong>Cmdt U/E/O:</strong> {p.cmdte?.nome || 'Comandante da Unidade'}</div>
            </div>
          </div>
        </div>

        {/* BLOCO 04: Factores de Avaliação (F1 a F16) */}
        <div className="border border-black text-[10px]">
          <div className="bg-gray-100 p-1 border-b border-black font-bold uppercase flex justify-between">
            <span>BLOCO 04 - FACTORES DE AVALIAÇÃO (F1 A F16)</span>
            <span>DIVISOR BASE: {fai.divisor}</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black bg-gray-50 text-[9px] font-bold">
                <th className="p-1 w-8 text-center border-r border-black">ID</th>
                <th className="p-1 border-r border-black">FACTOR DE AVALIAÇÃO</th>
                <th className="p-1 w-10 text-center border-r border-black">COEF.</th>
                <th className="p-1 w-16 text-center border-r border-black">1º AVAL.</th>
                <th className="p-1 w-16 text-center border-r border-black">2º AVAL.</th>
                <th className="p-1 w-16 text-center">CMDTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {FATORES_AVALIACAO.map((fator) => {
                const isExcluded = isPraca && FATORES_EXCLUIDOS_PRACAS.includes(fator.id);
                const coef = isPraca ? fator.coeficientePraca : fator.coeficienteOficialSargento;
                const n = grelha[fator.id] || {};

                return (
                  <tr key={fator.id} className={isExcluded ? 'bg-gray-100 opacity-60' : ''}>
                    <td className="p-1 text-center font-mono font-bold border-r border-black">{fator.id}</td>
                    <td className="p-1 border-r border-black">{fator.nome}</td>
                    <td className="p-1 text-center font-mono border-r border-black">{isExcluded ? '-' : coef}</td>
                    <td className="p-1 text-center font-mono font-bold border-r border-black">
                      {isExcluded ? '-' : n.avaliador1 || '-'}
                    </td>
                    <td className="p-1 text-center font-mono border-r border-black">
                      {isExcluded ? '-' : n.avaliador2 || '-'}
                    </td>
                    <td className="p-1 text-center font-mono font-bold">
                      {isExcluded ? '-' : n.cmdte || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BLOCO 05: Média Final Regimental */}
        <div className="border-2 border-black p-2 bg-gray-50 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold uppercase text-[10px] block">BLOCO 05 - MÉDIA FINAL REGIMENTAL</span>
            <span className="text-[10px] text-gray-700 font-mono">
              Fórmula Oficial: MP = (C × N) / {fai.divisor} | Arredondado às centésimas
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center font-mono">
              <span className="text-[9px] uppercase text-gray-600 block">MÉDIA PONDERADA (MP)</span>
              <span className="text-xl font-black">{fai.mediaPonderada.toFixed(2)}</span>
            </div>
            <div className="border border-black px-3 py-1 bg-white font-black text-center uppercase tracking-wider">
              {fai.classificacao}
            </div>
          </div>
        </div>

        {/* BLOCO 06, 07, 08, 09: Pareceres Regimentais */}
        <div className="border border-black text-[10px] divide-y divide-black">
          <div className="p-2">
            <span className="font-bold uppercase text-[9px] block">BLOCO 06 - PARECER DO CONSELHO DA ASEC:</span>
            <p className="italic mt-0.5">{p.conselhoAsc?.texto || 'Parecer favorável à progressão e aptidão técnica do militar.'}</p>
          </div>

          <div className="p-2">
            <span className="font-bold uppercase text-[9px] block">BLOCO 07 - O PRIMEIRO AVALIADOR:</span>
            <p className="italic mt-0.5">{p.avaliador1?.texto || 'Sem observações adicionais.'}</p>
            <div className="flex justify-between mt-1 pt-1 border-t border-gray-200 text-[9px] font-mono">
              <span>Avaliador: {p.avaliador1?.nome || '-'} (NIP {p.avaliador1?.nip || '-'})</span>
              <span>Data: {formatDataPt(p.avaliador1?.data)}</span>
              <span>[ASSINADO DIGITALMENTE]</span>
            </div>
          </div>

          <div className="p-2">
            <span className="font-bold uppercase text-[9px] block">BLOCO 08 - O SEGUNDO AVALIADOR:</span>
            <p className="italic mt-0.5">{p.avaliador2?.texto || (p.avaliador2?.concordancia ? 'Concordo expressamente com as notas atribuídas pelo 1º Avaliador.' : 'Sem parecer registado.')}</p>
            <div className="flex justify-between mt-1 pt-1 border-t border-gray-200 text-[9px] font-mono">
              <span>2º Avaliador: {p.avaliador2?.nome || '-'} (NIP {p.avaliador2?.nip || '-'})</span>
              <span>Data: {formatDataPt(p.avaliador2?.data)}</span>
              <span>[ASSINADO DIGITALMENTE]</span>
            </div>
          </div>

          <div className="p-2">
            <span className="font-bold uppercase text-[9px] block">BLOCO 09 - O COMANDANTE, DIRECTOR OU CHEFE DA U/E/O:</span>
            <p className="italic mt-0.5">{p.cmdte?.texto || 'Homologado no âmbito da Unidade conforme parecer dos avaliadores.'}</p>
            <div className="flex justify-between mt-1 pt-1 border-t border-gray-200 text-[9px] font-mono">
              <span>Comandante: {p.cmdte?.nome || '-'} (NIP {p.cmdte?.nip || '-'})</span>
              <span>Data: {formatDataPt(p.cmdte?.data)}</span>
              <span>[DESPACHADO & SELADO]</span>
            </div>
          </div>
        </div>

        {/* BLOCO 10: Áreas Preferenciais de Emprego */}
        <div className="border border-black p-2 text-[10px]">
          <span className="font-bold uppercase text-[9px] block bg-gray-100 p-1 mb-1 border-b border-black">
            BLOCO 10 - ÁREAS PREFERENCIAIS DE EMPREGO DO AVALIADO
          </span>
          <div className="grid grid-cols-2 gap-2 text-[9px]">
            <div>• Funções de Comando e Direção de Unidades/Subunidades</div>
            <div>• Funções de Estado-Maior (Planeamento e Operações)</div>
            <div>• Ensino Militar e Instrução Técnica Especializada</div>
            <div>• Logística, Abastecimento e Material Bélico</div>
          </div>
        </div>

        {/* BLOCO 11 & BLOCO 12 */}
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          {/* Bloco 11: O Avaliado */}
          <div className="border border-black p-2 flex flex-col justify-between">
            <div>
              <span className="font-bold uppercase text-[9px] block bg-gray-100 p-1 mb-1 border-b border-black">
                BLOCO 11 - O AVALIADO (TOMADA DE CONHECIMENTO)
              </span>
              <p className="text-[9px]">
                {p.avaliado?.conhecimentoTomado
                  ? `O avaliado tomou conhecimento formal em ${formatDataPt(p.avaliado?.dataConhecimento)}, declarando que ${p.avaliado?.concordou ? 'CONCORDA' : 'DISCORDA'} com as notas atribuídas.`
                  : 'Tomada de conhecimento pendente de assinatura digital do militar avaliado.'}
              </p>
              {p.avaliado?.observacoesDiscordancia && (
                <p className="text-[8.5px] italic text-red-800 mt-1">
                  Fundamentação: {p.avaliado.observacoesDiscordancia}
                </p>
              )}
            </div>
            <div className="border-t border-black pt-1 text-[9px] font-mono flex justify-between mt-2">
              <span>{m?.posto} {m?.nomeCompleto}</span>
              <span>NIP {fai.militarNip}</span>
            </div>
          </div>

          {/* Bloco 12: Órgão de Pessoal DPQ */}
          <div className="border border-black p-2 flex flex-col justify-between">
            <div>
              <span className="font-bold uppercase text-[9px] block bg-gray-100 p-1 mb-1 border-b border-black">
                BLOCO 12 - O CHEFE DO ÓRGÃO DE PESSOAL E QUADROS (DPQ)
              </span>
              <p className="italic text-[9px] mt-0.5">
                {p.orgaoPessoal?.despacho || 'Homologado superiormente para integração e arquivamento no Processo Individual (PI) e publicação em Ordem de Serviço.'}
              </p>
            </div>
            <div className="border-t border-black pt-1 text-[9px] font-mono flex justify-between mt-2">
              <span>Chefe DPQ: {p.orgaoPessoal?.chefeNome || 'Ten-Cel. M. Pascoal'}</span>
              <span>Data: {formatDataPt(p.orgaoPessoal?.data)}</span>
            </div>
          </div>
        </div>

        {/* Security Watermark & Timestamp Footer */}
        <div className="text-center text-[8px] font-mono text-gray-500 pt-2 border-t border-gray-300">
          DOCUMENTO OFICIAL DAS FORÇAS ARMADAS ANGOLANAS • VALIDAÇÃO DIGITAL REGIMENTAL • CHAVE: {fai.id}-FAA-SEC
        </div>
      </div>
    </div>
  );
}
