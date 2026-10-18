export interface Scenario {
  id: string;
  procedure: string;
  patientQuestion: string;
  izaResponse: {
    message: string;
    audioNote: string;
    roonesInsight: {
      reason: string;
      scenarios: Array<{ condition: string; action: string }>;
      strategicTip: string;
    };
    vertusInsight?: {
      reason: string;
      scenarios: Array<{ condition: string; action: string }>;
      strategicTip: string;
    };
  };
}

export interface ObjectionItem {
  id: string;
  code: string;
  title: string;
  hiddenMotive: string;
  scripts: {
    rapport: string;
    consultiva: string;
    autoridade: string;
    sintese: string;
  };
}

export interface ComparisonItem {
  criterion: string;
  withoutIza: string;
  withIza: string;
}

export interface PillarItem {
  number: string;
  name: string;
  description: string;
  benefit: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  city: string;
  quote: string;
  metric: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'scen-1',
    procedure: 'Botox / Toxina Botulínica',
    patientQuestion: 'Quanto custa a aplicação de botox no rosto todo?',
    izaResponse: {
      message: 'Olá! Que bom ter você aqui. A toxina botulínica é incrível para suavizar ruguinhas e trazer aquele ar descansado e elegante que a gente ama. Me conta uma coisa: você já fez botox antes ou essa seria a sua primeira experiência?',
      audioNote: 'Envie um áudio curto (máx 20s) com tom leve, sorriso na voz e acolhimento. Nunca passe apenas o valor numérico de imediato.',
      roonesInsight: {
        reason: 'Quando a paciente pergunta preço frio, responder apenas o número transforma seu procedimento médico em commodity comparável. A pergunta investigativa abre o canal consultivo.',
        scenarios: [
          { condition: 'Se disser que já fez antes', action: 'Pergunte o que mais gostou e o que gostaria que ficasse ainda mais sutil desta vez.' },
          { condition: 'Se for a primeira vez', action: 'Valide a insegurança, tranquilize sobre naturalidade e conduza para avaliação diagnóstica.' }
        ],
        strategicTip: 'Pacientes que buscam toxina querem jovialidade natural, não paralisia facial. Foque no benefício estético.'
      }
    }
  },
  {
    id: 'scen-2',
    procedure: 'Bioestimulador de Colágeno',
    patientQuestion: 'Achei o valor do bioestimulador alto... vou pensar e qualquer coisa te retorno.',
    izaResponse: {
      message: 'Entendo perfeitamente, é uma decisão importante e você precisa se sentir segura com ela.\n\nPara eu te ajudar melhor, o que exatamente ficou faltando para você sentir que este é o momento ideal para iniciar o tratamento?',
      audioNote: 'Tom calmo, respeitoso e consultivo. Valide a cautela da paciente e faça a pergunta aberta sem pressionar.',
      roonesInsight: {
        reason: 'A paciente não está recusando o procedimento, mas ainda não percebeu valor suficiente ou tem receio de investir sem segurança total. A pergunta investigativa identifica a causa raiz sem oferecer desconto.',
        scenarios: [
          { condition: 'Se ela falar sobre o preço novamente', action: 'Reforce os benefícios a longo prazo do bioestimulador (como a produção natural de colágeno) e pergunte o que ela busca melhorar na pele.' },
          { condition: 'Se falar sobre medo ou insegurança', action: 'Ela precisa de mais educação sobre o procedimento. Reforce a segurança e a naturalidade dos resultados.' },
          { condition: 'Se for evasiva', action: 'Pode estar comparando com outras clínicas. Mantenha a porta aberta, coloque-se à disposição para tirar dúvidas e marque um follow-up em 2 ou 3 dias.' }
        ],
        strategicTip: 'Nunca aceite a saída evasiva com um mero "fico no aguardo", e nunca ofereça desconto de imediato.'
      }
    }
  },
  {
    id: 'scen-3',
    procedure: 'Preenchimento Labial',
    patientQuestion: 'Vou pensar e qualquer coisa te chamo depois.',
    izaResponse: {
      message: 'Claro, com certeza! É super importante você se sentir 100% segura para cuidar do seu rosto. Mas me diz uma coisa: tem algum detalhe sobre o resultado ou sobre o pós-procedimento que você ainda ficou em dúvida?',
      audioNote: 'Acolhedor e sem pressão. Não tente "empurrar", mostre interesse genuíno pela dúvida oculta dela.',
      roonesInsight: {
        reason: 'O "vou pensar" é uma fuga educada da paciente quando existe uma dúvida não verbalizada (medo de dor, medo de ficar exagerado, ou orçamento).',
        scenarios: [
          { condition: 'Se revelar medo de ficar artificial', action: 'Envie depoimento ou foto de paciente com contorno sutil e refinado.' },
          { condition: 'Se for questão financeira', action: 'Apresente alternativas de parcelamento ou início com menor volume.' }
        ],
        strategicTip: 'Identifique o medo oculto antes que o lead esfrie no WhatsApp.'
      }
    }
  },
  {
    id: 'scen-4',
    procedure: 'Harmonização Facial',
    patientQuestion: 'Preciso falar com o meu marido antes de fechar.',
    izaResponse: {
      message: 'Faz todo sentido alinhar com ele! Mas me conta: se dependesse exclusivamente de você, você já começaria esse mês? O que você gostaria que ele entendesse melhor sobre a transformação que esse tratamento vai te trazer?',
      audioNote: 'Voz cúmplice e respeitosa. Valide a parceria familiar sem perder a conexão de desejo com a paciente.',
      roonesInsight: {
        reason: 'A paciente frequentemente usa o cônjuge como escudo para não assumir a responsabilidade imediata da decisão.',
        scenarios: [
          { condition: 'Se ela disser que ele acha bobagem', action: 'Ajude-a com argumentos sobre autoestima e bem-estar próprio.' },
          { condition: 'Se for orçamento familiar', action: 'Ofereça dividir no cartão ou pagar entrada no Pix e restante parcelado.' }
        ],
        strategicTip: 'Municiar a paciente para que ela consiga defender o procedimento em casa com entusiasmo.'
      }
    }
  }
];

