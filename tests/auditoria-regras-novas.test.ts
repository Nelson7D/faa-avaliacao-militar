import { describe, it, expect } from 'vitest';
import { calcularMediaRegimental, COEFICIENTES_OFICIAL_SARGENTO, COEFICIENTES_PRACA, FATORES_EXCLUIDOS_PRACAS } from '@/lib/calculo-fai';
import {
  ARMAS_SERVICOS,
  QUADROS_ESPECIAIS,
  POSTOS_MILITARES,
  ITENS_INTEGRIDADE,
  FATORES_AVALIACAO,
} from '@/lib/constants';
import {
  isSuperiorHierarquico,
  isSubordinado,
  canConsultarMilitar,
  canAvaliarMilitar,
  canAcessarFai,
  getPostoPrecedencia,
} from '@/lib/hierarchy';
import { Militar, CategoriaMilitar } from '@/types/militar';
import { UserProfile } from '@/context/auth-context';
import { FaiDocument, FaiBloco03Grelha } from '@/types/fai';
import { saveFaiDocument, criarAtribuicaoAvaliacao } from '@/services/firebase/firestore';

describe('Auditoria Regimental Profunda: Novos Requisitos FAA (/expert /deep /critic)', () => {
  // -------------------------------------------------------------------------
  // 1. CRITÉRIOS DE ENQUADRAMENTO DOS AVALIADOS (Postos, Divisores e Fatores)
  // -------------------------------------------------------------------------
  describe('1. Enquadramento por Posto e Divisores Regimentais (Manual VII EMG/FAA)', () => {
    it('OFICIAIS: Utiliza Divisor 52, avalia todos os 16 fatores incluindo F3, F8, F11, F14', () => {
      const grelha: FaiBloco03Grelha = {};
      for (let i = 1; i <= 16; i++) {
        grelha[`F${i}`] = { avaliador1: 15 };
      }

      const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');

      expect(res.divisor).toBe(52);
      expect(res.MP).toBe(15.0);
      expect(Object.keys(res.notasEfetivas)).toHaveLength(16);
      expect(res.notasEfetivas['F3']).toBe(15);
      expect(res.notasEfetivas['F8']).toBe(15);
      expect(res.notasEfetivas['F11']).toBe(15);
      expect(res.notasEfetivas['F14']).toBe(15);
    });

    it('SARGENTOS: Utiliza Divisor 52 e grelha plena de 16 fatores (Manual VII)', () => {
      const grelha: FaiBloco03Grelha = {};
      for (let i = 1; i <= 16; i++) {
        grelha[`F${i}`] = { avaliador1: 15 };
      }

      const res = calcularMediaRegimental('SARGENTO', grelha, 'avaliador1');

      expect(res.divisor).toBe(52);
      expect(res.MP).toBe(15.0);
      expect(Object.keys(res.notasEfetivas)).toHaveLength(16);
      expect(res.classificacao).toBe('SIGNIFICATIVAMENTE FAVORÁVEL');
    });

    it('PRAÇAS: Utiliza Divisor 31 e exclui os 6 fatores de comando/chefia (F6, F8, F10, F11, F13, F14)', () => {
      const grelha: FaiBloco03Grelha = {};
      for (let i = 1; i <= 16; i++) {
        grelha[`F${i}`] = { avaliador1: 15 };
      }

      const res = calcularMediaRegimental('PRACA', grelha, 'avaliador1');

      expect(res.divisor).toBe(31);
      expect(res.MP).toBe(15.0);
      expect(Object.keys(res.notasEfetivas)).toHaveLength(10);

      // Fatores de comando excluídos para praças
      FATORES_EXCLUIDOS_PRACAS.forEach((fId) => {
        expect(res.notasEfetivas[fId]).toBeUndefined();
      });

      // Fatores de execução mantidos
      expect(res.notasEfetivas['F1']).toBe(15);
      expect(res.notasEfetivas['F2']).toBe(15);
      expect(res.notasEfetivas['F3']).toBe(15);
      expect(res.notasEfetivas['F4']).toBe(15);
      expect(res.notasEfetivas['F5']).toBe(15);
      expect(res.notasEfetivas['F7']).toBe(15);
      expect(res.notasEfetivas['F9']).toBe(15);
      expect(res.notasEfetivas['F12']).toBe(15);
      expect(res.notasEfetivas['F15']).toBe(15);
      expect(res.notasEfetivas['F16']).toBe(15);
    });

    it('Conformidade Matemática dos Coeficientes: Soma Oficial/Sargento = 52 e Soma Praça = 31', () => {
      const somaOficiaisSargentos = Object.values(COEFICIENTES_OFICIAL_SARGENTO).reduce((a, b) => a + b, 0);
      const somaPracas = Object.values(COEFICIENTES_PRACA).reduce((a, b) => a + b, 0);

      expect(somaOficiaisSargentos).toBe(52);
      expect(somaPracas).toBe(31);

      // Verifica que na tabela de FATORES_AVALIACAO a soma de coeficientes de praças é também exatamente 31
      const somaPracaConstantes = FATORES_AVALIACAO.reduce((acc, f) => acc + (f.excluidoPracas ? 0 : f.coeficientePraca), 0);
      expect(somaPracaConstantes).toBe(31);
    });
  });

  // -------------------------------------------------------------------------
  // 2. ESPECIALIDADES MILITARES OFICIAIS (11 ARMAS E SERVIÇOS)
  // -------------------------------------------------------------------------
  describe('2. Validação das 11 Especialidades Oficiais das FAA', () => {
    const ESPECIALIDADES_ESPERADAS = [
      'Infantaria',
      'Artilharia',
      'Tanques',
      'Defesa Antiaérea (DAA)',
      'Engenharia Militar',
      'Inteligência Militar Operativa (IMO)',
      'Administração Militar (ADM)',
      'Justiça Militar',
      'Direção Oculta das Tropas (DOT)',
      'Educação Patriótica (EP)',
      'Técnica Auto Blindagem (TAB)',
    ];

    it('Deve contemplar rigorosamente as 11 especialidades oficiais especificadas', () => {
      expect(ARMAS_SERVICOS).toHaveLength(11);
      ESPECIALIDADES_ESPERADAS.forEach((esp) => {
        expect(ARMAS_SERVICOS).toContain(esp);
      });
    });

    it('Rejeita especialidades fictícias ou não homologadas nas FAA', () => {
      const especialidadeInvalida = 'Cavalaria Medieval';
      expect(ARMAS_SERVICOS.includes(especialidadeInvalida)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 3. TIPOS DE QUADRO (QP e QC)
  // -------------------------------------------------------------------------
  describe('3. Tipos de Quadro Regimental (QP e QC)', () => {
    it('Deve contemplar o Quadro Permanente (QP) e o Quadro por Contrato (QC)', () => {
      const siglas = QUADROS_ESPECIAIS.map((q) => q.sigla);
      expect(siglas).toContain('QP');
      expect(siglas).toContain('QC');
      expect(QUADROS_ESPECIAIS).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // 4. BLOCO DE INTEGRIDADE (4 ITENS DE 5 PTS = 20 PTS) E FACTOR NUCLEAR F1
  // -------------------------------------------------------------------------
  describe('4. Bloco de Integridade e Restrição Nuclear Inviolável (F1)', () => {
    it('Deve possuir 4 itens morais valendo 5 pontos cada, totalizando 20 pontos', () => {
      expect(ITENS_INTEGRIDADE).toHaveLength(4);
      let somaPontos = 0;
      ITENS_INTEGRIDADE.forEach((item) => {
        expect(item.pontos).toBe(5);
        somaPontos += item.pontos;
      });
      expect(somaPontos).toBe(20);

      const ids = ITENS_INTEGRIDADE.map((i) => i.id);
      expect(ids).toContain('lealdade');
      expect(ids).toContain('honestidade');
      expect(ids).toContain('retidao');
      expect(ids).toContain('confianca');
    });

    it('RESTRIÇÃO ESTRITA: Se F1 < 15, a avaliação DEVE ser DESFAVORÁVEL mesmo com MP altíssima (19.23)', () => {
      // Cria grelha onde TODOS os fatores F2 a F16 têm nota máxima 20, mas F1 tem nota 10
      const grelha: FaiBloco03Grelha = {};
      for (let i = 1; i <= 16; i++) {
        grelha[`F${i}`] = { avaliador1: 20 };
      }
      grelha['F1'] = { avaliador1: 10 }; // F1 Integridade < 15

      const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');

      // Média calculada é 19.23 (muito alta)
      expect(res.MP).toBeGreaterThan(19.0);
      // RESTRIÇÃO REGIMENTAL: F1 é factor nuclear, logo DEVE ser DESFAVORÁVEL
      expect(res.classificacao).toBe('DESFAVORÁVEL');
      expect(res.motivoClassificacao).toContain('fator nuclear obrigatório');
    });

    it('RESTRIÇÃO ESTRITA: Se F1 = 5, avaliação é DESFAVORÁVEL', () => {
      const grelha: FaiBloco03Grelha = {};
      for (let i = 1; i <= 16; i++) {
        grelha[`F${i}`] = { avaliador1: 15 };
      }
      grelha['F1'] = { avaliador1: 5 }; // Insuficiente em integridade

      const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');
      expect(res.classificacao).toBe('DESFAVORÁVEL');
    });

    it('CONFORMIDADE: Se F1 >= 15 e todos os fatores >= 15 com MP >= 15, classifica como SIGNIFICATIVAMENTE FAVORÁVEL', () => {
      const grelha: FaiBloco03Grelha = {};
      for (let i = 1; i <= 16; i++) {
        grelha[`F${i}`] = { avaliador1: 15 };
      }
      grelha['F1'] = { avaliador1: 20 }; // Integridade máxima

      const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');
      expect(res.classificacao).toBe('SIGNIFICATIVAMENTE FAVORÁVEL');
    });
  });

  // -------------------------------------------------------------------------
  // 5. RESTRIÇÕES HIERÁRQUICAS E DE ACESSO (CASOS NEGATIVOS QUE DEVEM FALHAR)
  // -------------------------------------------------------------------------
  describe('5. Restrições Hierárquicas e Bloqueios Estritos', () => {
    const general: Militar = {
      nip: '00000001',
      bi: '0001LA01',
      nomeCompleto: 'General Chefe',
      nomeGuerra: 'Chefe',
      posto: 'General de Exército',
      categoria: 'OFICIAL',
      subcategoria: 'GENERAL',
      unidade: 'EMG',
      orgao: 'EMG',
      funcaoDesempenhada: 'Chefe do Estado-Maior',
      asc: 'Infantaria',
      qe: 'QP',
      dataNascimento: '1960-01-01',
      naturalidade: 'Luanda',
      filiacao: 'Pai e Mãe',
      dataIngresso: '1980-01-01',
      tempoServicoAnos: 45,
      feridoEmServico: false,
      habilitacoesLiterarias: 'Doutoramento',
      estadoCivil: 'Casado',
      idiomas: 'Português',
      morada: 'Luanda',
      contacto: '923000000',
      situacao: 'ACTIVO',
    };

    const capitao: Militar = {
      ...general,
      nip: '22220002',
      nomeCompleto: 'Capitão Avaliador',
      posto: 'Capitão',
      subcategoria: 'SUBALTERNO',
      unidade: 'Regimento de Infantaria',
      orgao: 'Exército',
    };

    const tenente: Militar = {
      ...general,
      nip: '33330003',
      nomeCompleto: 'Tenente Subordinado',
      posto: 'Tenente',
      subcategoria: 'SUBALTERNO',
      unidade: 'Regimento de Infantaria',
      orgao: 'Exército',
    };

    const soldado: Militar = {
      ...general,
      nip: '55550005',
      nomeCompleto: 'Soldado Avaliado',
      posto: 'Soldado',
      categoria: 'PRACA',
      subcategoria: undefined,
      unidade: 'Regimento de Infantaria',
      orgao: 'Exército',
    };

    it('RESTRIÇÃO ESTRITA: Subordinado NUNCA pode avaliar Superior (Tenente -> Capitão, Soldado -> Tenente)', () => {
      const userTenente: UserProfile = {
        uid: 'u-tenente',
        email: 'ten@faa.ao',
        nip: tenente.nip,
        nomeCompleto: tenente.nomeCompleto,
        posto: tenente.posto,
        unidade: tenente.unidade,
        categoria: 'OFICIAL',
        role: 'AVALIADOR_1',
      };

      const userSoldado: UserProfile = {
        uid: 'u-soldado',
        email: 'sol@faa.ao',
        nip: soldado.nip,
        nomeCompleto: soldado.nomeCompleto,
        posto: soldado.posto,
        unidade: soldado.unidade,
        categoria: 'PRACA',
        role: 'MILITAR_AVALIADO',
      };

      // Tenente tentando avaliar Capitão -> DEVE RESTRINGIR
      expect(canAvaliarMilitar(userTenente, capitao)).toBe(false);
      // Soldado tentando avaliar Tenente -> DEVE RESTRINGIR
      expect(canAvaliarMilitar(userSoldado, tenente)).toBe(false);
      // Capitão tentando avaliar General -> DEVE RESTRINGIR
      const userCapitao: UserProfile = { ...userTenente, nip: capitao.nip, posto: capitao.posto };
      expect(canAvaliarMilitar(userCapitao, general)).toBe(false);
    });

    it('RESTRIÇÃO ESTRITA: Não é permitida AUTO-AVALIAÇÃO (Militar avaliando o próprio NIP)', () => {
      const userCapitao: UserProfile = {
        uid: 'u-capitao',
        email: 'cap@faa.ao',
        nip: capitao.nip,
        nomeCompleto: capitao.nomeCompleto,
        posto: capitao.posto,
        unidade: capitao.unidade,
        categoria: 'OFICIAL',
        role: 'AVALIADOR_1',
      };

      // Capitão tentando avaliar Capitão (ele mesmo) -> DEVE RESTRINGIR
      expect(canAvaliarMilitar(userCapitao, capitao)).toBe(false);
    });

    it('RESTRIÇÃO ESTRITA: Militares do mesmo posto (pares) não podem avaliar-se mutuamente', () => {
      const capitao2: Militar = { ...capitao, nip: '22220003', nomeCompleto: 'Outro Capitão' };
      const userCapitao: UserProfile = {
        uid: 'u-capitao',
        email: 'cap@faa.ao',
        nip: capitao.nip,
        nomeCompleto: capitao.nomeCompleto,
        posto: capitao.posto,
        unidade: capitao.unidade,
        categoria: 'OFICIAL',
        role: 'AVALIADOR_1',
      };

      expect(canAvaliarMilitar(userCapitao, capitao2)).toBe(false);
    });

    it('RESTRIÇÃO ESTRITA: Subordinado NUNCA pode aceder ou consultar a FAI do seu Superior', () => {
      const userTenente: UserProfile = {
        uid: 'u-tenente',
        email: 'ten@faa.ao',
        nip: tenente.nip,
        nomeCompleto: tenente.nomeCompleto,
        posto: tenente.posto,
        unidade: tenente.unidade,
        categoria: 'OFICIAL',
        role: 'AVALIADOR_1',
      };

      const faiCapitao: FaiDocument = {
        id: 'FAI-2025-22220002',
        militarNip: capitao.nip,
        militar: capitao,
        anoInstrucao: '2025/2026',
        periodoInicio: '2025-01-01',
        periodoFim: '2025-12-31',
        tipo: 'PERIODICA',
        grelha: {},
        mediaPonderada: 16.0,
        divisor: 52,
        classificacao: 'FAVORÁVEL',
        pareceres: {},
        preferenciasEmprego: {},
        workflow: {
          etapaAtual: 'AVALIADOR_1',
          diasNaEtapa: 1,
          prazoLimiteEtapa: 10,
          atrasado: false,
          dataEntradaEtapa: '2025-01-01',
        },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      };

      expect(canAcessarFai(userTenente, faiCapitao)).toBe(false);
      expect(canConsultarMilitar(userTenente, capitao)).toBe(false);
    });

    it('RESTRIÇÃO ESTRITA: Militar Avaliado comum não pode aceder a processos de outros militares', () => {
      const userSoldado: UserProfile = {
        uid: 'u-soldado',
        email: 'sol@faa.ao',
        nip: soldado.nip,
        nomeCompleto: soldado.nomeCompleto,
        posto: soldado.posto,
        unidade: soldado.unidade,
        categoria: 'PRACA',
        role: 'MILITAR_AVALIADO',
      };

      const outroSoldado: Militar = { ...soldado, nip: '55550006', nomeCompleto: 'Outro Soldado' };
      const faiOutroSoldado: FaiDocument = {
        id: 'FAI-2025-55550006',
        militarNip: outroSoldado.nip,
        militar: outroSoldado,
        anoInstrucao: '2025/2026',
        periodoInicio: '2025-01-01',
        periodoFim: '2025-12-31',
        tipo: 'PERIODICA',
        grelha: {},
        mediaPonderada: 15.0,
        divisor: 31,
        classificacao: 'FAVORÁVEL',
        pareceres: {},
        preferenciasEmprego: {},
        workflow: {
          etapaAtual: 'AVALIADOR_1',
          diasNaEtapa: 1,
          prazoLimiteEtapa: 10,
          atrasado: false,
          dataEntradaEtapa: '2025-01-01',
        },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      };

      expect(canAcessarFai(userSoldado, faiOutroSoldado)).toBe(false);
      expect(canConsultarMilitar(userSoldado, outroSoldado)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 6. VALIDAÇÃO DE SERVIÇOS E PERSISTÊNCIA (saveFaiDocument e criarAtribuicao)
  // -------------------------------------------------------------------------
  describe('6. Validação de Integridade na Camada de Dados (Firestore)', () => {
    it('saveFaiDocument deve aceitar OFICIAL, SARGENTO e PRACA', async () => {
      const mockFaiOficial: FaiDocument = {
        id: 'FAI-TEST-OFICIAL',
        militarNip: '11112222',
        militar: {
          nip: '11112222',
          bi: '001LA',
          nomeCompleto: 'Capitão Teste',
          nomeGuerra: 'Teste',
          posto: 'Capitão',
          categoria: 'OFICIAL',
          unidade: 'QG',
          funcaoDesempenhada: 'Oficial',
          asc: 'Infantaria',
          qe: 'QP',
          tempoServicoAnos: 10,
          feridoEmServico: false,
          situacao: 'ACTIVO',
        } as Militar,
        anoInstrucao: '2025/2026',
        periodoInicio: '2025-01-01',
        periodoFim: '2025-12-31',
        tipo: 'PERIODICA',
        grelha: {},
        mediaPonderada: 15.0,
        divisor: 52,
        classificacao: 'FAVORÁVEL',
        pareceres: {},
        preferenciasEmprego: {},
        workflow: {
          etapaAtual: 'AVALIADOR_1',
          diasNaEtapa: 0,
          prazoLimiteEtapa: 10,
          atrasado: false,
          dataEntradaEtapa: '2025-01-01',
        },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      };

      // Deve passar sem lançar erro
      await expect(saveFaiDocument(mockFaiOficial)).resolves.toBeDefined();

      const mockFaiSargento: FaiDocument = {
        ...mockFaiOficial,
        id: 'FAI-TEST-SARGENTO',
        militar: { ...mockFaiOficial.militar!, posto: '1º Sargento', categoria: 'SARGENTO' },
      };
      await expect(saveFaiDocument(mockFaiSargento)).resolves.toBeDefined();

      const mockFaiPraca: FaiDocument = {
        ...mockFaiOficial,
        id: 'FAI-TEST-PRACA',
        divisor: 31,
        militar: { ...mockFaiOficial.militar!, posto: 'Soldado', categoria: 'PRACA' },
      };
      await expect(saveFaiDocument(mockFaiPraca)).resolves.toBeDefined();
    });

    it('saveFaiDocument deve REJEITAR categoria militar inválida com exceção explícita', async () => {
      const mockFaiInvalida: any = {
        id: 'FAI-TEST-INVALID',
        militarNip: '99999999',
        militar: {
          nip: '99999999',
          posto: 'Funcionario Civil',
          categoria: 'CIVIL_NAO_MILITAR',
        },
        anoInstrucao: '2025/2026',
      };

      await expect(saveFaiDocument(mockFaiInvalida)).rejects.toThrow(
        /Categoria 'CIVIL_NAO_MILITAR' inválida para avaliação regimental/
      );
    });

    it('criarAtribuicaoAvaliacao deve REJEITAR auto-avaliação', async () => {
      const atribuicaoAutoAval: any = {
        anoInstrucao: '2025/2026',
        militarAvaliadoNip: '11110001',
        militarAvaliadoNome: 'Major Silva',
        militarAvaliadoPosto: 'Major',
        militarAvaliadoCategoria: 'OFICIAL',
        numeroAvaliadores: 2,
        ultimoAvaliador: 'avaliador2',
        avaliador1Nip: '11110001', // Mesmo NIP do avaliado!
        avaliador1Nome: 'Major Silva',
        avaliador1Posto: 'Major',
        criadoPorNip: '00000002',
        criadoPorNome: 'DPQ',
      };

      await expect(criarAtribuicaoAvaliacao(atribuicaoAutoAval)).rejects.toThrow(
        /Não é permitida auto-avaliação no processo regimental/
      );
    });

    it('criarAtribuicaoAvaliacao deve REJEITAR avaliador subordinado ao militar avaliado', async () => {
      const atribuicaoSubordinado: any = {
        anoInstrucao: '2025/2026',
        militarAvaliadoNip: '11110001',
        militarAvaliadoNome: 'Major Silva',
        militarAvaliadoPosto: 'Major',
        militarAvaliadoCategoria: 'OFICIAL',
        numeroAvaliadores: 2,
        ultimoAvaliador: 'avaliador2',
        avaliador1Nip: '33330003',
        avaliador1Nome: 'Tenente Gomes',
        avaliador1Posto: 'Tenente', // Tenente é subordinado a Major!
        criadoPorNip: '00000002',
        criadoPorNome: 'DPQ',
      };

      await expect(criarAtribuicaoAvaliacao(atribuicaoSubordinado)).rejects.toThrow(
        /Violação hierárquica. O 1º Avaliador \(Tenente\) é subordinado ao militar avaliado \(Major\)/
      );
    });
  });

  // -------------------------------------------------------------------------
  // 7. DETECÇÃO DE INCOERÊNCIAS REGIMENTAIS
  // -------------------------------------------------------------------------
  describe('7. Detecção de Incoerências Regimentais', () => {
    it('Detecta incoerência grave: Nível 20 em F11 (Decisão) com Nível 5 em F10 (Julgamento)', () => {
      const grelha: FaiBloco03Grelha = {
        F1: { avaliador1: 15 },
        F10: { avaliador1: 5 },
        F11: { avaliador1: 20 },
      };

      const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');
      expect(res.incoerenciasDetectadas).toBeDefined();
      expect(res.incoerenciasDetectadas!.some((msg) => msg.includes('Incoerência grave: Nível 20 em F11'))).toBe(true);
    });

    it('Detecta incoerência: Integridade Máxima (F1=20) associada a Indisciplina (F5=5)', () => {
      const grelha: FaiBloco03Grelha = {
        F1: { avaliador1: 20 },
        F5: { avaliador1: 5 },
      };

      const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');
      expect(res.incoerenciasDetectadas).toBeDefined();
      expect(res.incoerenciasDetectadas!.some((msg) => msg.includes('Integridade Máxima (F1=20)'))).toBe(true);
    });

    it('Avaliação Coerente: Não dispara alertas falsos de incoerência', () => {
      const grelha: FaiBloco03Grelha = {
        F1: { avaliador1: 15 },
        F5: { avaliador1: 15 },
        F10: { avaliador1: 15 },
        F11: { avaliador1: 15 },
      };

      const res = calcularMediaRegimental('OFICIAL', grelha, 'avaliador1');
      expect(res.incoerenciasDetectadas).toHaveLength(0);
    });
  });
});
