export { FATORES_EXCLUIDOS_PRACAS } from './calculo-fai';

export interface NivelDescritivo {
  20: string;
  15: string;
  10: string;
  5: string;
}

export interface FatorDefinicao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  subitens?: string[];
  niveisPadrao?: NivelDescritivo;
  coeficienteOficialSargento: number;
  coeficientePraca: number;
  excluidoPracas: boolean;
  especial: boolean;
  grupo: 'TECNICO_PROFISSIONAL' | 'LIDERANCA_DISCIPLINA' | 'POTENCIAL_DESENVOLVIMENTO' | 'CONDICAO_GERAL';
}

export const FATORES_AVALIACAO: FatorDefinicao[] = [
  {
    id: 'F1',
    codigo: 'F1',
    nome: 'Integridade de Carácter',
    descricao: 'Considerar o comportamento do avaliado quanto à lealdade, honestidade e dignidade moral demonstrados nos actos de serviço, atenta a responsabilidade, consideração e confiança de que desfruta.',
    subitens: [
      'Lealdade à instituição, aos superiores e aos camaradas.',
      'Honestidade no cumprimento das funções e no tratamento das informações.',
      'Retidão de conduta nas ações dentro e fora do serviço.',
      'Confiança e discrição no tratamento de assuntos de serviço.',
    ],
    niveisPadrao: {
      20: 'Revela irrepreensível comportamento moral, sendo admirado e respeitado pelo reconhecimento nos seus actos de exemplo de lealdade, honestidade, firmeza e coerência nos seus actos.',
      15: 'Revela comportamentos morais sem reparos sendo leal, honesto, franco, firme e coerente nos seus actos, merecendo dos que o rodeiam consideração e respeitabilidade.',
      10: 'Revela comportamento moral não isento de censura, sendo visto pelos que o rodeiam com alguma indiferença e falta de respeitabilidade. Pouco rigoroso no culto da lealdade e honestidade, denunciando pouca firmeza e coerência nos seus actos.',
      5: 'Revela comportamento moral muito censurável, falta de firmeza, coerência, franqueza, lealdade e honestidade, o que provoca rejeição ou menos respeito dos que o rodeiam.',
    },
    coeficienteOficialSargento: 4,
    coeficientePraca: 4,
    excluidoPracas: false,
    especial: true,
    grupo: 'TECNICO_PROFISSIONAL',
  },
  {
    id: 'F2',
    codigo: 'F2',
    nome: 'Relações Humanas e Cooperação',
    descricao: 'Considerar o tacto, a cortesia, a sensibilidade para atender as opiniões, posições e necessidades alheias, a compreensão e prática da camaradagem, da solidariedade e da disponibilidade. Apreciar a participação e cooperação activas e harmoniosas no trabalho de grupo e no espírito de equipa.',
    subitens: [
      'Respeito pelos superiores, subordinados e colegas.',
      'Camaradagem e disponibilidade para apoiar os demais.',
      'Cooperação na execução das tarefas coletivas.',
      'Espírito de equipa, contribuindo para um ambiente harmonioso.',
    ],
    niveisPadrao: {
      20: 'Promove excelentes relações humanas viradas para a realização dos objectivos e para a valorização das pessoas no trabalho. Promove e dá cooperação valiosa, com dinamismo, disponibilidade e alto espírito de equipa, sendo um excelente elemento em trabalho de grupo.',
      15: 'Mantém no trabalho boas relações com os outros, procurando contribuir para a criação de um clima de compreensão e de participação. Coopera habitualmente de forma pronta, sendo normal a sua colaboração no trabalho de grupo e no desenvolvimento da camaradagem.',
      10: 'Revela dificuldades na manutenção de um nível satisfatório nas relações com os outros, daí resultando prejuízos para o bom clima humano e para o serviço. Nem sempre coopera de forma pronta, recusa-se ao trabalho em grupo e assume com frequência falta de compreensão na resolução dos problemas humanos.',
      5: 'Revela muitas dificuldades no relacionamento, prejudicando a eficiência do serviço. Indisponível para a cooperação, furtando-se ou fechando-se. Na resolução dos problemas de terceiros actua em primeiro lugar de acordo com os seus próprios interesses.',
    },
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: false,
    grupo: 'LIDERANCA_DISCIPLINA',
  },
  {
    id: 'F3',
    codigo: 'F3',
    nome: 'Autoconfiança e Autodomínio',
    descricao: 'Considerar a confiança em si próprio e a que inspira no trabalho, bem como a assunção determinada de riscos calculados indispensáveis. Apreciar a maturidade, a noção do valor real das suas possibilidades, que não devem ser sobrestimadas nem subestimadas, presença de espírito e o domínio das emoções, particularmente em situações não rotineiras.',
    subitens: [
      'Segurança na execução das suas funções.',
      'Controlo emocional perante situações de pressão ou dificuldade.',
      'Maturidade na tomada de decisões e no relacionamento com outros.',
      'Coragem e equilíbrio diante de situações imprevistas ou de risco.',
    ],
    niveisPadrao: {
      20: 'Consciente das suas possibilidades, actuando sempre com firmeza e sem hesitações. Mantém a sua disposição psíquica inalterada nas mais variadas circunstâncias. O seu autocontrolo permite-lhe manter rendimento óptimo das suas faculdades, incutindo total confiança e segurança.',
      15: 'Adequa as suas possibilidades ao que empreende, revelando serenidade, segurança e normal acerto nas decisões que toma. Revela autodomínio equilibrado e sem esforço.',
      10: 'Por vezes hesitante preferindo não se comprometer, por vezes ousado em excesso e extemporaneamente; nem sempre avalia correctamente as suas possibilidades. Autodomínio com flutuações, originando decisões incompletas. Oferece pouca confiança e segurança.',
      5: 'Tímido ou presunçoso, fruto de imaturidade. Avalia defeituosamente as suas possibilidades e perde as suas faculdades em situações não rotineiras. Age de acordo com impulsos momentâneos e sem medir as consequências dos seus actos. Não oferece confiança nem segurança.',
    },
    coeficienteOficialSargento: 4,
    coeficientePraca: 4,
    excluidoPracas: false,
    especial: false,
    grupo: 'TECNICO_PROFISSIONAL',
  },
  {
    id: 'F4',
    codigo: 'F4',
    nome: 'Iniciativa',
    descricao: 'Considerar a forma e qualidade de actuação, a capacidade de criar alternativas eficazes na execução das tarefas e a capacidade de resolução demonstrada quando as mesmas não estão pormenorizadas, ou quando surgem problemas novos ou imprevistos.',
    subitens: [
      'Antecipação de problemas relacionados com o serviço.',
      'Apresentação de soluções para dificuldades encontradas.',
      'Proatividade na execução das tarefas, sem depender constantemente de orientação.',
      'Capacidade de adaptação perante situações imprevistas.',
    ],
    niveisPadrao: {
      20: 'Muito criativo, age com espontânea facilidade, vivacidade e eficácia em qualquer tarefa da sua função mesmo em situações complexas e difíceis.',
      15: 'Desenvolve eficientemente as actividades da sua função e actua com facilidade em situações novas e imprevistas. Desembaraçado nas tarefas da sua função.',
      10: 'Por norma só actua em situações de rotina. É hesitante e temeroso em situações novas, carecendo muitas vezes de ajuda. Tem fraco desembaraço mental para as tarefas da sua função.',
      5: 'Age quase sempre passivamente; em situações novas ou imprevistas fica sempre inactivo aguardando que lhe indiquem a forma de actuar. Não tem o desembaraço mental necessário para o desempenho da maioria das tarefas inerentes à sua função.',
    },
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F5',
    codigo: 'F5',
    nome: 'Sentido do Dever e da Disciplina',
    descricao: 'Considerar a noção do cumprimento do dever, a capacidade de aceitação consciente das leis, normas e regulamentos militares, a apresentação e o aprumo. Apreciar a forma como exerce a autoridade e como cumpre as ordens e determinações relativas ao serviço.',
    subitens: [
      'Cumprimento das ordens legítimas recebidas.',
      'Observância das normas e regulamentos militares.',
      'Pontualidade e assiduidade no cumprimento do serviço.',
      'Responsabilidade e rigor na execução das tarefas atribuídas.',
    ],
    niveisPadrao: {
      20: 'Revela exemplar dedicação no cumprimento das suas tarefas, pratica a disciplina com sentido pedagógico de alta eficiência e procura esclarecer-se sobre o que lhe suscita dúvidas. Apresenta-se com aprumo e exerce a autoridade sóbria e eficientemente.',
      15: 'Realiza satisfatoriamente a maioria das tarefas de que é incumbido e cumpre normalmente os seus deveres, mantendo um bom nível de disciplina. Normalmente preocupa-se com a sua apresentação e atitude, causando impressão favorável.',
      10: 'É, por vezes, incorrecto na prática da disciplina, originando faltas de respeito ou de menor consideração e um nível disciplinar deficiente. Integra-se mal, com frequência, na hierarquia e de vez em quando não se preocupa com a sua aparência e atitude, diminuindo a sua eficiência e prestígio profissionais.',
      5: 'Não se preocupa com o estado disciplinar dos seus subordinados, não observando, com frequência, as normas regulamentares. Prepotente por natureza, só reconhece os seus direitos, mas não os seus deveres. Inadaptado à vida militar.',
    },
    coeficienteOficialSargento: 4,
    coeficientePraca: 4,
    excluidoPracas: false,
    especial: true,
    grupo: 'LIDERANCA_DISCIPLINA',
  },
  {
    id: 'F6',
    codigo: 'F6',
    nome: 'Poder de Comunicação',
    descricao: 'Considerar a aptidão para a comunicação revelada no desempenho das funções, tendo em conta os fins visados e os intervenientes e observada na simplicidade da forma, na clareza e precisão dos termos, na concisão, na facilidade de apresentação de ideias e de formulação de conceitos e numa correcta sequência da comunicação. Apreciar o poder de persuasão conseguido em acção formativa no trabalho.',
    subitens: [
      'Clareza na transmissão de informações.',
      'Precisão na exposição de ideias e informações de serviço.',
      'Capacidade de ouvir e compreender orientações e opiniões.',
      'Facilidade de expressão oral e escrita no contexto profissional.',
    ],
    niveisPadrao: {
      20: 'Revela extraordinária facilidade de comunicação e de apresentação de conceitos com qualidade no conteúdo e na forma. Exprime-se com muita clareza, precisão, concisão e sequência, sendo considerado muito persuasivo.',
      15: 'Revela razoável exposição quando conhecedor do assunto e possibilita na maioria das vezes a compreensão fácil dos seus conceitos, mesmo que feitos sob pressão, sendo normalmente persuasivo.',
      10: 'Revela dificuldades na comunicação de ideias que apresenta com fraca qualidade no conteúdo e na forma, dispersando-se frequentemente. A qualidade das suas intervenções diminui em condições de pressão ou extra-rotina.',
      5: 'Revela grandes dificuldades em comunicar ideias, que exprime de forma confusa e com vocabulário muito pobre. Incapaz de intervenções adequadas em situações que não sejam de rotina.',
    },
    coeficienteOficialSargento: 3,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F7',
    codigo: 'F7',
    nome: 'Dedicação e Empenho na Função',
    descricao: 'Considerar a disponibilidade, espírito de sacrifício e sentido de missão postos no serviço. Apreciar a forma como o avaliado executa as suas funções quanto ao empenhamento, entusiasmo e responsabilidade manifestados e os níveis quantitativo e qualitativo de realização atingidos.',
    subitens: [
      'Disponibilidade para cumprir as tarefas atribuídas.',
      'Dedicação e espírito de sacrifício no serviço.',
      'Qualidade na execução das atividades.',
      'Persistência e empenho na conclusão das tarefas.',
    ],
    niveisPadrao: {
      20: 'Revela excepcional interesse, prontidão e dedicação pelo serviço mesmo com sacrifícios pessoais. É conscientemente responsável, denotando um alto espírito de missão. A sua produtividade é excelente em qualidade e em quantidade.',
      15: 'Interessado e dedicado pelo serviço. Cumpre com gosto e sentido de responsabilidade as missões que lhe são confiadas. A quantidade e qualidade do trabalho desenvolvido satisfazem.',
      10: 'Denota pouca responsabilidade e pouco interesse pelo serviço. Desenvolve o trabalho em quantidade e/ou qualidade por vezes abaixo do aceitável.',
      5: 'Negligente e desinteressado pelo serviço, alheia-se das missões que lhe são atribuídas. Desenvolve trabalho em quantidade e/ou qualidade normalmente abaixo do mínimo exigível.',
    },
    coeficienteOficialSargento: 2,
    coeficientePraca: 2,
    excluidoPracas: false,
    especial: true,
    grupo: 'CONDICAO_GERAL',
  },
  {
    id: 'F8',
    codigo: 'F8',
    nome: 'Planeamento e Organização',
    descricao: 'Considerar a capacidade demonstrada na previsão dos problemas, no estabelecimento de planos e na organização das actividades, com especial destaque para a economia de meios, pessoal, equipamento e espaço, sem prejuízo dos resultados.',
    subitens: [
      'Capacidade de planear antecipadamente as atividades.',
      'Organização dos recursos e meios necessários para o serviço.',
      'Cumprimento das atividades de acordo com prioridades e prazos.',
      'Capacidade de organizar e controlar as tarefas sob sua responsabilidade.',
    ],
    niveisPadrao: {
      20: 'Capaz de prever e planear ao nível mais elevado. Muito boa capacidade de organização, obtendo resultados com hábil parcimónia e judiciosa utilização dos meios.',
      15: 'Cuidadoso e eficiente no planeamento, actua oportuna e adequadamente, fazendo uso económico dos meios; denota capacidade normal de organização.',
      10: 'Planeia, por vezes, sem a antecedência mínima compatível com as responsabilidades que detém. Usa os meios disponíveis de forma pouco satisfatória, denotando dificuldades na organização.',
      5: 'Actua mediante a intervenção de outrem, revelando previsão deficiente e incapacidade de organização com que obtém resultados insatisfatórios.',
    },
    coeficienteOficialSargento: 3,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F9',
    codigo: 'F9',
    nome: 'Aptidão Técnico-Profissional',
    descricao: 'Considerar a profundidade e amplitude dos conhecimentos profissionais directamente ligados ao rendimento obtido no desempenho das funções atribuídas e o grau de autonomia manifestada face à formação recebida, o esforço e interesse patenteados na valorização profissional e os resultados da actuação pedagógica.',
    subitens: [
      'Domínio dos conhecimentos técnicos necessários à função.',
      'Aplicação correta dos procedimentos profissionais.',
      'Qualidade e rigor na execução das tarefas.',
      'Capacidade de utilizar adequadamente materiais, equipamentos e ferramentas da função.',
    ],
    niveisPadrao: {
      20: 'Revela conhecimentos de excepcional qualidade e uma visão global muito boa das suas funções. Obtém na aprendizagem dos seus subordinados padrões nitidamente acima da média. Altamente interessado no desenvolvimento dos seus conhecimentos, revela total segurança das funções.',
      15: 'Revela conhecimentos profissionais razoáveis, que transmite aos seus subordinados de forma a atingirem padrões médios. Denota interesse na melhoria dos seus conhecimentos e segurança nas funções.',
      10: 'Revela algumas falhas nos conhecimentos profissionais, que não prejudicam as tarefas rotineiras. Os seus subordinados revelam alguns retrocessos. Necessita de ser acompanhado nas actividades mais exigentes.',
      5: 'Revela falta de conhecimentos essenciais para o desempenho das funções. Não consegue transmitir conhecimentos. Necessita de ser submetido a acções de instrução e treino.',
    },
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: true,
    grupo: 'TECNICO_PROFISSIONAL',
  },
  {
    id: 'F10',
    codigo: 'F10',
    nome: 'Julgamento',
    descricao: 'Considerar a aptidão em apreender problemas e/ou situações e de raciocinar para desenvolver soluções correctas e eficazes. Apreciar a forma como as diversas questões, em que os conhecimentos profissionais não dão soluções imediatas, são compreendidas, analisadas e resolvidas.',
    subitens: [
      'Capacidade de analisar corretamente uma situação.',
      'Identificação dos riscos e consequências antes de agir.',
      'Capacidade de distinguir o que é prioritário e relevante.',
      'Apresentação de apreciações e opiniões fundamentadas.',
    ],
    niveisPadrao: {
      20: 'Tira conclusões oportunas ajustadas, correctas e eficazes com segurança, precisão e rapidez, mesmo em assuntos muito complexos e em situações adversas.',
      15: 'Faz análises correctas e elabora propostas e recomendações fundamentadas, quase sempre oportunas e ajustadas.',
      10: 'Revela aptidão para avaliar os factores intervenientes de uma situação, apresentando propostas ou recomendações nem sempre ajustadas.',
      5: 'Sem noção das realidades e com muitas deficiências na análise dos factores intervenientes de uma situação, elabora propostas e recomendações frequentemente erradas.',
    },
    coeficienteOficialSargento: 4,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F11',
    codigo: 'F11',
    nome: 'Decisão',
    descricao: 'Considerar a capacidade para resolver com oportunidade, segurança, qualidade e sentido das responsabilidades as situações ou problemas, com particular destaque para as inerentes a funções de comando, direcção ou chefia.',
    subitens: [
      'Capacidade de tomar decisões oportunas.',
      'Segurança na tomada de decisão perante situações de pressão.',
      'Responsabilidade pelas decisões tomadas.',
      'Capacidade de escolher a solução mais adequada perante diferentes alternativas.',
    ],
    niveisPadrao: {
      20: 'Decide com rapidez, oportunidade e qualidade, mesmo em situações difíceis e complexas. Revela senso de bom entendimento e ponderação e utiliza muito bem a iniciativa concedida, assumindo sempre as suas responsabilidades.',
      15: 'Toma decisões normalmente acertadas e utiliza bem a iniciativa concedida em problemas de rotina, assumindo as suas responsabilidades. Revela normalmente senso e ponderação.',
      10: 'Toma decisões normalmente incompletas. Utiliza com dificuldade e fracos resultados a iniciativa concedida, nem sempre assumindo as suas responsabilidades.',
      5: 'Sistematicamente foge a decidir, sendo má a qualidade quando o faz. Não utiliza a iniciativa concedida. Avesso em assumir responsabilidades.',
    },
    coeficienteOficialSargento: 4,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: true,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F12',
    codigo: 'F12',
    nome: 'Condição Física',
    descricao: 'Considerar a disponibilidade e prontidão no serviço e a capacidade de resistência à fadiga e o poder de recuperação revelados no exercício das suas funções.',
    subitens: [
      'Demonstra resistência física adequada às exigências da função.',
      'Mantém boa preparação e aptidão física.',
      'Demonstra capacidade para realizar esforços físicos prolongados.',
      'Mantém hábitos compatíveis com a manutenção da capacidade física.',
    ],
    niveisPadrao: {
      20: 'Destaca-se pela total disponibilidade física para o serviço e pela resistência à fadiga, desempenhando sempre com vigor as suas funções.',
      15: 'Disponível, mostra a resistência física necessária ao desempenho cabal das funções.',
      10: 'Nem sempre está disponível, revelando, por vezes, debilidade física com prejuízo para o serviço.',
      5: 'Frequentemente indisponível, revela notória debilidade física para o exercício das funções.',
    },
    coeficienteOficialSargento: 2,
    coeficientePraca: 2,
    excluidoPracas: false,
    especial: true,
    grupo: 'CONDICAO_GERAL',
  },
  {
    id: 'F13',
    codigo: 'F13',
    nome: 'Cultura Geral',
    descricao: 'Considerar os conhecimentos extra-profissionais revelados com reflexos para as Forças Armadas.',
    subitens: [
      'Demonstra conhecimentos gerais sobre sociedade e atualidade.',
      'Possui capacidade de compreensão e interpretação de diferentes assuntos.',
      'Demonstra conhecimentos adequados de expressão oral e escrita.',
      'Procura manter-se informado e atualizado sobre assuntos relevantes.',
    ],
    niveisPadrao: {
      20: 'Excepcionais conhecimentos extra-profissionais em quantidade e qualidade, com uma muito boa visão global dos problemas, sendo particularmente admirado.',
      15: 'Revela dimensão média de conhecimentos, correspondendo ao padrão esperado sem se evidenciar em excesso.',
      10: 'Revela insuficiência de conhecimentos em muitas áreas, tendo uma visão global deficiente dos problemas.',
      5: 'Revela grande ignorância em vários domínios do saber e incapacidade de visão global dos problemas.',
    },
    coeficienteOficialSargento: 3,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: false,
    grupo: 'POTENCIAL_DESENVOLVIMENTO',
  },
  {
    id: 'F14',
    codigo: 'F14',
    nome: 'Cultura Geral Militar',
    descricao: 'Considerar os conhecimentos profissionais revelados e a sua potenciação para funções diversificadas.',
    subitens: [
      'Conhecimento dos princípios e valores militares.',
      'Conhecimento das normas, regulamentos e legislação militar aplicáveis.',
      'Conhecimento da organização e estrutura das Forças Armadas.',
      'Aplicação adequada dos conhecimentos militares no desempenho da função.',
    ],
    niveisPadrao: {
      20: 'Revela conhecimentos excepcionais em quantidade e qualidade, com reflexos muito positivos em termos de possibilidade de emprego e de eficácia.',
      15: 'Revela conhecimentos normais para o posto e especialidade, desempenhando com regularidade as suas obrigações doutrinárias.',
      10: 'Revela conhecimentos insuficientes em algumas áreas do saber militar, reduzindo a sua possibilidade de emprego.',
      5: 'Revela falta de conhecimentos na generalidade das áreas do saber militar, sendo muito limitada a possibilidade do seu emprego.',
    },
    coeficienteOficialSargento: 3,
    coeficientePraca: 0,
    excluidoPracas: true,
    especial: false,
    grupo: 'TECNICO_PROFISSIONAL',
  },
  {
    id: 'F15',
    codigo: 'F15',
    nome: 'Determinação e Perseverança',
    descricao: 'Considerar a força de vontade e a constância nas acções para consecução dos objectivos, não obstante as dificuldades.',
    subitens: [
      'Mantém firmeza e segurança no cumprimento das missões atribuídas.',
      'Demonstra coragem e serenidade mesmo diante de obstáculos.',
      'Persiste na execução da tarefa e procura alternativas perante dificuldades.',
      'Mantém o esforço, o empenho e o compromisso até alcançar os resultados pretendidos.',
    ],
    niveisPadrao: {
      20: 'Revela muito querer na consecução dos objectivos, não esmorecendo perante a exigência de esforços físicos ou intelectuais por mais fortes que sejam.',
      15: 'Revela força de vontade na acção, não se deixando vencer facilmente pelas dificuldades.',
      10: 'Revela falta de força de vontade para vencer situações não rotineiras, desinteressando-se face a obstáculos maiores.',
      5: 'Revela fraca força de vontade e constância, mesmo em situações de rotina, desanimando às primeiras dificuldades.',
    },
    coeficienteOficialSargento: 4,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: false,
    grupo: 'LIDERANCA_DISCIPLINA',
  },
  {
    id: 'F16',
    codigo: 'F16',
    nome: 'Adaptabilidade',
    descricao: 'Considerar a capacidade de ajustamento às mais variadas funções, tendo em atenção a conciliação das suas tendências com as obrigações e limitações daquelas advinientes.',
    subitens: [
      'Adapta-se adequadamente a novas situações e mudanças.',
      'Demonstra facilidade em assumir novas tarefas ou responsabilidades.',
      'Ajusta os seus métodos de trabalho perante situações imprevistas.',
      'Mantém o desempenho adequado em diferentes ambientes e condições de serviço.',
    ],
    niveisPadrao: {
      20: 'Revela excepcional capacidade de adaptação às variadas circunstâncias, mantendo elevado índice de produtividade.',
      15: 'Revela normal capacidade de adaptação a situações habituais e satisfatória reacção a situações não rotineiras.',
      10: 'Revela deficiente capacidade de adaptação a situações não rotineiras, reduzindo o seu potencial de trabalho e eficiência.',
      5: 'Revela grandes dificuldades de adaptação, com substancial redução da capacidade de trabalho e da eficiência.',
    },
    coeficienteOficialSargento: 3,
    coeficientePraca: 3,
    excluidoPracas: false,
    especial: false,
    grupo: 'CONDICAO_GERAL',
  },
];