export const OBJECTIONS_BANK: ObjectionItem[] = [
  {
    id: 'obj-1',
    code: '01',
    title: '"Está muito caro"',
    hiddenMotive: 'Ausência de referência de valor clara ou comparação linear com concorrentes inferiores.',
    scripts: {
      rapport: 'Entendo perfeitamente, quando olhamos o valor isolado parece um investimento expressivo. É natural ter essa cautela quando cuidamos de nós mesmas.',
      consultiva: 'Além do valor financeiro, o que você mais leva em conta na hora de escolher quem vai cuidar do seu rosto e da sua saúde?',
      autoridade: 'Na nossa clínica nós não abrimos mão de produtos originais importados com certificação Anvisa e aplicação por especialista pós-graduado. No rosto, a economia errada pode custar muito caro.',
      sintese: 'Se conseguirmos encaixar esse tratamento em 10x sem juros de forma bem leve no seu orçamento, você se sentiria confortável em começarmos essa semana?'
    }
  },
  {
    id: 'obj-2',
    code: '02',
    title: '"Preciso pensar com calma"',
    hiddenMotive: 'Insegurança oculta ou receio de arrependimento estético.',
    scripts: {
      rapport: 'Com certeza! É fundamental tomar essa decisão com muita tranquilidade e paz no coração.',
      consultiva: 'Para eu te ajudar nessa reflexão: o que hoje te deixa mais em dúvida? É o resultado visual, o pós-procedimento ou as formas de pagamento?',
      autoridade: 'O nosso método de avaliação mapeia cada proporção do seu rosto para que o resultado fique imperceptível para quem olha de fora, apenas com um ar mais jovial.',
      sintese: 'Posso reservar sua vaga na agenda de quinta-feira sem compromisso enquanto você pensa até amanhã ao meio-dia?'
    }
  },
  {
    id: 'obj-3',
    code: '03',
    title: '"Tenho medo de ficar artificial"',
    hiddenMotive: 'Trauma de resultados exagerados vistos na internet e receio do julgamento social.',
    scripts: {
      rapport: 'Eu amo que você me disse isso! Esse é o maior cuidado da nossa clínica e o motivo de tantas pacientes nos procurarem.',
      consultiva: 'Você prefere um resultado onde as pessoas notem que você fez algo ou aquele efeito onde todo mundo elogia que você está mais descansada e bonita sem saber o que é?',
      autoridade: 'A nossa filosofia é a estética silenciosa: menos é mais. Usamos microdoses guiadas por anatomia facial para preservar sua expressividade.',
      sintese: 'Vamos agendar sua consulta de avaliação para você ver a simulação no espelho antes de aplicar qualquer produto?'
    }
  },
  {
    id: 'obj-4',
    code: '04',
    title: '"Na outra clínica é metade do preço"',
    hiddenMotive: 'Falta de diferenciação técnica e desconhecimento da procedência dos materiais.',
    scripts: {
      rapport: 'É muito comum encontrar valores diferentes no mercado hoje em dia, e faz muito bem em pesquisar.',
      consultiva: 'Você chegou a perguntar qual a marca do produto e a quantidade exata de mililitros inclusa no orçamento deles?',
      autoridade: 'Muitas clínicas diluem o produto além do recomendado ou utilizam marcas de segunda linha. Aqui você confere o lote e a ampola lacrada na sua frente.',
      sintese: 'Vale a pena arriscar seu rosto por uma diferença pontual? Podemos flexibilizar a entrada para você fazer com total segurança conosco.'
    }
  }
];

