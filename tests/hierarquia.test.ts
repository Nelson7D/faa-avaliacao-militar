import { describe, it, expect } from 'vitest';
import {
  getPostoPrecedencia,
  isSuperiorHierarquico,
  isSubordinado,
  canConsultarMilitar,
  canAvaliarMilitar,
  canAcessarFai,
} from '@/lib/hierarchy';
import { Militar } from '@/types/militar';
import { UserProfile } from '@/context/auth-context';
import { FaiDocument } from '@/types/fai';

describe('Conformidade Hierárquica e Regimental FAA', () => {
  // Mock dos Militares
  const majorSilva: Militar = {
    nip: '11110001',
    bi: '001111111LA011',
    nomeCompleto: 'António Silva',
    nomeGuerra: 'Silva',
    posto: 'Major',
    categoria: 'OFICIAL',
    subcategoria: 'SUPERIOR',
    unidade: 'Comando de Transmissões',
    orgao: 'Estado-Maior',
    funcaoDesempenhada: 'Oficial de Operações',
    asc: 'Transmissões e Informática',
    qe: 'QP',
    dataNascimento: '1980-05-12',
    naturalidade: 'Luanda',
    filiacao: 'Manuel Silva e Maria Silva',
    dataIngresso: '2000-01-15',
    tempoServicoAnos: 25,
    feridoEmServico: false,
    habilitacoesLiterarias: 'Licenciatura em Ciências Militares',
    estadoCivil: 'Casado',
    idiomas: 'Português, Inglês',
    morada: 'Luanda',
    contacto: '923000001',
    situacao: 'ACTIVO',
  };

  const capitaoSousa: Militar = {
    ...majorSilva,
    nip: '22220002',
    nomeCompleto: 'João Sousa',
    nomeGuerra: 'Sousa',
    posto: 'Capitão',
    subcategoria: 'SUBALTERNO',
    funcaoDesempenhada: 'Comandante de Companhia',
  };

  const tenenteGomes: Militar = {
    ...majorSilva,
    nip: '33330003',
    nomeCompleto: 'Paulo Gomes',
    nomeGuerra: 'Gomes',
    posto: 'Tenente',
    subcategoria: 'SUBALTERNO',
    funcaoDesempenhada: 'Comandante de Pelotão',
  };

  const caboManuel: Militar = {
    ...majorSilva,
    nip: '44440004',
    nomeCompleto: 'Pedro Manuel',
    nomeGuerra: 'Manuel',
    posto: '1º Cabo',
    categoria: 'PRACA',
    subcategoria: undefined,
    funcaoDesempenhada: 'Operador de Rádio',
  };

  const soldadoKiala: Militar = {
    ...majorSilva,
    nip: '55550005',
    nomeCompleto: 'Kiala Daniel',
    nomeGuerra: 'Daniel',
    posto: 'Soldado',
    categoria: 'PRACA',
    subcategoria: undefined,
    funcaoDesempenhada: 'Apontador',
  };

  const soldadoDpqSecao: Militar = {
    ...majorSilva,
    nip: '66660006',
    nomeCompleto: 'Mateus Pessoal',
    nomeGuerra: 'Mateus',
    posto: 'Soldado',
    categoria: 'PRACA',
    subcategoria: undefined,
    orgao: 'DPQ',
    unidade: 'Direção de Pessoal e Quadros',
    funcaoDesempenhada: 'Auxiliar da Secção de Pessoal',
  };

  describe('1. Precedência e Ordenamento Hierárquico das FAA', () => {
    it('Major (índice 5) é superior a Capitão (índice 6) e Tenente (índice 7)', () => {
      expect(isSuperiorHierarquico('Major', 'Capitão')).toBe(true);
      expect(isSuperiorHierarquico('Major', 'Tenente')).toBe(true);
      expect(isSuperiorHierarquico('Major', 'Soldado')).toBe(true);
    });

    it('Capitão é superior a Tenente e Soldado, mas subordinado a Major', () => {
      expect(isSuperiorHierarquico('Capitão', 'Tenente')).toBe(true);
      expect(isSuperiorHierarquico('Capitão', 'Soldado')).toBe(true);
      expect(isSuperiorHierarquico('Capitão', 'Major')).toBe(false);
      expect(isSubordinado('Capitão', 'Major')).toBe(true);
    });

    it('Tenente é subordinado a Capitão e Major', () => {
      expect(isSuperiorHierarquico('Tenente', 'Capitão')).toBe(false);
      expect(isSuperiorHierarquico('Tenente', 'Major')).toBe(false);
      expect(isSubordinado('Tenente', 'Capitão')).toBe(true);
      expect(isSubordinado('Tenente', 'Major')).toBe(true);
    });
  });

  describe('2. Acesso dos Avaliadores de Acordo com a Hierarquia (Ponto 2)', () => {
    it('Capitão pode consultar Tenente e Soldado sob sua responsabilidade', () => {
      const userCapitao: UserProfile = {
        uid: 'user-capitao',
        email: 'sousa@faa.ao',
        nip: capitaoSousa.nip,
        nomeCompleto: capitaoSousa.nomeCompleto,
        nomeGuerra: capitaoSousa.nomeGuerra,
        posto: 'Capitão',
        unidade: capitaoSousa.unidade,
        funcaoDesempenhada: capitaoSousa.funcaoDesempenhada,
        categoria: 'OFICIAL',
        role: 'AVALIADOR_1',
      };

      expect(canConsultarMilitar(userCapitao, tenenteGomes)).toBe(true);
      expect(canConsultarMilitar(userCapitao, soldadoKiala)).toBe(true);
    });

    it('Capitão NÃO pode consultar Major (superior hierárquico)', () => {
      const userCapitao: UserProfile = {
        uid: 'user-capitao',
        email: 'sousa@faa.ao',
        nip: capitaoSousa.nip,
        nomeCompleto: capitaoSousa.nomeCompleto,
        nomeGuerra: capitaoSousa.nomeGuerra,
        posto: 'Capitão',
        unidade: capitaoSousa.unidade,
        funcaoDesempenhada: capitaoSousa.funcaoDesempenhada,
        categoria: 'OFICIAL',
        role: 'AVALIADOR_1',
      };

      expect(canConsultarMilitar(userCapitao, majorSilva)).toBe(false);
    });

    it('Tenente NÃO pode consultar Capitão ou Major', () => {
      const userTenente: UserProfile = {
        uid: 'user-tenente',
        email: 'gomes@faa.ao',
        nip: tenenteGomes.nip,
        nomeCompleto: tenenteGomes.nomeCompleto,
        nomeGuerra: tenenteGomes.nomeGuerra,
        posto: 'Tenente',
        unidade: tenenteGomes.unidade,
        funcaoDesempenhada: tenenteGomes.funcaoDesempenhada,
        categoria: 'OFICIAL',
        role: 'AVALIADOR_1',
      };

      expect(canConsultarMilitar(userTenente, capitaoSousa)).toBe(false);
      expect(canConsultarMilitar(userTenente, majorSilva)).toBe(false);
    });
  });

  describe('3. Chefe do Pessoal e Quadro (DPQ - Ponto 1)', () => {
    const userDpq: UserProfile & { orgao: string } = {
      uid: 'user-dpq',
      email: 'dpq@faa.ao',
      nip: '00000002',
      nomeCompleto: 'Coronel Chefe DPQ',
      nomeGuerra: 'Chefe DPQ',
      posto: 'Coronel',
      unidade: 'Direção de Pessoal e Quadros',
      orgao: 'DPQ',
      funcaoDesempenhada: 'Chefe do Pessoal e Quadros',
      categoria: 'OFICIAL',
      role: 'DPQ',
    };

    it('DPQ pode consultar qualquer militar para fins de gestão de efetivo geral', () => {
      expect(canConsultarMilitar(userDpq, soldadoKiala)).toBe(true);
      expect(canConsultarMilitar(userDpq, capitaoSousa)).toBe(true);
      expect(canConsultarMilitar(userDpq, majorSilva)).toBe(true);
    });

    it('DPQ NÃO avalia por regra soldados comuns de outras unidades/secções', () => {
      expect(canAvaliarMilitar(userDpq, soldadoKiala)).toBe(false);
      expect(canAvaliarMilitar(userDpq, caboManuel)).toBe(false);
    });

    it('DPQ PODE avaliar subordinados diretos da sua própria secção/órgão de pessoal', () => {
      expect(canAvaliarMilitar(userDpq, soldadoDpqSecao)).toBe(true);
    });
  });

  describe('4. Primeiro Avaliador (Ponto 3)', () => {
    const userAval1: UserProfile = {
      uid: 'user-aval1',
      email: 'capitao@faa.ao',
      nip: capitaoSousa.nip,
      nomeCompleto: capitaoSousa.nomeCompleto,
      nomeGuerra: capitaoSousa.nomeGuerra,
      posto: 'Capitão',
      unidade: capitaoSousa.unidade,
      funcaoDesempenhada: capitaoSousa.funcaoDesempenhada,
      categoria: 'OFICIAL',
      role: 'AVALIADOR_1',
    };

    it('Pode avaliar praça subordinada direta', () => {
      expect(canAvaliarMilitar(userAval1, soldadoKiala)).toBe(true);
      expect(canAvaliarMilitar(userAval1, caboManuel)).toBe(true);
    });

    it('NÃO pode avaliar outro oficial ou superior', () => {
      expect(canAvaliarMilitar(userAval1, tenenteGomes)).toBe(false); // Tenente é oficial (apenas Praças são avaliadas)
      expect(canAvaliarMilitar(userAval1, majorSilva)).toBe(false);
    });
  });

  describe('5. Acesso do Militar Avaliado (Ponto 4)', () => {
    const userCabo: UserProfile = {
      uid: 'user-cabo',
      email: 'cabo@faa.ao',
      nip: caboManuel.nip,
      nomeCompleto: caboManuel.nomeCompleto,
      nomeGuerra: caboManuel.nomeGuerra,
      posto: '1º Cabo',
      unidade: caboManuel.unidade,
      funcaoDesempenhada: caboManuel.funcaoDesempenhada,
      categoria: 'PRACA',
      role: 'MILITAR_AVALIADO',
    };

    const mockFaiCabo: FaiDocument = {
      id: 'FAI-2025-44440004',
      militarNip: caboManuel.nip,
      militar: caboManuel,
      anoInstrucao: '2025/2026',
      periodoInicio: '2025-01-01',
      periodoFim: '2025-12-31',
      tipo: 'PERIODICA',
      grelha: {},
      mediaPonderada: 16.5,
      divisor: 31,
      classificacao: 'FAVORÁVEL',
      pareceres: {},
      preferenciasEmprego: {},
      workflow: {
        etapaAtual: 'AVALIADOR_1',
        diasNaEtapa: 2,
        prazoLimiteEtapa: 10,
        atrasado: false,
        dataEntradaEtapa: '2025-02-01',
      },
      createdAt: '2025-02-01',
      updatedAt: '2025-02-01',
    };

    const mockFaiSoldado: FaiDocument = {
      ...mockFaiCabo,
      id: 'FAI-2025-55550005',
      militarNip: soldadoKiala.nip,
      militar: soldadoKiala,
    };

    it('Militar Avaliado PODE consultar o seu próprio dossiê e sua própria FAI', () => {
      expect(canConsultarMilitar(userCabo, caboManuel)).toBe(true);
      expect(canAcessarFai(userCabo, mockFaiCabo)).toBe(true);
    });

    it('Militar Avaliado NÃO pode consultar dossiê ou FAI de outros militares', () => {
      expect(canConsultarMilitar(userCabo, soldadoKiala)).toBe(false);
      expect(canConsultarMilitar(userCabo, majorSilva)).toBe(false);
      expect(canAcessarFai(userCabo, mockFaiSoldado)).toBe(false);
    });
  });
});
