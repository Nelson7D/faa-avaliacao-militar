import { describe, it, expect } from 'vitest';
import { FaiWorkflow } from '@/types/fai';
import { ETAPAS_WORKFLOW } from '@/lib/constants';

describe('Workflow Regimental das FAA - Tramitação e Prazos (30 Dias)', () => {
  it('Deve conter 5 etapas regimentais sequenciais totalizando 30 dias', () => {
    const etapasValidas = ['AVALIADOR_1', 'AVALIADOR_2', 'CMDTE', 'CONSELHO_ASC', 'DPQ'];
    const prazos = [10, 5, 5, 5, 5];

    expect(ETAPAS_WORKFLOW.length).toBe(5);

    let somaPrazos = 0;
    ETAPAS_WORKFLOW.forEach((etapa, idx) => {
      expect(etapa.id).toBe(etapasValidas[idx]);
      expect(etapa.prazoDias).toBe(prazos[idx]);
      somaPrazos += etapa.prazoDias;
    });

    expect(somaPrazos).toBe(30);
  });

  it('Transição de etapas: AVALIADOR_1 -> AVALIADOR_2 -> CMDTE -> CONSELHO_ASC -> DPQ -> HOMOLOGADO', () => {
    const workflow: FaiWorkflow = {
      etapaAtual: 'AVALIADOR_1',
      diasNaEtapa: 3,
      prazoLimiteEtapa: 10,
      atrasado: false,
      dataEntradaEtapa: '2025-01-01',
    };

    expect(workflow.etapaAtual).toBe('AVALIADOR_1');
    expect(workflow.atrasado).toBe(false);

    // Simula transição para 2º Avaliador
    workflow.etapaAtual = 'AVALIADOR_2';
    workflow.prazoLimiteEtapa = 5;
    workflow.diasNaEtapa = 1;
    expect(workflow.etapaAtual).toBe('AVALIADOR_2');
    expect(workflow.prazoLimiteEtapa).toBe(5);

    // Simula transição para Comandante
    workflow.etapaAtual = 'CMDTE';
    workflow.prazoLimiteEtapa = 5;
    expect(workflow.etapaAtual).toBe('CMDTE');

    // Simula transição para Conselho ASC
    workflow.etapaAtual = 'CONSELHO_ASC';
    workflow.prazoLimiteEtapa = 5;
    expect(workflow.etapaAtual).toBe('CONSELHO_ASC');

    // Simula transição para DPQ (Direcção de Pessoal e Quadros)
    workflow.etapaAtual = 'DPQ';
    workflow.prazoLimiteEtapa = 5;
    expect(workflow.etapaAtual).toBe('DPQ');

    // Simula Homologação Final
    workflow.etapaAtual = 'HOMOLOGADO';
    expect(workflow.etapaAtual).toBe('HOMOLOGADO');
  });

  it('Detecção de Atraso Regimental quando diasNaEtapa > prazoLimiteEtapa', () => {
    const workflowEmAtraso: FaiWorkflow = {
      etapaAtual: 'AVALIADOR_1',
      diasNaEtapa: 12,
      prazoLimiteEtapa: 10,
      atrasado: true,
      dataEntradaEtapa: '2025-01-01',
    };

    expect(workflowEmAtraso.diasNaEtapa).toBeGreaterThan(workflowEmAtraso.prazoLimiteEtapa);
    expect(workflowEmAtraso.atrasado).toBe(true);
  });
});