export const COMPARISON_DATA: ComparisonItem[] = [
  {
    criterion: 'Primeiro Contato (Lead pergunta "Quanto custa?")',
    withoutIza: 'A secretária responde secamente com a tabela de preços ("Botox R$ 1.200"). A paciente visualiza, compara com a concorrência e nunca mais responde.',
    withIza: 'A secretária usa o script consultivo da Iza: acolhe a queixa, pergunta se já fez antes e conduz para avaliação sem queimar o procedimento.'
  },
  {
    criterion: 'Quando a Paciente diz "Vou pensar"',
    withoutIza: 'A atendente manda um "Ok, fico no aguardo!" e o lead de alto valor morre na gaveta do WhatsApp.',
    withIza: 'A Iza ensina a pergunta de ouro que descobre o medo oculto (medo de dor, resultado artificial ou falta de limite no cartão) e reabre o diálogo.'
  },
  {
    criterion: 'Uso de Áudios no Atendimento',
    withoutIza: 'Áudios longos, confusos, com barulho de recepção ou linguagem excessivamente técnica que assusta a paciente.',
    withIza: 'Orientação de tom de voz, pausas e postura acolhedora com scripts de até 30 segundos que geram confiança e rapport imediato.'
  },
  {
    criterion: 'Rotina de Trabalho da Recepção',
    withoutIza: 'Atendentes sobrecarregadas, improvisando mensagens no calor do momento e esquecendo follow-ups importantes.',
    withIza: 'Versão Web aberta ao lado do WhatsApp no PC com botão de cópia em 1 clique + App no bolso para respostas rápidas.'
  },
  {
    criterion: 'Treinamento de Novas Atendentes',
    withoutIza: 'Meses de tentativa e erro, perdendo dezenas de orçamentos de pacientes enquanto a nova recepcionista "aprende na prática".',
    withIza: 'Treinamento contínuo no Simulador Roleplay: a funcionária treina objeções difíceis com pacientes virtuais antes de falar com clientes reais.'
  }
];