export const NIVEIS_FATOR_OPCOES = [
  { valor: 5 as const, rotulo: 'Nível 5 - Insuficiente / Abaixo do Padrão', cor: 'text-red-700 bg-red-50 border-red-200' },
  { valor: 10 as const, rotulo: 'Nível 10 - Regular / Padrão Mínimo', cor: 'text-amber-700 bg-amber-50 border-amber-200' },
  { valor: 15 as const, rotulo: 'Nível 15 - Padrão Esperado', cor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { valor: 20 as const, rotulo: 'Nível 20 - Excelente / Acima do Padrão', cor: 'text-green-900 bg-green-100 border-green-300 font-bold' },
];

export const AREAS_EMPREGO_PREFERENCIA = [
  { id: 'comando', titulo: 'Comando e Direção de Unidades/Subunidades' },
  { id: 'estado_maior', titulo: 'Funções de Estado-Maior (Planeamento e Operações)' },
  { id: 'ensino', titulo: 'Ensino Militar e Instrução Técnica' },
  { id: 'logistica', titulo: 'Logística, Abastecimento e Material Bélico' },
  { id: 'transmissoes', titulo: 'Transmissões, Informática e Guerra Eletrónica' },
  { id: 'inteligencia', titulo: 'Informações e Reconhecimento Militar' },
  { id: 'saude', titulo: 'Serviços de Saúde e Assistência Médica' },
  { id: 'administracao', titulo: 'Recursos Humanos, Finanças e Administração Geral' },
];

export const POSTOS_MILITARES = [
  // Generais
  { id: 'GEN_EX', nome: 'General de Exército', categoria: 'OFICIAL' as const, sub: 'GENERAL' as const },
  { id: 'TEN_GEN', nome: 'Tenente-General', categoria: 'OFICIAL' as const, sub: 'GENERAL' as const },
  { id: 'BRIG', nome: 'Brigadeiro', categoria: 'OFICIAL' as const, sub: 'GENERAL' as const },
  // Oficiais Superiores
  { id: 'CEL', nome: 'Coronel', categoria: 'OFICIAL' as const, sub: 'SUPERIOR' as const },
  { id: 'TEN_CEL', nome: 'Tenente-Coronel', categoria: 'OFICIAL' as const, sub: 'SUPERIOR' as const },
  { id: 'MAJ', nome: 'Major', categoria: 'OFICIAL' as const, sub: 'SUPERIOR' as const },
  // Oficiais Subalternos
  { id: 'CAP', nome: 'Capitão', categoria: 'OFICIAL' as const, sub: 'SUBALTERNO' as const },
  { id: 'TEN', nome: 'Tenente', categoria: 'OFICIAL' as const, sub: 'SUBALTERNO' as const },
  { id: 'SUB_TEN', nome: 'Subtenente', categoria: 'OFICIAL' as const, sub: 'SUBALTERNO' as const },
  // Sargentos
  { id: 'SARG_CH', nome: 'Sargento-Chefe', categoria: 'SARGENTO' as const },
  { id: 'SARG_AJ', nome: 'Sargento-Ajudante', categoria: 'SARGENTO' as const },
  { id: '1_SARG', nome: '1º Sargento', categoria: 'SARGENTO' as const },
  { id: '2_SARG', nome: '2º Sargento', categoria: 'SARGENTO' as const },
  // Praças
  { id: '1_CABO', nome: '1º Cabo', categoria: 'PRACA' as const },
  { id: '2_CABO', nome: '2º Cabo', categoria: 'PRACA' as const },
  { id: 'SOLDADO', nome: 'Soldado', categoria: 'PRACA' as const },
];

export const ITENS_INTEGRIDADE = [
  { id: 'lealdade', titulo: 'Lealdade à instituição, aos superiores e aos camaradas', pontos: 5 },
  { id: 'honestidade', titulo: 'Honestidade no cumprimento das funções e no tratamento das informações', pontos: 5 },
  { id: 'retidao', titulo: 'Retidão de conduta nas ações dentro e fora do serviço', pontos: 5 },
  { id: 'confianca', titulo: 'Confiança e discrição no tratamento de assuntos de serviço', pontos: 5 },
];

export const ARMAS_SERVICOS = [
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

export const QUADROS_ESPECIAIS = [
  { sigla: 'QP', nome: 'Quadro Permanente' },
  { sigla: 'QC', nome: 'Quadro por Contrato' },
];

export const ETAPAS_WORKFLOW = [
  { id: 'AVALIADOR_1', titulo: '1º Avaliador', prazoDias: 10, descricao: 'Preenchimento e fundamentação inicial das notas regimentais.' },
  { id: 'AVALIADOR_2', titulo: '2º Avaliador', prazoDias: 5, descricao: 'Ratificação ou discordância fundamentada das notas.' },
  { id: 'CMDTE', titulo: 'Comandante U/E/O', prazoDias: 5, descricao: 'Despacho de comando e exercício do poder de substituição.' },
  { id: 'CONSELHO_ASC', titulo: 'Conselho da ASC', prazoDias: 5, descricao: 'Parecer técnico da Arma, Serviço ou Classe correspondente.' },
  { id: 'DPQ', titulo: 'Direcção de Pessoal e Quadros', prazoDias: 5, descricao: 'Homologação final, registo e encerramento do processo FAI.' },
];