export const PILLARS: PillarItem[] = [
  {
    number: '01',
    name: 'Pilar Rapport & Acolhimento Emocional',
    description: 'Validação genuína do momento da paciente. Elimina a sensação de que a clínica quer apenas vender e estabelece conexão imediata de confiança.',
    benefit: 'Reduz o bloqueio inicial em 70% e faz a paciente se abrir sobre suas inseguranças reais de autoestima.'
  },
  {
    number: '02',
    name: 'Pilar Abordagem Consultiva & Diagnóstico',
    description: 'Perguntas estratégicas que investigam a queixa da paciente antes de apresentar qualquer proposta financeira ou técnica.',
    benefit: 'Gera percepção de autoridade e impede que a paciente compare seu procedimento apenas pelo valor em reais.'
  },
  {
    number: '03',
    name: 'Pilar Autoridade Médica & Segurança',
    description: 'Argumentação focada em produtos de alta rastreabilidade, certificação Anvisa, técnicas avançadas e prevenção de complicações.',
    benefit: 'Desarma a concorrência desleal de preços baixos mostrando o risco real de procedimentos baratos no rosto.'
  },
  {
    number: '04',
    name: 'Pilar Síntese de Fechamento & Próximo Passo',
    description: 'Condução progressiva com opções fechadas de datas, condições inteligentes de parcelamento e reserva sem atrito.',
    benefit: 'Elimina a indecisão crônica da paciente e acelera a taxa de confirmação na agenda da clínica.'
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: 'Dra. Camila Vasconcelos',
    role: 'Dermatologista & Sócia Proprietária',
    city: 'São Paulo - SP',
    quote: 'Nossa recepção perdia quase 60% dos contatos que vinham do Instagram porque passava o valor do preenchimento e a paciente sumia. Com a Iza orientando os scripts diários, nossa taxa de agendamento de consultas dobrou no primeiro mês.',
    metric: '+114% em conversão'
  },
  {
    name: 'Dr. Leonardo Albuquerque',
    role: 'Cirurgião Plástico & Harmonização Facial',
    city: 'Belo Horizonte - MG',
    quote: 'A maior praticidade é a versão Web no computador da secretária. Ela não precisa pensar no que responder na hora da pressão: clica, copia e envia. O simulador de roleplay também ajudou muito a treinar nossa nova consultora.',
    metric: 'R$ 48.000 resgatados/mês'
  },
  {
    name: 'Juliana Mendes',
    role: 'Gestora Comercial de Rede Estética',
    city: 'Curitiba - PR',
    quote: 'A Iza não é um robozinho chato de WhatsApp, ela é o cérebro da nossa equipe. O banco de objeções com os 4 pilares deu um padrão de luxo ao nosso atendimento que as pacientes comentam na clínica.',
    metric: '92% de aprovação da equipe'
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'A Iza conversa diretamente com a minha paciente no WhatsApp?',
    answer: 'A Iza é uma ferramenta de APOIO COMERCIAL e MENTORIA INTERNA para a sua equipe. Ela não responde automaticamente à paciente (evitando gafes de robôs). Sua secretária ou consultora recebe o script ideal pronto, com orientação de tom de voz, copia com 1 clique e envia no WhatsApp.'
  },
  {
    question: 'Como funciona a versão Web e o App no celular?',
    answer: 'Perfeito para a rotina da clínica! No computador da recepção, a equipe usa a versão Web lado a lado com o WhatsApp Web. No celular, os gestores e vendedoras usam o App móvel para responder com agilidade mesmo fora do balcão ou aos finais de semana.'
  },
  {
    question: 'Serve para clínicas de quais especialidades?',
    answer: 'Foi desenvolvida sob medida para Clínicas de Estética Avançada, Dermatologia, Cirurgia Plástica, Harmonização Facial, Biomedicina Estética e Odontologia Estética que vendem procedimentos de médio e alto ticket (R$ 800 a R$ 25.000+).'
  },
  {
    question: 'Preciso trocar meu número de WhatsApp ou sistema de gestão?',
    answer: 'Não! A Iza não interfere no seu WhatsApp atual nem no seu software de agenda ou prontuário. Ela funciona como a mentora comercial de bolso da sua equipe, sem necessidade de integrações técnicas complexas.'
  },
  {
    question: 'Quanto tempo leva para a minha equipe aprender a usar?',
    answer: 'Menos de 10 minutos. A interface é extremamente limpa, intuitiva e direta ao ponto. A atendente digita a dúvida ou seleciona a objeção e o script já aparece formatado na tela com 1 clique para cópia.'
  },
  {
    question: 'Como faço para testar na minha clínica?',
    answer: 'Basta clicar no botão "Solicitar Demonstração VIP" nesta página. Nossa equipe entrará em contato para liberar o acesso personalizado e demonstrar a ferramenta na prática com os procedimentos da sua clínica.'
  }
];
